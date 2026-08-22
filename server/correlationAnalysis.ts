/**
 * Correlation & Sector Rotation Analysis
 * Analyzes stock correlations and sector rotation trends
 */

export interface StockCorrelation {
  ticker: string;
  correlationScore: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SectorRotationData {
  sector: string;
  momentum: number; // -1 to 1
  relativeStrength: number; // 0 to 100
  trend: 'bullish' | 'bearish' | 'neutral';
  topStocks: Array<{ ticker: string; performance: number }>;
}

export interface CorrelationMatrix {
  baseTicker: string;
  correlations: StockCorrelation[];
  analysisDate: Date;
  period: '1M' | '3M' | '6M' | '1Y';
}

/**
 * Calculate Pearson correlation coefficient between two price series
 */
export function calculatePearsonCorrelation(
  series1: number[],
  series2: number[]
): number {
  if (series1.length !== series2.length || series1.length < 2) {
    return 0;
  }

  const n = series1.length;
  let sum1 = 0;
  let sum2 = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  let sumProduct = 0;

  for (let i = 0; i < n; i++) {
    sum1 += series1[i];
    sum2 += series2[i];
    sum1Sq += series1[i] * series1[i];
    sum2Sq += series2[i] * series2[i];
    sumProduct += series1[i] * series2[i];
  }

  const numerator = n * sumProduct - sum1 * sum2;
  const denominator = Math.sqrt(
    (n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2)
  );

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Calculate returns from price series
 */
export function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(ret);
  }
  return returns;
}

/**
 * Classify correlation strength
 */
export function classifyCorrelationStrength(
  correlation: number
): 'strong' | 'moderate' | 'weak' | 'none' {
  const absCorr = Math.abs(correlation);
  if (absCorr >= 0.7) return 'strong';
  if (absCorr >= 0.4) return 'moderate';
  if (absCorr >= 0.2) return 'weak';
  return 'none';
}

/**
 * Detect correlation trend (increasing/decreasing/stable)
 */
export function detectCorrelationTrend(
  correlations: number[]
): 'increasing' | 'decreasing' | 'stable' {
  if (correlations.length < 2) return 'stable';

  const recent = correlations.slice(-5);
  const older = correlations.slice(-10, -5);

  if (recent.length === 0 || older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b) / older.length;

  const diff = recentAvg - olderAvg;

  if (Math.abs(diff) < 0.05) return 'stable';
  return diff > 0 ? 'increasing' : 'decreasing';
}

/**
 * Calculate sector momentum based on constituent stocks
 */
export function calculateSectorMomentum(
  stockPerformances: number[]
): number {
  if (stockPerformances.length === 0) return 0;

  const avgPerformance =
    stockPerformances.reduce((a, b) => a + b) / stockPerformances.length;

  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, avgPerformance / 100));
}

/**
 * Calculate relative strength index for sector vs market
 */
export function calculateRelativeStrength(
  sectorPerformance: number,
  marketPerformance: number
): number {
  const relativePerf = sectorPerformance - marketPerformance;
  // Convert to 0-100 scale
  return Math.max(0, Math.min(100, 50 + relativePerf * 5));
}

/**
 * Classify sector trend
 */
export function classifySectorTrend(
  momentum: number
): 'bullish' | 'bearish' | 'neutral' {
  if (momentum > 0.1) return 'bullish';
  if (momentum < -0.1) return 'bearish';
  return 'neutral';
}

/**
 * Build correlation matrix for a stock against peers
 */
export function buildCorrelationMatrix(
  baseTicker: string,
  peerData: Array<{ ticker: string; prices: number[] }>,
  baselinePrices: number[],
  period: '1M' | '3M' | '6M' | '1Y' = '3M'
): CorrelationMatrix {
  const baselineReturns = calculateReturns(baselinePrices);

  const correlations: StockCorrelation[] = peerData
    .map(peer => {
      const peerReturns = calculateReturns(peer.prices);
      const correlation = calculatePearsonCorrelation(
        baselineReturns,
        peerReturns
      );

      return {
        ticker: peer.ticker,
        correlationScore: correlation,
        strength: classifyCorrelationStrength(correlation),
        trend: detectCorrelationTrend([correlation]), // Simplified for now
      };
    })
    .sort((a, b) => Math.abs(b.correlationScore) - Math.abs(a.correlationScore));

  return {
    baseTicker,
    correlations,
    analysisDate: new Date(),
    period,
  };
}

/**
 * Analyze sector rotation
 */
export function analyzeSectorRotation(
  sectors: Array<{
    name: string;
    stocks: Array<{ ticker: string; performance: number }>;
  }>,
  marketPerformance: number = 0
): SectorRotationData[] {
  return sectors.map(sector => {
    const stockPerformances = sector.stocks.map(s => s.performance);
    const momentum = calculateSectorMomentum(stockPerformances);
    const relativeStrength = calculateRelativeStrength(
      momentum * 100,
      marketPerformance
    );

    return {
      sector: sector.name,
      momentum,
      relativeStrength,
      trend: classifySectorTrend(momentum),
      topStocks: sector.stocks
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 3),
    };
  });
}

/**
 * Identify sector rotation signals
 */
export interface SectorRotationSignal {
  type: 'rotation_into' | 'rotation_out_of';
  fromSector: string;
  toSector: string;
  confidence: number; // 0 to 1
  strength: 'strong' | 'moderate' | 'weak';
}

export function identifyRotationSignals(
  previousSectors: SectorRotationData[],
  currentSectors: SectorRotationData[]
): SectorRotationSignal[] {
  const signals: SectorRotationSignal[] = [];

  for (const current of currentSectors) {
    const previous = previousSectors.find(s => s.sector === current.sector);

    if (!previous) continue;

    // Detect momentum shift
    const momentumChange = current.momentum - previous.momentum;
    const relativeStrengthChange = current.relativeStrength - previous.relativeStrength;

    // Rotation into sector (momentum increasing, relative strength improving)
    if (momentumChange > 0.1 && relativeStrengthChange > 5) {
      const confidence = Math.min(
        1,
        (Math.abs(momentumChange) + relativeStrengthChange / 100) / 2
      );

      signals.push({
        type: 'rotation_into',
        fromSector: 'defensive',
        toSector: current.sector,
        confidence,
        strength: confidence > 0.7 ? 'strong' : confidence > 0.4 ? 'moderate' : 'weak',
      });
    }

    // Rotation out of sector (momentum decreasing, relative strength declining)
    if (momentumChange < -0.1 && relativeStrengthChange < -5) {
      const confidence = Math.min(
        1,
        (Math.abs(momentumChange) + Math.abs(relativeStrengthChange) / 100) / 2
      );

      signals.push({
        type: 'rotation_out_of',
        fromSector: current.sector,
        toSector: 'defensive',
        confidence,
        strength: confidence > 0.7 ? 'strong' : confidence > 0.4 ? 'moderate' : 'weak',
      });
    }
  }

  return signals;
}
