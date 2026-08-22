import { beforeEach, describe, expect, it } from 'vitest';
import {
  executePendingOrders,
  addPendingOrder,
  cancelPendingOrder,
  getActivePendingOrders,
  validatePendingOrder,
  calculateExecutionPrice,
} from './pendingOrderExecutor';
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
      quantity: 10,
      entryPrice: 150,
      currentPrice: 150,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
    },
  ],
  trades: [],
  pendingOrders: [],
};

describe('Pending Order Executor', () => {
  beforeEach(() => {
    mockPortfolio.pendingOrders = [];
    mockPortfolio.trades = [];
  });

  describe('executePendingOrders', () => {
    it('executes buy limit order when price drops below limit', () => {
      const portfolio = { ...mockPortfolio };
      addPendingOrder(portfolio, {
        ticker: 'MSFT',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 300,
      });

      const result = executePendingOrders(portfolio, { MSFT: 295 });

      expect(result.executedOrders).toHaveLength(1);
      expect(result.executedOrders[0].ticker).toBe('MSFT');
      expect(result.executedOrders[0].type).toBe('buy');
      expect(result.executedOrders[0].price).toBe(295);
    });

    it('executes sell limit order when price rises above limit', () => {
      const portfolio = { ...mockPortfolio };
      addPendingOrder(portfolio, {
        ticker: 'AAPL',
        type: 'sell',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 160,
      });

      const result = executePendingOrders(portfolio, { AAPL: 165 });

      expect(result.executedOrders).toHaveLength(1);
      expect(result.executedOrders[0].type).toBe('sell');
      expect(result.executedOrders[0].price).toBe(165);
    });

    it('executes stop-loss order when price drops below stop', () => {
      const portfolio = { ...mockPortfolio };
      addPendingOrder(portfolio, {
        ticker: 'AAPL',
        type: 'sell',
        orderType: 'stop-loss',
        quantity: 5,
        stopPrice: 140,
      });

      const result = executePendingOrders(portfolio, { AAPL: 135 });

      expect(result.executedOrders).toHaveLength(1);
      expect(result.executedOrders[0].type).toBe('sell');
      expect(result.executedOrders[0].price).toBe(135);
    });

    it('does not execute order when price condition not met', () => {
      const portfolio = { ...mockPortfolio };
      addPendingOrder(portfolio, {
        ticker: 'MSFT',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 300,
      });

      const result = executePendingOrders(portfolio, { MSFT: 310 });

      expect(result.executedOrders).toHaveLength(0);
      expect(result.updatedPendingOrders).toHaveLength(1);
    });

    it('handles missing price data gracefully', () => {
      const portfolio = { ...mockPortfolio };
      addPendingOrder(portfolio, {
        ticker: 'UNKNOWN',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 100,
      });

      const result = executePendingOrders(portfolio, {});

      expect(result.executedOrders).toHaveLength(0);
      expect(result.updatedPendingOrders).toHaveLength(1);
    });
  });

  describe('addPendingOrder', () => {
    it('adds a new pending order with auto-incremented ID', () => {
      const portfolio = { ...mockPortfolio };

      const order1 = addPendingOrder(portfolio, {
        ticker: 'AAPL',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 150,
      });

      const order2 = addPendingOrder(portfolio, {
        ticker: 'MSFT',
        type: 'sell',
        orderType: 'stop-loss',
        quantity: 3,
        stopPrice: 300,
      });

      expect(order1.id).toBe(1);
      expect(order2.id).toBe(2);
      expect(portfolio.pendingOrders).toHaveLength(2);
    });

    it('sets correct status and createdAt', () => {
      const portfolio = { ...mockPortfolio };
      const order = addPendingOrder(portfolio, {
        ticker: 'AAPL',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 150,
      });

      expect(order.status).toBe('pending');
      expect(order.createdAt).toBeTruthy();
    });
  });

  describe('cancelPendingOrder', () => {
    it('cancels an existing pending order', () => {
      const portfolio = { ...mockPortfolio };
      const order = addPendingOrder(portfolio, {
        ticker: 'AAPL',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 150,
      });

      const result = cancelPendingOrder(portfolio, order.id);

      expect(result).toBe(true);
      expect(portfolio.pendingOrders![0].status).toBe('cancelled');
    });

    it('returns false for non-existent order', () => {
      const portfolio = { ...mockPortfolio };
      const result = cancelPendingOrder(portfolio, 999);

      expect(result).toBe(false);
    });
  });

  describe('getActivePendingOrders', () => {
    it('returns only pending orders, not cancelled ones', () => {
      const portfolio = { ...mockPortfolio };

      const order1 = addPendingOrder(portfolio, {
        ticker: 'AAPL',
        type: 'buy',
        orderType: 'limit',
        quantity: 5,
        limitPrice: 150,
      });

      const order2 = addPendingOrder(portfolio, {
        ticker: 'MSFT',
        type: 'sell',
        orderType: 'stop-loss',
        quantity: 3,
        stopPrice: 300,
      });

      cancelPendingOrder(portfolio, order1.id);

      const active = getActivePendingOrders(portfolio);

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(order2.id);
    });
  });

  describe('validatePendingOrder', () => {
    it('rejects zero or negative quantity', () => {
      const result = validatePendingOrder(
        {
          ticker: 'AAPL',
          type: 'buy',
          orderType: 'limit',
          quantity: 0,
          limitPrice: 150,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Quantity');
    });

    it('rejects buy limit price significantly above current price', () => {
      const result = validatePendingOrder(
        {
          ticker: 'AAPL',
          type: 'buy',
          orderType: 'limit',
          quantity: 5,
          limitPrice: 200, // 33% above current price of 150
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('10%');
    });

    it('rejects sell limit price significantly below current price', () => {
      const result = validatePendingOrder(
        {
          ticker: 'AAPL',
          type: 'sell',
          orderType: 'limit',
          quantity: 5,
          limitPrice: 130, // 13% below current price of 150
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('10%');
    });

    it('rejects stop price above current price', () => {
      const result = validatePendingOrder(
        {
          ticker: 'AAPL',
          type: 'sell',
          orderType: 'stop-loss',
          quantity: 5,
          stopPrice: 160,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('below');
    });

    it('rejects buy order if insufficient cash', () => {
      const result = validatePendingOrder(
        {
          ticker: 'MSFT',
          type: 'buy',
          orderType: 'limit',
          quantity: 1000,
          limitPrice: 100,
        },
        mockPortfolio,
        100
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient cash');
    });

    it('rejects sell order if insufficient shares', () => {
      const result = validatePendingOrder(
        {
          ticker: 'AAPL',
          type: 'sell',
          orderType: 'limit',
          quantity: 100, // Only have 10
          limitPrice: 160,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient shares');
    });

    it('accepts valid buy limit order', () => {
      const result = validatePendingOrder(
        {
          ticker: 'MSFT',
          type: 'buy',
          orderType: 'limit',
          quantity: 5,
          limitPrice: 300,
        },
        mockPortfolio,
        310
      );

      expect(result.valid).toBe(true);
    });

    it('accepts valid stop-loss order', () => {
      const result = validatePendingOrder(
        {
          ticker: 'AAPL',
          type: 'sell',
          orderType: 'stop-loss',
          quantity: 5,
          stopPrice: 140,
        },
        mockPortfolio,
        150
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('calculateExecutionPrice', () => {
    it('calculates buy price with commission and slippage', () => {
      const price = calculateExecutionPrice(100, 'buy', 0.001, 0.0005);

      // 100 + (100 * 0.0005) + (100 * 0.001) = 100 + 0.05 + 0.1 = 100.15
      expect(price).toBeCloseTo(100.15, 2);
    });

    it('calculates sell price with commission and slippage', () => {
      const price = calculateExecutionPrice(100, 'sell', 0.001, 0.0005);

      // 100 - (100 * 0.0005) - (100 * 0.001) = 100 - 0.05 - 0.1 = 99.85
      expect(price).toBeCloseTo(99.85, 2);
    });

    it('uses default commission and slippage values', () => {
      const price = calculateExecutionPrice(100, 'buy');

      // Should use defaults: 0.1% commission, 0.05% slippage
      expect(price).toBeCloseTo(100.15, 2);
    });
  });
});
