/**
 * Backtesting Router Tests
 * Tests for backtest input validation and configuration
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Input validation schemas matching the router
const backtestConfigSchema = z.object({
  name: z.string().min(1).max(255),
  startDate: z.date(),
  endDate: z.date(),
  initialCapital: z.number().positive(),
  stockIds: z.array(z.number()),
  filterSettings: z.object({
    minConfidence: z.number().min(0).max(100),
    maxVIX: z.number().positive(),
    maxCorrelation: z.number().min(0).max(1),
    maxDailyLoss: z.number().min(0).max(10),
  }),
});

describe('Backtest Input Validation', () => {
  describe('Basic Configuration', () => {
    it('should accept valid backtest configuration', () => {
      const validConfig = {
        name: 'Test Backtest',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        initialCapital: 10000,
        stockIds: [1, 2, 3],
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(validConfig)).not.toThrow();
    });

    it('should reject empty backtest name', () => {
      const invalidConfig = {
        name: '',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        initialCapital: 10000,
        stockIds: [1],
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject name longer than 255 characters', () => {
      const invalidConfig = {
        name: 'a'.repeat(256),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        initialCapital: 10000,
        stockIds: [1],
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject negative initial capital', () => {
      const invalidConfig = {
        name: 'Test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        initialCapital: -10000,
        stockIds: [1],
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject zero initial capital', () => {
      const invalidConfig = {
        name: 'Test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        initialCapital: 0,
        stockIds: [1],
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe('Filter Settings Validation', () => {
    const validBaseConfig = {
      name: 'Test',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      initialCapital: 10000,
      stockIds: [1],
    };

    it('should accept valid filter settings', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject confidence below 0', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: -10,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should reject confidence above 100', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 150,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should accept confidence at boundaries', () => {
      const config0 = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 0,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      const config100 = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 100,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config0)).not.toThrow();
      expect(() => backtestConfigSchema.parse(config100)).not.toThrow();
    });

    it('should reject negative VIX', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: -5,
          maxCorrelation: 0.8,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should reject correlation below 0', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: -0.5,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should reject correlation above 1', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 1.5,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should accept correlation at boundaries', () => {
      const config0 = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0,
          maxDailyLoss: 2,
        },
      };

      const config1 = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 1,
          maxDailyLoss: 2,
        },
      };

      expect(() => backtestConfigSchema.parse(config0)).not.toThrow();
      expect(() => backtestConfigSchema.parse(config1)).not.toThrow();
    });

    it('should reject daily loss below 0', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: -1,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should reject daily loss above 10', () => {
      const config = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 15,
        },
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should accept daily loss at boundaries', () => {
      const config0 = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 0,
        },
      };

      const config10 = {
        ...validBaseConfig,
        filterSettings: {
          minConfidence: 60,
          maxVIX: 30,
          maxCorrelation: 0.8,
          maxDailyLoss: 10,
        },
      };

      expect(() => backtestConfigSchema.parse(config0)).not.toThrow();
      expect(() => backtestConfigSchema.parse(config10)).not.toThrow();
    });
  });

  describe('Stock Selection', () => {
    const validBaseConfig = {
      name: 'Test',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      initialCapital: 10000,
      filterSettings: {
        minConfidence: 60,
        maxVIX: 30,
        maxCorrelation: 0.8,
        maxDailyLoss: 2,
      },
    };

    it('should accept empty stock list', () => {
      const config = {
        ...validBaseConfig,
        stockIds: [],
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });

    it('should accept multiple stocks', () => {
      const config = {
        ...validBaseConfig,
        stockIds: [1, 2, 3, 4, 5],
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });

    it('should accept single stock', () => {
      const config = {
        ...validBaseConfig,
        stockIds: [1],
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });
  });

  describe('Date Validation', () => {
    const validBaseConfig = {
      name: 'Test',
      initialCapital: 10000,
      stockIds: [1],
      filterSettings: {
        minConfidence: 60,
        maxVIX: 30,
        maxCorrelation: 0.8,
        maxDailyLoss: 2,
      },
    };

    it('should accept valid date range', () => {
      const config = {
        ...validBaseConfig,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });

    it('should accept same start and end date', () => {
      const config = {
        ...validBaseConfig,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });

    it('should accept end date before start date', () => {
      // Schema doesn't validate date order - that's business logic
      const config = {
        ...validBaseConfig,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
      };

      expect(() => backtestConfigSchema.parse(config)).not.toThrow();
    });
  });

  describe('Type Validation', () => {
    const validBaseConfig = {
      name: 'Test',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      initialCapital: 10000,
      stockIds: [1],
      filterSettings: {
        minConfidence: 60,
        maxVIX: 30,
        maxCorrelation: 0.8,
        maxDailyLoss: 2,
      },
    };

    it('should reject non-string name', () => {
      const config = {
        ...validBaseConfig,
        name: 123,
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should reject non-number initial capital', () => {
      const config = {
        ...validBaseConfig,
        initialCapital: '10000',
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });

    it('should reject non-array stock IDs', () => {
      const config = {
        ...validBaseConfig,
        stockIds: '1,2,3',
      };

      expect(() => backtestConfigSchema.parse(config)).toThrow();
    });
  });
});
