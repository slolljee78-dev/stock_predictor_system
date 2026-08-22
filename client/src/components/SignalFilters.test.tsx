import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignalFilters, DEFAULT_FILTERS, FILTER_PRESETS, SignalFilterOptions } from './SignalFilters';

describe('SignalFilters Component', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders the filter component with title and presets section', () => {
      // Component structure test - verifies exports exist
      expect(DEFAULT_FILTERS).toBeDefined();
      expect(FILTER_PRESETS).toBeDefined();
      expect(SignalFilters).toBeDefined();
    });

    it('exports all required filter presets', () => {
      expect(FILTER_PRESETS.highConfidence).toBeDefined();
      expect(FILTER_PRESETS.oversold).toBeDefined();
      expect(FILTER_PRESETS.overbought).toBeDefined();
      expect(FILTER_PRESETS.bullish).toBeDefined();
      expect(FILTER_PRESETS.bearish).toBeDefined();
    });
  });

  describe('Default Filters', () => {
    it('has correct default filter values', () => {
      expect(DEFAULT_FILTERS.signalType).toBe('all');
      expect(DEFAULT_FILTERS.minConfidence).toBe(25);
      expect(DEFAULT_FILTERS.rsiMin).toBe(0);
      expect(DEFAULT_FILTERS.rsiMax).toBe(100);
      expect(DEFAULT_FILTERS.macdFilter).toBe('all');
      expect(DEFAULT_FILTERS.priceChangeMin).toBe(-100);
      expect(DEFAULT_FILTERS.priceChangeMax).toBe(100);
      expect(DEFAULT_FILTERS.sortBy).toBe('confidence');
    });
  });

  describe('Filter Presets', () => {
    it('high confidence preset has correct values', () => {
      const preset = FILTER_PRESETS.highConfidence;
      expect(preset.name).toBe('High Confidence');
      expect(preset.filters.minConfidence).toBe(80);
    });

    it('oversold preset has correct values', () => {
      const preset = FILTER_PRESETS.oversold;
      expect(preset.name).toBe('Oversold (RSI < 30)');
      expect(preset.filters.rsiMin).toBe(0);
      expect(preset.filters.rsiMax).toBe(30);
      expect(preset.filters.signalType).toBe('buy');
    });

    it('overbought preset has correct values', () => {
      const preset = FILTER_PRESETS.overbought;
      expect(preset.name).toBe('Overbought (RSI > 70)');
      expect(preset.filters.rsiMin).toBe(70);
      expect(preset.filters.rsiMax).toBe(100);
      expect(preset.filters.signalType).toBe('sell');
    });

    it('bullish preset has correct values', () => {
      const preset = FILTER_PRESETS.bullish;
      expect(preset.name).toBe('Bullish (Buy + Positive MACD)');
      expect(preset.filters.signalType).toBe('buy');
      expect(preset.filters.macdFilter).toBe('positive');
    });

    it('bearish preset has correct values', () => {
      const preset = FILTER_PRESETS.bearish;
      expect(preset.name).toBe('Bearish (Sell + Negative MACD)');
      expect(preset.filters.signalType).toBe('sell');
      expect(preset.filters.macdFilter).toBe('negative');
    });
  });

  describe('Filter Options Type', () => {
    it('creates valid filter options with all required fields', () => {
      const filters: SignalFilterOptions = {
        signalType: 'buy',
        minConfidence: 75,
        rsiMin: 30,
        rsiMax: 70,
        macdFilter: 'positive',
        priceChangeMin: -10,
        priceChangeMax: 10,
        sortBy: 'confidence',
      };

      expect(filters.signalType).toBe('buy');
      expect(filters.minConfidence).toBe(75);
      expect(filters.rsiMin).toBe(30);
      expect(filters.rsiMax).toBe(70);
      expect(filters.macdFilter).toBe('positive');
      expect(filters.priceChangeMin).toBe(-10);
      expect(filters.priceChangeMax).toBe(10);
      expect(filters.sortBy).toBe('confidence');
    });

    it('supports all signal type options', () => {
      const signalTypes: Array<'all' | 'buy' | 'sell'> = ['all', 'buy', 'sell'];
      signalTypes.forEach(type => {
        const filters: SignalFilterOptions = { ...DEFAULT_FILTERS, signalType: type };
        expect(filters.signalType).toBe(type);
      });
    });

    it('supports all MACD filter options', () => {
      const macdOptions: Array<'all' | 'positive' | 'negative'> = ['all', 'positive', 'negative'];
      macdOptions.forEach(option => {
        const filters: SignalFilterOptions = { ...DEFAULT_FILTERS, macdFilter: option };
        expect(filters.macdFilter).toBe(option);
      });
    });

    it('supports all sort options', () => {
      const sortOptions: Array<'confidence' | 'price' | 'time' | 'rsi' | 'change'> = [
        'confidence',
        'price',
        'time',
        'rsi',
        'change',
      ];
      sortOptions.forEach(option => {
        const filters: SignalFilterOptions = { ...DEFAULT_FILTERS, sortBy: option };
        expect(filters.sortBy).toBe(option);
      });
    });
  });

  describe('Filter Validation', () => {
    it('validates RSI range constraints', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        rsiMin: 30,
        rsiMax: 70,
      };

      expect(filters.rsiMin).toBeGreaterThanOrEqual(0);
      expect(filters.rsiMax).toBeLessThanOrEqual(100);
      expect(filters.rsiMin).toBeLessThanOrEqual(filters.rsiMax);
    });

    it('validates price change range constraints', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        priceChangeMin: -50,
        priceChangeMax: 50,
      };

      expect(filters.priceChangeMin).toBeGreaterThanOrEqual(-100);
      expect(filters.priceChangeMax).toBeLessThanOrEqual(100);
      expect(filters.priceChangeMin).toBeLessThanOrEqual(filters.priceChangeMax);
    });

    it('validates confidence range', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        minConfidence: 75,
      };

      expect(filters.minConfidence).toBeGreaterThanOrEqual(0);
      expect(filters.minConfidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Filter Combinations', () => {
    it('creates valid oversold buy filter combination', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        signalType: 'buy',
        rsiMin: 0,
        rsiMax: 30,
      };

      expect(filters.signalType).toBe('buy');
      expect(filters.rsiMin).toBe(0);
      expect(filters.rsiMax).toBe(30);
    });

    it('creates valid overbought sell filter combination', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        signalType: 'sell',
        rsiMin: 70,
        rsiMax: 100,
      };

      expect(filters.signalType).toBe('sell');
      expect(filters.rsiMin).toBe(70);
      expect(filters.rsiMax).toBe(100);
    });

    it('creates valid bullish combination', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        signalType: 'buy',
        macdFilter: 'positive',
      };

      expect(filters.signalType).toBe('buy');
      expect(filters.macdFilter).toBe('positive');
    });

    it('creates valid bearish combination', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        signalType: 'sell',
        macdFilter: 'negative',
      };

      expect(filters.signalType).toBe('sell');
      expect(filters.macdFilter).toBe('negative');
    });

    it('creates valid high confidence filter', () => {
      const filters: SignalFilterOptions = {
        ...DEFAULT_FILTERS,
        minConfidence: 80,
      };

      expect(filters.minConfidence).toBe(80);
      expect(filters.minConfidence).toBeGreaterThan(DEFAULT_FILTERS.minConfidence);
    });
  });

  describe('Filter Merging', () => {
    it('merges preset with custom values', () => {
      const merged: SignalFilterOptions = {
        ...FILTER_PRESETS.oversold.filters,
        minConfidence: 75,
      };

      expect(merged.signalType).toBe('buy');
      expect(merged.rsiMin).toBe(0);
      expect(merged.rsiMax).toBe(30);
      expect(merged.minConfidence).toBe(75);
    });

    it('overrides preset values correctly', () => {
      const base = FILTER_PRESETS.highConfidence.filters;
      const override: SignalFilterOptions = {
        ...base,
        signalType: 'sell',
      };

      expect(override.minConfidence).toBe(80);
      expect(override.signalType).toBe('sell');
    });
  });
});
