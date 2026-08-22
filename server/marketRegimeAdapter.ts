/**
 * Market Regime Adapter - Phase 3
 * Detects market conditions and adapts trading strategy accordingly
 */

import { MarketData } from "./realMarketDataFetcher";

export type MarketRegime = "trending_up" | "trending_down" | "ranging" | "volatile" | "choppy";

export interface RegimeAnalysis {
  regime: MarketRegime;
  confidence: number; // 0-100
  volatility: number;
  trend: number; // -1 to 1
  strength: number; // 0-1
  recommendation: string;
}

export interface RegimeAdaptedStrategy {
  confidenceThreshold: number;
  positionSizingMultiplier: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxPositions: number;
  tradingFrequency: "high" | "medium" | "low";
}

/**
 * Detect current market regime
 */
export function detectMarketRegime(data: MarketData[], lookbackPeriod: number = 50): RegimeAnalysis {
  if (data.length < lookbackPeriod) {
    return {
      regime: "ranging",
      confidence: 30,
      volatility: 0.01,
      trend: 0,
      strength: 0.5,
      recommendation: "Insufficient data for regime detection",
    };
  }

  const recentData = data.slice(-lookbackPeriod);
  const closes = recentData.map((d) => d.close);

  // Calculate volatility
  const returns = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }

  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);

  // Calculate trend
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const sma50 = closes.reduce((a, b) => a + b, 0) / closes.length;
  const currentPrice = closes[closes.length - 1];

  const trend = (currentPrice - sma50) / sma50;
  const trendStrength = Math.abs(trend);

  // Detect regime
  let regime: MarketRegime;
  let confidence: number;
  let strength: number;
  let recommendation: string;

  if (volatility > 0.03) {
    // High volatility
    regime = "volatile";
    confidence = 75;
    strength = Math.min(volatility / 0.05, 1);
    recommendation = "Use wider stops, reduce position size, focus on strong signals";
  } else if (trendStrength > 0.05) {
    // Strong trend
    if (trend > 0) {
      regime = "trending_up";
      confidence = 80;
      recommendation = "Favor buy signals, use trailing stops";
    } else {
      regime = "trending_down";
      confidence = 80;
      recommendation = "Favor sell signals, avoid longs";
    }
    strength = trendStrength;
  } else if (volatility > 0.015) {
    // Moderate volatility, no clear trend
    regime = "choppy";
    confidence = 60;
    strength = 0.5;
    recommendation = "Use mean reversion strategies, tighter stops";
  } else {
    // Low volatility, ranging
    regime = "ranging";
    confidence = 70;
    strength = 1 - volatility / 0.015;
    recommendation = "Use support/resistance levels, mean reversion";
  }

  return {
    regime,
    confidence,
    volatility,
    trend,
    strength,
    recommendation,
  };
}

/**
 * Get adapted strategy for current regime
 */
export function getAdaptedStrategy(regimeAnalysis: RegimeAnalysis): RegimeAdaptedStrategy {
  switch (regimeAnalysis.regime) {
    case "trending_up":
      return {
        confidenceThreshold: 50, // Lower threshold in trending markets
        positionSizingMultiplier: 1.2, // Larger positions
        stopLossPercent: 3, // Wider stops
        takeProfitPercent: 5, // Let winners run
        maxPositions: 5,
        tradingFrequency: "high",
      };

    case "trending_down":
      return {
        confidenceThreshold: 60, // Higher threshold for shorts
        positionSizingMultiplier: 0.8, // Smaller positions
        stopLossPercent: 2.5,
        takeProfitPercent: 3,
        maxPositions: 3,
        tradingFrequency: "medium",
      };

    case "volatile":
      return {
        confidenceThreshold: 75, // Very high threshold
        positionSizingMultiplier: 0.5, // Much smaller positions
        stopLossPercent: 2, // Tight stops
        takeProfitPercent: 2, // Take profits quickly
        maxPositions: 2,
        tradingFrequency: "low",
      };

    case "ranging":
      return {
        confidenceThreshold: 65, // Moderate threshold
        positionSizingMultiplier: 1, // Normal positions
        stopLossPercent: 2.5,
        takeProfitPercent: 3,
        maxPositions: 4,
        tradingFrequency: "medium",
      };

    case "choppy":
      return {
        confidenceThreshold: 70, // Higher threshold
        positionSizingMultiplier: 0.7, // Smaller positions
        stopLossPercent: 2,
        takeProfitPercent: 2,
        maxPositions: 2,
        tradingFrequency: "low",
      };

    default:
      return {
        confidenceThreshold: 65,
        positionSizingMultiplier: 1,
        stopLossPercent: 2.5,
        takeProfitPercent: 3,
        maxPositions: 4,
        tradingFrequency: "medium",
      };
  }
}

/**
 * Calculate volatility-based position sizing
 */
export function calculateVolatilityBasedPositionSize(
  capital: number,
  volatility: number,
  riskPercent: number = 2
): number {
  // Higher volatility = smaller position size
  const volatilityAdjustment = Math.max(0.3, 1 - volatility * 20);
  const basePositionSize = (capital * riskPercent) / 100;
  return basePositionSize * volatilityAdjustment;
}

/**
 * Detect bull/bear market
 */
export function detectBullBearMarket(data: MarketData[], period: number = 200): "bull" | "bear" | "neutral" {
  if (data.length < period) {
    return "neutral";
  }

  const recentData = data.slice(-period);
  const closes = recentData.map((d) => d.close);

  const sma = closes.reduce((a, b) => a + b, 0) / closes.length;
  const currentPrice = closes[closes.length - 1];

  const percentAboveSMA = closes.filter((c) => c > sma).length / closes.length;

  if (percentAboveSMA > 0.65) {
    return "bull";
  } else if (percentAboveSMA < 0.35) {
    return "bear";
  } else {
    return "neutral";
  }
}

/**
 * Detect sector rotation
 */
export function detectSectorRotation(
  sectorData: Map<string, MarketData[]>,
  period: number = 50
): Map<string, number> {
  const sectorMomentum = new Map<string, number>();

  sectorData.forEach((data: MarketData[], sector: string) => {
    if (data.length < period) {
      sectorMomentum.set(sector, 0);
      return;
    }

    const recentData = data.slice(-period);
    const closes = recentData.map((d: MarketData) => d.close);

    const startPrice = closes[0];
    const endPrice = closes[closes.length - 1];
    const momentum = ((endPrice - startPrice) / startPrice) * 100;

    sectorMomentum.set(sector, momentum);
  });

  return sectorMomentum;
}

/**
 * Get sector rotation recommendation
 */
export function getSectorRotationRecommendation(
  sectorMomentum: Map<string, number>
): { bullishSectors: string[]; bearishSectors: string[] } {
  const sorted = Array.from(sectorMomentum.entries()).sort((a, b) => b[1] - a[1]);

  const bullishSectors = sorted
    .filter(([_, momentum]) => momentum > 0)
    .slice(0, 3)
    .map(([sector, _]) => sector);

  const bearishSectors = sorted
    .filter(([_, momentum]) => momentum < 0)
    .slice(0, 3)
    .map(([sector, _]) => sector);

  return { bullishSectors, bearishSectors };
}

/**
 * Create regime analysis report
 */
export function createRegimeReport(regimeAnalysis: RegimeAnalysis): string {
  const strategy = getAdaptedStrategy(regimeAnalysis);

  let report = "# Market Regime Analysis Report\n\n";
  report += `## Current Regime: ${regimeAnalysis.regime.toUpperCase()}\n`;
  report += `**Confidence:** ${regimeAnalysis.confidence}%\n`;
  report += `**Volatility:** ${(regimeAnalysis.volatility * 100).toFixed(2)}%\n`;
  report += `**Trend:** ${(regimeAnalysis.trend * 100).toFixed(2)}%\n`;
  report += `**Strength:** ${(regimeAnalysis.strength * 100).toFixed(1)}%\n\n`;

  report += `## Recommendation\n${regimeAnalysis.recommendation}\n\n`;

  report += `## Adapted Strategy Parameters\n`;
  report += `- **Confidence Threshold:** ${strategy.confidenceThreshold}%\n`;
  report += `- **Position Sizing Multiplier:** ${strategy.positionSizingMultiplier}x\n`;
  report += `- **Stop Loss:** ${strategy.stopLossPercent}%\n`;
  report += `- **Take Profit:** ${strategy.takeProfitPercent}%\n`;
  report += `- **Max Positions:** ${strategy.maxPositions}\n`;
  report += `- **Trading Frequency:** ${strategy.tradingFrequency}\n`;

  return report;
}


