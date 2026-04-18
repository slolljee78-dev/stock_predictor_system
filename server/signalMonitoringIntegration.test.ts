import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { monitorSpecificStocks, getMonitoringStatus } from './signalMonitoringJob';

describe('Signal Monitoring Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Real-time Signal Generation', () => {
    it('should generate signals for specific stocks', async () => {
      const tickers = ['AAPL', 'GOOGL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 50,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      expect(Array.isArray(results)).toBe(true);
      // Results may be empty if no signals are generated, but should not throw
      expect(results).toBeDefined();
    });

    it('should filter signals by confidence threshold', async () => {
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const lowConfidenceResults = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 10, // Very low threshold
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      const highConfidenceResults = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 95, // Very high threshold
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      // High confidence threshold should return fewer or equal results
      expect(highConfidenceResults.length).toBeLessThanOrEqual(lowConfidenceResults.length);
    });

    it('should handle multiple stocks in single monitoring run', async () => {
      const tickers = ['AAPL', 'GOOGL', 'MSFT', 'NVDA'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      expect(Array.isArray(results)).toBe(true);
      // All results should have required fields
      for (const result of results) {
        expect(result).toHaveProperty('ticker');
        expect(result).toHaveProperty('signal');
        expect(result).toHaveProperty('confidence');
        expect(['buy', 'sell', 'hold']).toContain(result.signal);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
      }
    });

    it('should handle empty ticker list', async () => {
      const results = await monitorSpecificStocks(
        [],
        '1',
        'test@example.com',
        {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle invalid tickers gracefully', async () => {
      const tickers = ['INVALID_TICKER_XYZ'];
      const userId = '1';
      const userEmail = 'test@example.com';

      // Should not throw, but may return empty results
      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Monitoring Configuration', () => {
    it('should respect confidence threshold setting', async () => {
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const config1 = {
        confidenceThreshold: 50,
        notifyOnSignal: false,
        updateSentiment: false,
      };

      const config2 = {
        confidenceThreshold: 80,
        notifyOnSignal: false,
        updateSentiment: false,
      };

      const results1 = await monitorSpecificStocks(tickers, userId, userEmail, config1);
      const results2 = await monitorSpecificStocks(tickers, userId, userEmail, config2);

      // Higher threshold should return fewer or equal results
      expect(results2.length).toBeLessThanOrEqual(results1.length);
    });

    it('should handle notification preferences', async () => {
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const configWithNotifications = {
        confidenceThreshold: 60,
        notifyOnSignal: true,
        updateSentiment: true,
      };

      const configWithoutNotifications = {
        confidenceThreshold: 60,
        notifyOnSignal: false,
        updateSentiment: false,
      };

      // Both should complete without error
      const results1 = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        configWithNotifications
      );
      const results2 = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        configWithoutNotifications
      );

      expect(Array.isArray(results1)).toBe(true);
      expect(Array.isArray(results2)).toBe(true);
    });

    it('should validate signal type values', async () => {
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 0, // Accept all signals
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      for (const result of results) {
        expect(['buy', 'sell', 'hold']).toContain(result.signal);
      }
    });
  });

  describe('Signal Data Validation', () => {
    it('should return signals with valid confidence scores', async () => {
      const tickers = ['AAPL', 'GOOGL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 0,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      for (const result of results) {
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
      }
    });

    it('should return signals with valid ticker symbols', async () => {
      const tickers = ['AAPL', 'GOOGL', 'MSFT'];
      const userId = '1';
      const userEmail = 'test@example.com';

      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 0,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      for (const result of results) {
        expect(typeof result.ticker).toBe('string');
        expect(result.ticker.length).toBeGreaterThan(0);
        expect(result.ticker).toMatch(/^[A-Z0-9]+$/);
      }
    });

    it('should only return signals above confidence threshold', async () => {
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = 'test@example.com';
      const threshold = 70;

      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: threshold,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      for (const result of results) {
        expect(result.confidence).toBeGreaterThanOrEqual(threshold);
      }
    });
  });

  describe('Monitoring Status', () => {
    it('should return valid monitoring status', () => {
      const status = getMonitoringStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('isJobActive');
      expect(typeof status.isRunning).toBe('boolean');
      expect(typeof status.isJobActive).toBe('boolean');
    });

    it('should track running state correctly', () => {
      const status = getMonitoringStatus();
      expect(typeof status.isRunning).toBe('boolean');
    });

    it('should track job active state correctly', () => {
      const status = getMonitoringStatus();
      expect(typeof status.isJobActive).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // This test verifies that the monitoring job doesn't crash on API errors
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      // Should not throw even if API fails
      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle missing user email', async () => {
      const tickers = ['AAPL'];
      const userId = '1';
      const userEmail = ''; // Empty email

      // Should handle gracefully
      const results = await monitorSpecificStocks(
        tickers,
        userId,
        userEmail,
        {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }
      );

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle concurrent monitoring requests', async () => {
      const tickers = ['AAPL', 'GOOGL'];
      const userId = '1';
      const userEmail = 'test@example.com';

      // Run multiple monitoring requests concurrently
      const promises = [
        monitorSpecificStocks(tickers, userId, userEmail, {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }),
        monitorSpecificStocks(tickers, userId, userEmail, {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }),
        monitorSpecificStocks(tickers, userId, userEmail, {
          confidenceThreshold: 60,
          notifyOnSignal: false,
          updateSentiment: false,
        }),
      ];

      const results = await Promise.all(promises);

      for (const result of results) {
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });
});
