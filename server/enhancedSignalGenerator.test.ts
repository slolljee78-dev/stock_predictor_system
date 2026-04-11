import { describe, it, expect } from 'vitest';
import {
  analyzeVolume,
  detectMarketRegime,
  analyzeMultiTimeframe,
  generateEnhancedSignal,
  calculatePositionSize,
  validateSignalQuality,
  calculateWinProbability,
} from './enhancedSignalGenerator';
import { PricePoint } from './indicators';

describe('Enhanced Signal Generator - Phase 1 Improvements', () => {
  describe('Volume Analysis', () => {
    it('should confirm volume when above threshold', () => {
      const result = analyzeVolume(1000000, [500000, 600000, 700000], 1.5);
      expect(result.isConfirmed).toBe(true);
      expect(result.volumeRatio).toBeGreaterThan(1.5);
    });

    it('should reject volume when below threshold', () => {
      const result = analyzeVolume(500000, [500000, 600000, 700000], 1.5);
      expect(result.isConfirmed).toBe(false);
      expect(result.volumeRatio).toBeLessThan(1.5);
    });

    it('should calculate correct volume ratio', () => {
      const result = analyzeVolume(1000000, [500000, 500000, 500000], 1.5);
      expect(result.volumeRatio).toBe(2);
      expect(result.averageVolume).toBe(500000);
    });

    it('should handle empty volume history', () => {
      const result = analyzeVolume(1000000, [], 1.5);
      expect(result.isConfirmed).toBe(false);
      expect(result.averageVolume).toBe(0);
    });
  });

  describe('Market Regime Detection', () => {
    it('should detect uptrend', () => {
      const prices: PricePoint[] = [];
      for (let i = 0; i < 50; i++) {
        prices.push({
          open: 100 + i * 0.5,
          high: 101 + i * 0.5,
          low: 99 + i * 0.5,
          close: 100.5 + i * 0.5,
          volume: 1000000,
        });
      }

      const regime = detectMarketRegime(prices);
      expect(regime.type).toBe('trending_up');
      expect(regime.strength).toBeGreaterThan(0);
    });

    it('should detect downtrend', () => {
      const prices: PricePoint[] = [];
      for (let i = 0; i < 50; i++) {
        prices.push({
          open: 150 - i * 0.5,
          high: 151 - i * 0.5,
          low: 149 - i * 0.5,
          close: 150.5 - i * 0.5,
          volume: 1000000,
        });
      }

      const regime = detectMarketRegime(prices);
      expect(regime.type).toBe('trending_down');
      expect(regime.strength).toBeGreaterThan(0);
    });

    it('should detect ranging market', () => {
      const prices: PricePoint[] = [];
      for (let i = 0; i < 50; i++) {
        prices.push({
          open: 100,
          high: 100.5,
          low: 99.5,
          close: 100 + (Math.random() - 0.5),
          volume: 1000000,
        });
      }

      const regime = detectMarketRegime(prices);
      expect(regime.type).toBe('ranging');
    });

    it('should handle insufficient data', () => {
      const prices: PricePoint[] = [
        { open: 100, high: 101, low: 99, close: 100, volume: 1000000 },
      ];

      const regime = detectMarketRegime(prices);
      expect(regime.type).toBe('ranging');
      expect(regime.strength).toBe(0);
    });
  });

  describe('Multi-Timeframe Analysis', () => {
    it('should calculate alignment for bullish signals', () => {
      const signals = new Map([
        ['5m', { type: 'buy' as const, confidence: 60 }],
        ['15m', { type: 'buy' as const, confidence: 65 }],
        ['1h', { type: 'buy' as const, confidence: 70 }],
        ['daily', { type: 'sell' as const, confidence: 55 }],
      ]);

      const alignment = analyzeMultiTimeframe(signals);
      expect(alignment).toBeGreaterThan(0);
      expect(alignment).toBeLessThanOrEqual(100);
      // 3 out of 4 are buy signals = 75% alignment
      expect(alignment).toBe(75);
    });

    it('should handle empty signals', () => {
      const signals = new Map();
      const alignment = analyzeMultiTimeframe(signals);
      expect(alignment).toBe(0);
    });

    it('should calculate neutral alignment', () => {
      const signals = new Map([
        ['5m', { type: 'buy' as const, confidence: 60 }],
        ['15m', { type: 'sell' as const, confidence: 65 }],
        ['1h', { type: 'neutral' as const, confidence: 50 }],
      ]);

      const alignment = analyzeMultiTimeframe(signals);
      // Max of buy/sell is 1, so 1/3 = 33%
      expect(alignment).toBeGreaterThan(0);
      expect(alignment).toBeLessThanOrEqual(100);
    });
  });

  describe('Enhanced Signal Generation', () => {
    it('should boost confidence with volume confirmation', () => {
      const baseSignal = { type: 'buy' as const, confidence: 60 };
      const volumeAnalysis = {
        currentVolume: 1000000,
        averageVolume: 600000,
        volumeRatio: 1.67,
        isConfirmed: true,
      };
      const regime = {
        type: 'ranging' as const,
        strength: 50,
        atr: 0.5,
      };

      const signal = generateEnhancedSignal(baseSignal, volumeAnalysis, regime, 50);
      expect(signal.confidence).toBeGreaterThan(baseSignal.confidence);
      expect(signal.volumeConfirmed).toBe(true);
    });

    it('should reduce confidence without volume confirmation', () => {
      const baseSignal = { type: 'buy' as const, confidence: 60 };
      const volumeAnalysis = {
        currentVolume: 500000,
        averageVolume: 600000,
        volumeRatio: 0.83,
        isConfirmed: false,
      };
      const regime = {
        type: 'ranging' as const,
        strength: 50,
        atr: 0.5,
      };

      const signal = generateEnhancedSignal(baseSignal, volumeAnalysis, regime, 50);
      expect(signal.confidence).toBeLessThan(baseSignal.confidence);
      expect(signal.volumeConfirmed).toBe(false);
    });

    it('should boost confidence in aligned trending market', () => {
      const baseSignal = { type: 'buy' as const, confidence: 60 };
      const volumeAnalysis = {
        currentVolume: 1000000,
        averageVolume: 600000,
        volumeRatio: 1.67,
        isConfirmed: true,
      };
      const regime = {
        type: 'trending_up' as const,
        strength: 80,
        atr: 0.5,
      };

      const signal = generateEnhancedSignal(baseSignal, volumeAnalysis, regime, 80);
      expect(signal.confidence).toBeGreaterThan(75);
      expect(signal.strength).toBe('strong');
    });

    it('should classify signal strength correctly', () => {
      const baseSignal = { type: 'buy' as const, confidence: 80 };
      const volumeAnalysis = {
        currentVolume: 1000000,
        averageVolume: 600000,
        volumeRatio: 1.67,
        isConfirmed: true,
      };
      const regime = {
        type: 'trending_up' as const,
        strength: 80,
        atr: 0.5,
      };

      const signal = generateEnhancedSignal(baseSignal, volumeAnalysis, regime, 100);
      expect(signal.strength).toBe('strong');
      expect(signal.confidence).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Position Sizing', () => {
    it('should calculate appropriate position size', () => {
      const portfolio = { cash: 10000 };
      const atr = 2;
      const currentPrice = 100;

      const size = calculatePositionSize(portfolio, atr, currentPrice, 2);
      expect(size).toBeGreaterThan(0);
      expect(size * currentPrice).toBeLessThanOrEqual(portfolio.cash * 0.1);
    });

    it('should respect portfolio risk limits', () => {
      const portfolio = { cash: 10000 };
      const atr = 0.1;
      const currentPrice = 100;

      const size = calculatePositionSize(portfolio, atr, currentPrice, 2);
      expect(size * currentPrice).toBeLessThanOrEqual(portfolio.cash * 0.1);
    });
  });

  describe('Signal Quality Validation', () => {
    it('should accept high-confidence aligned signals', () => {
      const signal = {
        type: 'buy' as const,
        confidence: 75,
        reason: 'Test',
        volumeConfirmed: true,
        multiTimeframeAlignment: 80,
        marketRegime: 'trending_up' as const,
        strength: 'strong' as const,
      };

      const valid = validateSignalQuality(signal, 50, true, 50);
      expect(valid).toBe(true);
    });

    it('should reject low-confidence signals', () => {
      const signal = {
        type: 'buy' as const,
        confidence: 40,
        reason: 'Test',
        volumeConfirmed: false,
        multiTimeframeAlignment: 30,
        marketRegime: 'ranging' as const,
        strength: 'weak' as const,
      };

      const valid = validateSignalQuality(signal, 50, false, 50);
      expect(valid).toBe(false);
    });

    it('should reject neutral signals', () => {
      const signal = {
        type: 'neutral' as const,
        confidence: 50,
        reason: 'Test',
        volumeConfirmed: false,
        multiTimeframeAlignment: 50,
        marketRegime: 'ranging' as const,
        strength: 'moderate' as const,
      };

      const valid = validateSignalQuality(signal, 50, false, 50);
      expect(valid).toBe(false);
    });

    it('should reject signals in volatile markets without high confidence', () => {
      const signal = {
        type: 'buy' as const,
        confidence: 60,
        reason: 'Test',
        volumeConfirmed: true,
        multiTimeframeAlignment: 80,
        marketRegime: 'volatile' as const,
        strength: 'moderate' as const,
      };

      const valid = validateSignalQuality(signal, 50, true, 50);
      expect(valid).toBe(false);
    });
  });

  describe('Win Probability Calculation', () => {
    it('should calculate realistic win probability', () => {
      const signal = {
        type: 'buy' as const,
        confidence: 70,
        reason: 'Test',
        volumeConfirmed: true,
        multiTimeframeAlignment: 80,
        marketRegime: 'trending_up' as const,
        strength: 'strong' as const,
      };

      const probability = calculateWinProbability(signal);
      expect(probability).toBeGreaterThan(50);
      expect(probability).toBeLessThanOrEqual(85);
    });

    it('should give lower probability to weak signals', () => {
      const weakSignal = {
        type: 'buy' as const,
        confidence: 50,
        reason: 'Test',
        volumeConfirmed: false,
        multiTimeframeAlignment: 30,
        marketRegime: 'ranging' as const,
        strength: 'weak' as const,
      };

      const probability = calculateWinProbability(weakSignal);
      expect(probability).toBeLessThan(55);
    });

    it('should give higher probability to strong signals', () => {
      const strongSignal = {
        type: 'buy' as const,
        confidence: 85,
        reason: 'Test',
        volumeConfirmed: true,
        multiTimeframeAlignment: 100,
        marketRegime: 'trending_up' as const,
        strength: 'strong' as const,
      };

      const probability = calculateWinProbability(strongSignal);
      expect(probability).toBeGreaterThan(70);
    });

    it('should cap probability between 30% and 85%', () => {
      const extremeSignal = {
        type: 'buy' as const,
        confidence: 100,
        reason: 'Test',
        volumeConfirmed: true,
        multiTimeframeAlignment: 100,
        marketRegime: 'trending_up' as const,
        strength: 'strong' as const,
      };

      const probability = calculateWinProbability(extremeSignal);
      expect(probability).toBeLessThanOrEqual(85);
      expect(probability).toBeGreaterThanOrEqual(30);
    });
  });
});
