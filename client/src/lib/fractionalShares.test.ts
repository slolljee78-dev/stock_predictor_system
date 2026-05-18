import { describe, it, expect } from 'vitest';
import {
  calculateQuantityFromDollarAmount,
  calculateDollarAmount,
  validateFractionalOrder,
  executeFractionalOrder,
  formatFractionalQuantity,
  calculateAverageCostPerShare,
  calculateTotalInvestment,
} from './fractionalShares';
import { SimulatorPortfolio } from './tradingSimulatorState';

const mockPortfolio: SimulatorPortfolio = {
  id: 1,
  name: 'Test Portfolio',
  initialCapital: 10000,
  currentValue: 10000,
  cash: 5000,
  totalReturn: 0,
  totalReturnPercent: 0,
  positions: [
    {
      ticker: 'AAPL',
      quantity: 10.5,
      entryPrice: 150,
      currentPrice: 150,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      isFractional: true,
    },
  ],
  trades: [],
};

describe('Fractional Shares Trading', () => {
  describe('calculateQuantityFromDollarAmount', () => {
    it('calculates quantity from dollar amount without commission', () => {
      const quantity = calculateQuantityFromDollarAmount(1000, 100, 0);
      expect(quantity).toBe(10);
    });

    it('calculates quantity from dollar amount with commission', () => {
      const quantity = calculateQuantityFromDollarAmount(1000, 100, 0.001); // 0.1% commission
      expect(quantity).toBeCloseTo(9.99, 2);
    });

    it('handles fractional results', () => {
      const quantity = calculateQuantityFromDollarAmount(500, 150, 0);
      expect(quantity).toBeCloseTo(3.333, 3);
    });
  });

  describe('calculateDollarAmount', () => {
    it('calculates dollar amount without commission', () => {
      const amount = calculateDollarAmount(10, 100, 0);
      expect(amount).toBe(1000);
    });

    it('calculates dollar amount with commission', () => {
      const amount = calculateDollarAmount(10, 100, 0.001); // 0.1% commission
      expect(amount).toBeCloseTo(1001, 1);
    });

    it('handles fractional shares', () => {
      const amount = calculateDollarAmount(10.5, 100, 0);
      expect(amount).toBe(1050);
    });
  });

  describe('validateFractionalOrder', () => {
    it('rejects order without quantity or dollarAmount', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'AAPL',
          type: 'buy',
          price: 150,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Must specify');
    });

    it('rejects order with both quantity and dollarAmount', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'AAPL',
          type: 'buy',
          price: 150,
          quantity: 10,
          dollarAmount: 1500,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot specify both');
    });

    it('rejects buy order with insufficient cash', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'MSFT',
          type: 'buy',
          price: 300,
          quantity: 100, // 30,000 cost > 5,000 cash
        },
        mockPortfolio,
        300
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient cash');
    });

    it('rejects sell order with insufficient shares', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'AAPL',
          type: 'sell',
          price: 150,
          quantity: 100, // Only have 10.5
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient shares');
    });

    it('accepts valid buy order with quantity', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'MSFT',
          type: 'buy',
          price: 100,
          quantity: 10,
        },
        mockPortfolio,
        100
      );

      expect(result.valid).toBe(true);
    });

    it('accepts valid buy order with dollarAmount', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'MSFT',
          type: 'buy',
          price: 100,
          dollarAmount: 1000,
        },
        mockPortfolio,
        100
      );

      expect(result.valid).toBe(true);
    });

    it('accepts valid sell order', () => {
      const result = validateFractionalOrder(
        {
          ticker: 'AAPL',
          type: 'sell',
          price: 150,
          quantity: 5.5,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('executeFractionalOrder', () => {
    it('executes buy order with quantity', () => {
      const result = executeFractionalOrder(
        mockPortfolio,
        {
          ticker: 'MSFT',
          type: 'buy',
          price: 100,
          quantity: 10,
          commission: 0.001,
          slippage: 0.0005,
        },
        1
      );

      expect(result.success).toBe(true);
      expect(result.trade).toBeDefined();
      expect(result.trade?.quantity).toBe(10);
      expect(result.trade?.isFractional).toBe(false);
      expect(result.newCash).toBeLessThan(mockPortfolio.cash);
      expect(result.newPosition).toBeDefined();
    });

    it('executes buy order with dollarAmount', () => {
      const result = executeFractionalOrder(
        mockPortfolio,
        {
          ticker: 'MSFT',
          type: 'buy',
          price: 100,
          dollarAmount: 1000,
          commission: 0,
          slippage: 0,
        },
        1
      );

      expect(result.success).toBe(true);
      expect(result.trade?.quantity).toBeCloseTo(10, 1);
      expect(result.trade?.isFractional).toBe(false);
    });

    it('executes sell order', () => {
      const result = executeFractionalOrder(
        mockPortfolio,
        {
          ticker: 'AAPL',
          type: 'sell',
          price: 150,
          quantity: 5.5,
          commission: 0.001,
          slippage: 0.0005,
        },
        1
      );

      expect(result.success).toBe(true);
      expect(result.trade?.quantity).toBe(5.5);
      expect(result.trade?.isFractional).toBe(true);
      expect(result.newCash).toBeGreaterThan(mockPortfolio.cash);
      expect(result.newPosition?.quantity).toBeCloseTo(5, 1);
    });

    it('marks fractional trades correctly', () => {
      const result = executeFractionalOrder(
        mockPortfolio,
        {
          ticker: 'MSFT',
          type: 'buy',
          price: 100,
          quantity: 10.5,
        },
        1
      );

      expect(result.trade?.isFractional).toBe(true);
    });

    it('creates new position for new ticker', () => {
      const result = executeFractionalOrder(
        mockPortfolio,
        {
          ticker: 'GOOGL',
          type: 'buy',
          price: 100,
          quantity: 5,
        },
        1
      );

      expect(result.newPosition?.ticker).toBe('GOOGL');
      expect(result.newPosition?.quantity).toBe(5);
    });

    it('updates existing position for existing ticker', () => {
      const result = executeFractionalOrder(
        mockPortfolio,
        {
          ticker: 'AAPL',
          type: 'buy',
          price: 150,
          quantity: 5,
        },
        1
      );

      expect(result.newPosition?.quantity).toBeCloseTo(15.5, 1);
    });
  });

  describe('formatFractionalQuantity', () => {
    it('formats whole numbers without decimals', () => {
      expect(formatFractionalQuantity(10)).toBe('10');
    });

    it('formats fractional numbers with decimals', () => {
      const result = formatFractionalQuantity(10.5);
      expect(result).toBe('10.5');
    });

    it('removes trailing zeros', () => {
      const result = formatFractionalQuantity(10.5000);
      expect(result).toBe('10.5');
    });

    it('handles very small fractions', () => {
      const result = formatFractionalQuantity(10.0001);
      expect(result).toBe('10.0001');
    });
  });

  describe('calculateAverageCostPerShare', () => {
    it('calculates cost without commission', () => {
      const cost = calculateAverageCostPerShare(10, 100, 0);
      expect(cost).toBe(100);
    });

    it('calculates cost with commission', () => {
      const cost = calculateAverageCostPerShare(10, 100, 0.001);
      expect(cost).toBeCloseTo(100.1, 1);
    });
  });

  describe('calculateTotalInvestment', () => {
    it('calculates total investment without commission', () => {
      const total = calculateTotalInvestment(10, 100, 0);
      expect(total).toBe(1000);
    });

    it('calculates total investment with commission', () => {
      const total = calculateTotalInvestment(10, 100, 0.001);
      expect(total).toBeCloseTo(1001, 1);
    });

    it('handles fractional shares', () => {
      const total = calculateTotalInvestment(10.5, 100, 0);
      expect(total).toBe(1050);
    });
  });
});
