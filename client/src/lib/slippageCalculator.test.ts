import { describe, it, expect } from 'vitest';
import {
  calculateMarketOrderSlippage,
  calculateLimitOrderSlippage,
  calculateSellOrderSlippage,
  getRealisticSlippage,
  formatSlippage,
  getSlippageDescription,
} from './slippageCalculator';

describe('Slippage Calculator', () => {
  describe('calculateMarketOrderSlippage', () => {
    it('calculates lower slippage for high-price stocks', () => {
      const result = calculateMarketOrderSlippage({
        price: 200,
        quantity: 10,
        volatility: 0.5,
      });

      expect(result.slippagePercent).toBeGreaterThan(0);
      expect(result.slippagePercent).toBeLessThan(0.001); // Less than 0.1%
      expect(result.executionPrice).toBeGreaterThan(200);
    });

    it('calculates higher slippage for low-price stocks', () => {
      const result = calculateMarketOrderSlippage({
        price: 5,
        quantity: 10,
        volatility: 0.5,
      });

      expect(result.slippagePercent).toBeGreaterThan(0.0005);
    });

    it('increases slippage for large orders', () => {
      const smallOrder = calculateMarketOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.5,
      });

      const largeOrder = calculateMarketOrderSlippage({
        price: 100,
        quantity: 1000,
        volatility: 0.5,
      });

      expect(largeOrder.slippagePercent).toBeGreaterThan(smallOrder.slippagePercent);
    });

    it('increases slippage with higher volatility', () => {
      const lowVolatility = calculateMarketOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.1,
      });

      const highVolatility = calculateMarketOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.9,
      });

      expect(highVolatility.slippagePercent).toBeGreaterThan(lowVolatility.slippagePercent);
    });

    it('returns correct execution price for buy orders', () => {
      const result = calculateMarketOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.5,
      });

      const expectedPrice = 100 + result.slippageDollars;
      expect(result.executionPrice).toBeCloseTo(expectedPrice, 2);
    });
  });

  describe('calculateLimitOrderSlippage', () => {
    it('has less slippage than market orders', () => {
      const marketOrder = calculateMarketOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.5,
      });

      const limitOrder = calculateLimitOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.5,
      });

      expect(limitOrder.slippagePercent).toBeLessThan(marketOrder.slippagePercent);
      expect(limitOrder.slippagePercent).toBeCloseTo(marketOrder.slippagePercent * 0.5, 5);
    });
  });

  describe('calculateSellOrderSlippage', () => {
    it('returns negative slippage for sell orders', () => {
      const result = calculateSellOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.5,
      });

      expect(result.slippageDollars).toBeLessThan(0);
      expect(result.executionPrice).toBeLessThan(100);
    });

    it('execution price is lower than market price', () => {
      const result = calculateSellOrderSlippage({
        price: 100,
        quantity: 10,
        volatility: 0.5,
      });

      expect(result.executionPrice).toBeLessThan(100);
    });
  });

  describe('getRealisticSlippage', () => {
    it('returns market order slippage by default', () => {
      const slippage = getRealisticSlippage(100, 10);
      expect(slippage).toBeGreaterThan(0);
      expect(slippage).toBeLessThan(0.01);
    });

    it('returns lower slippage for limit orders', () => {
      const marketSlippage = getRealisticSlippage(100, 10, 'market');
      const limitSlippage = getRealisticSlippage(100, 10, 'limit');

      expect(limitSlippage).toBeLessThan(marketSlippage);
    });

    it('handles sell orders correctly', () => {
      const buySlippage = getRealisticSlippage(100, 10, 'market', 'buy');
      const sellSlippage = getRealisticSlippage(100, 10, 'market', 'sell');

      expect(buySlippage).toBeGreaterThan(0);
      expect(sellSlippage).toBeGreaterThan(0);
    });
  });

  describe('formatSlippage', () => {
    it('formats slippage as percentage string', () => {
      expect(formatSlippage(0.0001)).toBe('0.010%');
      expect(formatSlippage(0.001)).toBe('0.100%');
      expect(formatSlippage(0.01)).toBe('1.000%');
    });

    it('includes 3 decimal places', () => {
      const formatted = formatSlippage(0.00123);
      expect(formatted).toMatch(/\d+\.\d{3}%/);
    });
  });

  describe('getSlippageDescription', () => {
    it('describes negligible slippage', () => {
      const desc = getSlippageDescription(0.00005);
      expect(desc).toContain('Negligible');
    });

    it('describes very low slippage', () => {
      const desc = getSlippageDescription(0.0002);
      expect(desc).toContain('Very low');
    });

    it('describes low slippage', () => {
      const desc = getSlippageDescription(0.0007);
      expect(desc).toContain('Low');
    });

    it('describes moderate slippage', () => {
      const desc = getSlippageDescription(0.003);
      expect(desc).toContain('Moderate');
    });

    it('describes high slippage', () => {
      const desc = getSlippageDescription(0.007);
      expect(desc).toContain('High');
    });

    it('describes very high slippage', () => {
      const desc = getSlippageDescription(0.02);
      expect(desc).toContain('Very high');
    });
  });

  describe('realistic scenarios', () => {
    it('large cap stock has low slippage', () => {
      const slippage = getRealisticSlippage(250, 100, 'market', 'buy', 0.3);
      expect(slippage).toBeLessThan(0.0005);
    });

    it('penny stock has high slippage', () => {
      const slippage = getRealisticSlippage(2, 1000, 'market', 'buy', 0.8);
      expect(slippage).toBeGreaterThan(0.005);
    });

    it('small order has minimal slippage', () => {
      const slippage = getRealisticSlippage(100, 1, 'market', 'buy', 0.5);
      expect(slippage).toBeLessThan(0.0002);
    });

    it('very large order has significant slippage', () => {
      const slippage = getRealisticSlippage(100, 50000, 'market', 'buy', 0.5);
      expect(slippage).toBeGreaterThan(0.003);
    });
  });
});
