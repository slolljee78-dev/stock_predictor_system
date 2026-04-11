import { describe, it, expect } from 'vitest';
import {
  calculateCommission,
  calculateSlippage,
  executeBuyTrade,
  executeSellTrade,
  calculatePortfolioMetrics,
  calculateSharpeRatio,
  calculateMaxDrawdown,
  validateTradeParameters,
  DEFAULT_CONFIG,
} from './simulatorEngine';

describe('Trading Simulator Engine', () => {
  describe('Commission Calculation', () => {
    it('should calculate commission correctly', () => {
      const commission = calculateCommission(10, 100);
      expect(commission).toBeGreaterThan(0);
      expect(commission).toBeLessThan(10 * 100 * 0.01); // Less than 1% of trade value
    });

    it('should apply minimum commission', () => {
      const commission = calculateCommission(1, 1); // Very small trade
      expect(commission).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minCommission);
    });
  });

  describe('Slippage Calculation', () => {
    it('should increase price for buy trades', () => {
      const originalPrice = 100;
      const slippagePrice = calculateSlippage(originalPrice, 'buy');
      expect(slippagePrice).toBeGreaterThan(originalPrice);
    });

    it('should decrease price for sell trades', () => {
      const originalPrice = 100;
      const slippagePrice = calculateSlippage(originalPrice, 'sell');
      expect(slippagePrice).toBeLessThan(originalPrice);
    });
  });

  describe('Buy Trade Execution', () => {
    it('should execute buy trade successfully', () => {
      const portfolio = {
        cash: 10000,
        positions: new Map(),
      };

      const result = executeBuyTrade(portfolio, 'AAPL', 10, 100);

      expect(result.success).toBe(true);
      expect(result.executedPrice).toBeDefined();
      expect(result.commission).toBeDefined();
      expect(portfolio.cash).toBeLessThan(10000);
      expect(portfolio.positions.has('AAPL')).toBe(true);
    });

    it('should reject buy trade with insufficient cash', () => {
      const portfolio = {
        cash: 100,
        positions: new Map(),
      };

      const result = executeBuyTrade(portfolio, 'AAPL', 100, 100);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient cash');
    });

    it('should average up on multiple buys', () => {
      const portfolio = {
        cash: 10000,
        positions: new Map(),
      };

      executeBuyTrade(portfolio, 'AAPL', 10, 100);
      const position1 = portfolio.positions.get('AAPL');
      const initialEntryPrice = position1?.entryPrice;

      executeBuyTrade(portfolio, 'AAPL', 10, 110);
      const position2 = portfolio.positions.get('AAPL');

      expect(position2?.quantity).toBe(20);
      expect(position2?.entryPrice).toBeGreaterThan(initialEntryPrice!);
    });
  });

  describe('Sell Trade Execution', () => {
    it('should execute sell trade successfully', () => {
      const portfolio = {
        cash: 10000,
        positions: new Map(),
      };

      executeBuyTrade(portfolio, 'AAPL', 10, 100);
      const cashAfterBuy = portfolio.cash;

      const result = executeSellTrade(portfolio, 'AAPL', 5, 105);

      expect(result.success).toBe(true);
      expect(portfolio.cash).toBeGreaterThan(cashAfterBuy);
      expect(portfolio.positions.get('AAPL')?.quantity).toBe(5);
    });

    it('should reject sell trade with no position', () => {
      const portfolio = {
        cash: 10000,
        positions: new Map(),
      };

      const result = executeSellTrade(portfolio, 'AAPL', 10, 100);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No position');
    });

    it('should reject sell trade with insufficient shares', () => {
      const portfolio = {
        cash: 10000,
        positions: new Map(),
      };

      executeBuyTrade(portfolio, 'AAPL', 10, 100);
      const result = executeSellTrade(portfolio, 'AAPL', 20, 100);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient shares');
    });

    it('should close position when selling all shares', () => {
      const portfolio = {
        cash: 10000,
        positions: new Map(),
      };

      executeBuyTrade(portfolio, 'AAPL', 10, 100);
      executeSellTrade(portfolio, 'AAPL', 10, 105);

      expect(portfolio.positions.has('AAPL')).toBe(false);
    });
  });

  describe('Sharpe Ratio Calculation', () => {
    it('should calculate Sharpe ratio for returns', () => {
      const returns = [0.01, 0.02, -0.01, 0.015, 0.025];
      const sharpeRatio = calculateSharpeRatio(returns);

      expect(sharpeRatio).toBeDefined();
      expect(typeof sharpeRatio).toBe('number');
    });

    it('should return 0 for insufficient data', () => {
      const sharpeRatio = calculateSharpeRatio([0.01]);
      expect(sharpeRatio).toBe(0);
    });

    it('should return 0 for zero volatility', () => {
      const returns = [0.01, 0.01, 0.01];
      const sharpeRatio = calculateSharpeRatio(returns);
      expect(sharpeRatio).toBe(0);
    });
  });

  describe('Maximum Drawdown Calculation', () => {
    it('should calculate max drawdown correctly', () => {
      const values = [100, 110, 105, 95, 100, 120];
      const maxDrawdown = calculateMaxDrawdown(values);

      expect(maxDrawdown).toBeGreaterThan(0);
      expect(maxDrawdown).toBeLessThanOrEqual(100);
    });

    it('should return 0 for increasing values', () => {
      const values = [100, 110, 120, 130];
      const maxDrawdown = calculateMaxDrawdown(values);
      expect(maxDrawdown).toBe(0);
    });

    it('should handle insufficient data', () => {
      const maxDrawdown = calculateMaxDrawdown([100]);
      expect(maxDrawdown).toBe(0);
    });
  });

  describe('Trade Validation', () => {
    it('should validate positive quantity', () => {
      const result = validateTradeParameters(10, 100);
      expect(result.valid).toBe(true);
    });

    it('should reject zero quantity', () => {
      const result = validateTradeParameters(0, 100);
      expect(result.valid).toBe(false);
    });

    it('should reject negative price', () => {
      const result = validateTradeParameters(10, -100);
      expect(result.valid).toBe(false);
    });

    it('should reject non-finite values', () => {
      const result = validateTradeParameters(Infinity, 100);
      expect(result.valid).toBe(false);
    });
  });

  describe('Portfolio Metrics', () => {
    it('should calculate portfolio metrics', () => {
      const portfolio = {
        cash: 5000,
        initialCapital: 10000,
        positions: new Map(),
        trades: [],
        performanceHistory: [1, 1.01, 1.015, 1.01],
      };

      const metrics = calculatePortfolioMetrics(portfolio);

      expect(metrics.totalValue).toBeDefined();
      expect(metrics.totalReturn).toBeDefined();
      expect(metrics.totalReturnPercent).toBeDefined();
      expect(metrics.sharpeRatio).toBeDefined();
      expect(metrics.maxDrawdown).toBeDefined();
    });
  });
});
