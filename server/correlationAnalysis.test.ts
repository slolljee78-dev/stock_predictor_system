import { describe, it, expect } from 'vitest';
import {
  calculatePearsonCorrelation,
  calculateReturns,
  classifyCorrelationStrength,
  detectCorrelationTrend,
  calculateSectorMomentum,
  calculateRelativeStrength,
  classifySectorTrend,
  buildCorrelationMatrix,
  analyzeSectorRotation,
  identifyRotationSignals,
} from './correlationAnalysis';

describe('Correlation Analysis', () => {
  describe('calculatePearsonCorrelation', () => {
    it('should return 1 for perfectly correlated series', () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [1, 2, 3, 4, 5];
      const correlation = calculatePearsonCorrelation(series1, series2);
      expect(correlation).toBeCloseTo(1, 5);
    });

    it('should return -1 for perfectly negatively correlated series', () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [5, 4, 3, 2, 1];
      const correlation = calculatePearsonCorrelation(series1, series2);
      expect(correlation).toBeCloseTo(-1, 5);
    });

    it('should return 0 for uncorrelated series', () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [5, 1, 4, 2, 3];
      const correlation = calculatePearsonCorrelation(series1, series2);
      expect(Math.abs(correlation)).toBeLessThan(0.5);
    });

    it('should handle empty or single-element series', () => {
      expect(calculatePearsonCorrelation([], [])).toBe(0);
      expect(calculatePearsonCorrelation([1], [1])).toBe(0);
    });

    it('should handle mismatched series lengths', () => {
      expect(calculatePearsonCorrelation([1, 2], [1, 2, 3])).toBe(0);
    });
  });

  describe('calculateReturns', () => {
    it('should calculate daily returns from prices', () => {
      const prices = [100, 105, 103, 108];
      const returns = calculateReturns(prices);
      expect(returns).toHaveLength(3);
      expect(returns[0]).toBeCloseTo(0.05, 5); // 5% return
      expect(returns[1]).toBeCloseTo(-0.019, 3); // -1.9% return
      expect(returns[2]).toBeCloseTo(0.0485, 3); // 4.85% return
    });

    it('should return empty array for single price', () => {
      const returns = calculateReturns([100]);
      expect(returns).toHaveLength(0);
    });
  });

  describe('classifyCorrelationStrength', () => {
    it('should classify strong positive correlation', () => {
      expect(classifyCorrelationStrength(0.8)).toBe('strong');
      expect(classifyCorrelationStrength(-0.8)).toBe('strong');
    });

    it('should classify moderate correlation', () => {
      expect(classifyCorrelationStrength(0.5)).toBe('moderate');
      expect(classifyCorrelationStrength(-0.5)).toBe('moderate');
    });

    it('should classify weak correlation', () => {
      expect(classifyCorrelationStrength(0.3)).toBe('weak');
      expect(classifyCorrelationStrength(-0.3)).toBe('weak');
    });

    it('should classify no correlation', () => {
      expect(classifyCorrelationStrength(0.1)).toBe('none');
      expect(classifyCorrelationStrength(0)).toBe('none');
    });
  });

  describe('detectCorrelationTrend', () => {
    it('should detect increasing trend', () => {
      const correlations = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.82, 0.85];
      const trend = detectCorrelationTrend(correlations);
      expect(trend).toBe('increasing');
    });

    it('should detect decreasing trend', () => {
      const correlations = [0.85, 0.82, 0.8, 0.75, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
      const trend = detectCorrelationTrend(correlations);
      expect(trend).toBe('decreasing');
    });

    it('should detect stable trend', () => {
      const correlations = [0.5, 0.51, 0.49, 0.5, 0.52, 0.48, 0.5, 0.51, 0.49, 0.5];
      const trend = detectCorrelationTrend(correlations);
      expect(trend).toBe('stable');
    });
  });

  describe('calculateSectorMomentum', () => {
    it('should calculate positive momentum', () => {
      const performances = [5, 10, 8, 12];
      const momentum = calculateSectorMomentum(performances);
      expect(momentum).toBeGreaterThan(0);
      expect(momentum).toBeLessThanOrEqual(1);
    });

    it('should calculate negative momentum', () => {
      const performances = [-5, -10, -8, -12];
      const momentum = calculateSectorMomentum(performances);
      expect(momentum).toBeLessThan(0);
      expect(momentum).toBeGreaterThanOrEqual(-1);
    });

    it('should return 0 for empty array', () => {
      expect(calculateSectorMomentum([])).toBe(0);
    });
  });

  describe('calculateRelativeStrength', () => {
    it('should calculate relative strength index', () => {
      const sectorPerf = 10;
      const marketPerf = 5;
      const rs = calculateRelativeStrength(sectorPerf, marketPerf);
      expect(rs).toBeGreaterThan(50);
      expect(rs).toBeLessThanOrEqual(100);
    });

    it('should return 50 for equal performance', () => {
      const rs = calculateRelativeStrength(5, 5);
      expect(rs).toBe(50);
    });

    it('should handle underperformance', () => {
      const rs = calculateRelativeStrength(2, 10);
      expect(rs).toBeLessThan(50);
      expect(rs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('classifySectorTrend', () => {
    it('should classify bullish trend', () => {
      expect(classifySectorTrend(0.2)).toBe('bullish');
      expect(classifySectorTrend(0.5)).toBe('bullish');
    });

    it('should classify bearish trend', () => {
      expect(classifySectorTrend(-0.2)).toBe('bearish');
      expect(classifySectorTrend(-0.5)).toBe('bearish');
    });

    it('should classify neutral trend', () => {
      expect(classifySectorTrend(0)).toBe('neutral');
      expect(classifySectorTrend(0.05)).toBe('neutral');
      expect(classifySectorTrend(-0.05)).toBe('neutral');
    });
  });

  describe('buildCorrelationMatrix', () => {
    it('should build correlation matrix for peers', () => {
      const baselinePrices = [100, 105, 103, 108, 110];
      const peerData = [
        { ticker: 'PEER1', prices: [50, 52, 51, 54, 55] },
        { ticker: 'PEER2', prices: [200, 190, 195, 185, 180] },
      ];

      const matrix = buildCorrelationMatrix('BASE', peerData, baselinePrices);

      expect(matrix.baseTicker).toBe('BASE');
      expect(matrix.correlations).toHaveLength(2);
      expect(matrix.period).toBe('3M');
      expect(matrix.analysisDate).toBeInstanceOf(Date);
    });

    it('should sort correlations by strength', () => {
      const baselinePrices = [1, 2, 3, 4, 5];
      const peerData = [
        { ticker: 'STRONG', prices: [1, 2, 3, 4, 5] }, // Perfect correlation
        { ticker: 'WEAK', prices: [5, 4, 3, 2, 1] }, // Negative correlation
      ];

      const matrix = buildCorrelationMatrix('BASE', peerData, baselinePrices);

      expect(Math.abs(matrix.correlations[0].correlationScore)).toBeGreaterThan(
        Math.abs(matrix.correlations[1].correlationScore)
      );
    });
  });

  describe('analyzeSectorRotation', () => {
    it('should analyze sector rotation', () => {
      const sectors = [
        {
          name: 'Technology',
          stocks: [
            { ticker: 'AAPL', performance: 15 },
            { ticker: 'MSFT', performance: 12 },
            { ticker: 'GOOGL', performance: 10 },
          ],
        },
        {
          name: 'Healthcare',
          stocks: [
            { ticker: 'JNJ', performance: 5 },
            { ticker: 'PFE', performance: 3 },
            { ticker: 'ABBV', performance: 2 },
          ],
        },
      ];

      const analysis = analyzeSectorRotation(sectors);

      expect(analysis).toHaveLength(2);
      expect(analysis[0].sector).toBe('Technology');
      expect(analysis[0].momentum).toBeGreaterThan(0);
      expect(analysis[0].relativeStrength).toBeGreaterThan(50);
      expect(analysis[0].trend).toBe('bullish');
      expect(analysis[0].topStocks).toHaveLength(3);
    });
  });

  describe('identifyRotationSignals', () => {
    it('should identify rotation into sector', () => {
      const previousSectors = [
        {
          sector: 'Technology',
          momentum: 0.05,
          relativeStrength: 45,
          trend: 'neutral' as const,
          topStocks: [],
        },
      ];

      const currentSectors = [
        {
          sector: 'Technology',
          momentum: 0.2,
          relativeStrength: 55,
          trend: 'bullish' as const,
          topStocks: [],
        },
      ];

      const signals = identifyRotationSignals(previousSectors, currentSectors);

      expect(signals).toHaveLength(1);
      expect(signals[0].type).toBe('rotation_into');
      expect(signals[0].toSector).toBe('Technology');
    });

    it('should identify rotation out of sector', () => {
      const previousSectors = [
        {
          sector: 'Technology',
          momentum: 0.2,
          relativeStrength: 55,
          trend: 'bullish' as const,
          topStocks: [],
        },
      ];

      const currentSectors = [
        {
          sector: 'Technology',
          momentum: 0.05,
          relativeStrength: 45,
          trend: 'neutral' as const,
          topStocks: [],
        },
      ];

      const signals = identifyRotationSignals(previousSectors, currentSectors);

      expect(signals).toHaveLength(1);
      expect(signals[0].type).toBe('rotation_out_of');
      expect(signals[0].fromSector).toBe('Technology');
    });
  });
});
