import { describe, it, expect } from 'vitest';
import { calculateAllIndicators } from './indicators';

describe('Stock Predictor System E2E Tests', () => {
  describe('Technical Indicators', () => {
    it('should calculate indicators without errors', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5);
      const indicators = calculateAllIndicators(prices);

      expect(indicators).toBeDefined();
      expect(typeof indicators).toBe('object');
    });

    it('should handle various price patterns', () => {
      // Uptrend
      const uptrendPrices = Array.from({ length: 30 }, (_, i) => 100 + i * 1);
      const uptrendIndicators = calculateAllIndicators(uptrendPrices);
      expect(uptrendIndicators).toBeDefined();

      // Downtrend
      const downtrendPrices = Array.from({ length: 30 }, (_, i) => 100 - i * 1);
      const downtrendIndicators = calculateAllIndicators(downtrendPrices);
      expect(downtrendIndicators).toBeDefined();

      // Sideways
      const sidewaysPrices = Array.from({ length: 30 }, () => 100);
      const sidewaysIndicators = calculateAllIndicators(sidewaysPrices);
      expect(sidewaysIndicators).toBeDefined();
    });

    it('should handle edge cases', () => {
      // Empty array
      const emptyIndicators = calculateAllIndicators([]);
      expect(emptyIndicators).toBeDefined();

      // Single price
      const singleIndicators = calculateAllIndicators([100]);
      expect(singleIndicators).toBeDefined();

      // Two prices
      const twoIndicators = calculateAllIndicators([100, 101]);
      expect(twoIndicators).toBeDefined();
    });

    it('should handle price volatility', () => {
      // High volatility
      const volatilePrices = Array.from({ length: 30 }, (_, i) => 
        100 + Math.sin(i * 0.5) * 20
      );
      const volatileIndicators = calculateAllIndicators(volatilePrices);
      expect(volatileIndicators).toBeDefined();

      // Low volatility
      const stablePrices = Array.from({ length: 30 }, () => 100.1);
      const stableIndicators = calculateAllIndicators(stablePrices);
      expect(stableIndicators).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should handle extreme price values', () => {
      const extremePrices = [0.01, 1000000, 50, 100, 150];
      const indicators = calculateAllIndicators(extremePrices);
      expect(indicators).toBeDefined();
    });

    it('should handle negative prices gracefully', () => {
      const negativePrices = [-100, -50, 0, 50, 100];
      const indicators = calculateAllIndicators(negativePrices);
      expect(indicators).toBeDefined();
    });

    it('should handle large datasets', () => {
      const largePrices = Array.from({ length: 1000 }, (_, i) => 100 + Math.sin(i * 0.01) * 10);
      const indicators = calculateAllIndicators(largePrices);
      expect(indicators).toBeDefined();
    });
  });

  describe('System Integration', () => {
    it('should process multiple stocks independently', () => {
      const stock1Prices = Array.from({ length: 20 }, (_, i) => 100 + i);
      const stock2Prices = Array.from({ length: 20 }, (_, i) => 50 - i);

      const indicators1 = calculateAllIndicators(stock1Prices);
      const indicators2 = calculateAllIndicators(stock2Prices);

      expect(indicators1).toBeDefined();
      expect(indicators2).toBeDefined();
      // Both should be valid objects
      expect(typeof indicators1).toBe('object');
      expect(typeof indicators2).toBe('object');
    });

    it('should maintain consistency across calls', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.1) * 5);

      const result1 = calculateAllIndicators(prices);
      const result2 = calculateAllIndicators(prices);

      // Same input should produce same output
      expect(result1).toEqual(result2);
    });
  });

  describe('Performance', () => {
    it('should calculate indicators efficiently', () => {
      const prices = Array.from({ length: 500 }, (_, i) => 100 + Math.sin(i * 0.01) * 10);

      const startTime = Date.now();
      calculateAllIndicators(prices);
      const endTime = Date.now();

      // Should complete in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
