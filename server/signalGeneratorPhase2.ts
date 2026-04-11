/**
 * Phase 2 Signal Generator - Sentiment Analysis Integration
 * Enhances Phase 1 signals with sentiment analysis, chart patterns, and earnings awareness
 */

import { GeneratedSignal, SignalGenerationInput } from "./signalGenerator";
import { PricePoint } from "./indicators";
import {
  analyzeSentiment,
  detectChartPatterns,
  identifySupportResistance,
  checkEarningsProximity,
  generateSentimentSignalAdjustment,
} from "./sentimentAnalyzer";

export interface Phase2Signal extends GeneratedSignal {
  sentimentBoost: number; // -30 to +30
  chartPatterns: string[];
  earningsWarning: boolean;
  supportResistanceLevel: string;
  phase2Confidence: number; // 0 to 100, adjusted from phase 1
}

/**
 * Generate Phase 2 enhanced signals with sentiment analysis
 */
export async function generatePhase2Signal(
  ticker: string,
  priceData: PricePoint[],
  phase1Signal: GeneratedSignal,
  newsHeadlines: string[] = []
): Promise<Phase2Signal> {
  // Start with Phase 1 signal as baseline
  let confidenceAdjustment = 0;
  const adjustments: string[] = [];

  // 1. Analyze news sentiment
  let newsSentiment = 0;
  if (newsHeadlines.length > 0) {
    try {
      const sentiments = await Promise.all(newsHeadlines.map(h => analyzeSentiment(h)));
      newsSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
      adjustments.push(`News sentiment: ${(newsSentiment * 100).toFixed(0)}%`);
    } catch (error) {
      console.error("Error analyzing news sentiment:", error);
    }
  }

  // 2. Detect chart patterns
  const prices = priceData.map(p => p.close);
  const patterns = detectChartPatterns(prices);
  const patternSentiment = patterns.length > 0
    ? patterns.reduce((sum, p) => sum + (p.direction === "bullish" ? p.strength : -p.strength), 0) /
      patterns.length
    : 0;

  if (patterns.length > 0) {
    adjustments.push(`${patterns.length} chart pattern(s) detected`);
  }

  // 3. Identify support and resistance
  const supportResistance = identifySupportResistance(prices);
  const currentPrice = prices[prices.length - 1];
  let srLevel = "neutral";

  if (supportResistance.support.length > 0 && currentPrice - supportResistance.support[0] < currentPrice * 0.02) {
    srLevel = "near_support";
    confidenceAdjustment += 5;
    adjustments.push("Price near strong support");
  }

  if (supportResistance.resistance.length > 0 && supportResistance.resistance[0] - currentPrice < currentPrice * 0.02) {
    srLevel = "near_resistance";
    confidenceAdjustment -= 5;
    adjustments.push("Price near strong resistance");
  }

  // 4. Check for upcoming earnings
  const earnings = checkEarningsProximity(ticker, 7);
  let earningsWarning = false;

  if (earnings) {
    earningsWarning = true;
    confidenceAdjustment -= 10;
    adjustments.push("Earnings event within 7 days - reduced confidence");
  }

  // 5. Generate sentiment-based signal adjustment
  const sentimentAdjustment = generateSentimentSignalAdjustment(
    newsSentiment,
    patterns,
    supportResistance,
    currentPrice
  );

  confidenceAdjustment += sentimentAdjustment.adjustment;
  adjustments.push(sentimentAdjustment.reasoning);

  // 6. Calculate final Phase 2 confidence
  const phase2Confidence = Math.max(
    0,
    Math.min(100, phase1Signal.confidenceScore + confidenceAdjustment)
  );

  // 7. Determine if signal should be filtered out
  let finalSignal = phase1Signal.type;

  // Filter out signals if earnings are too close
  if (earningsWarning && Math.abs(confidenceAdjustment) > 15) {
    finalSignal = null;
  }

  // Filter out weak signals after sentiment adjustment
  if (phase2Confidence < 40) {
    finalSignal = null;
  }

  return {
    ...phase1Signal,
    type: finalSignal as 'buy' | 'sell' | null,
    confidenceScore: phase2Confidence,
    sentimentBoost: confidenceAdjustment,
    chartPatterns: patterns.map(p => `${p.type} (${p.direction})`),
    earningsWarning,
    supportResistanceLevel: srLevel,
    phase2Confidence,
  };
}

/**
 * Compare Phase 1 vs Phase 2 signals for backtesting
 */
export interface SignalComparison {
  ticker: string;
  phase1Signal: GeneratedSignal;
  phase2Signal: Phase2Signal;
  confidenceImprovement: number;
  signalChanged: boolean;
  reason: string;
}

export function compareSignals(
  ticker: string,
  phase1: GeneratedSignal,
  phase2: Phase2Signal
): SignalComparison {
  const confidenceImprovement = phase2.phase2Confidence - phase1.confidenceScore;
  const signalChanged = phase1.type !== phase2.type;

  let reason = "";
  if (signalChanged) {
    reason = `Signal changed from ${phase1.type} to ${phase2.type}`;
  } else if (confidenceImprovement > 0) {
    reason = `Confidence improved by ${confidenceImprovement.toFixed(1)}% due to sentiment and patterns`;
  } else if (confidenceImprovement < 0) {
    reason = `Confidence reduced by ${Math.abs(confidenceImprovement).toFixed(1)}% due to earnings or resistance`;
  } else {
    reason = "No change in signal or confidence";
  }

  return {
    ticker: ticker,
    phase1Signal: phase1,
    phase2Signal: phase2,
    confidenceImprovement,
    signalChanged,
    reason,
  };
}

/**
 * Generate mock news headlines for testing
 */
export function generateMockNewsHeadlines(ticker: string, sentiment: "bullish" | "bearish" | "neutral" = "neutral"): string[] {
  const bullishHeadlines = [
    `${ticker} beats earnings expectations, stock rallies`,
    `${ticker} announces major product launch, analysts upgrade`,
    `${ticker} secures new partnership, revenue growth expected`,
    `${ticker} expands into new market, strong demand signals`,
  ];

  const bearishHeadlines = [
    `${ticker} misses earnings targets, stock declines`,
    `${ticker} faces regulatory challenges, outlook uncertain`,
    `${ticker} loses major customer, revenue concerns`,
    `${ticker} reports supply chain issues, margins compressed`,
  ];

  const neutralHeadlines = [
    `${ticker} reports quarterly results in line with expectations`,
    `${ticker} maintains guidance, market reaction mixed`,
    `${ticker} announces leadership transition`,
    `${ticker} stock trades in narrow range`,
  ];

  let headlines = neutralHeadlines;
  if (sentiment === "bullish") headlines = bullishHeadlines;
  if (sentiment === "bearish") headlines = bearishHeadlines;

  return headlines.slice(0, 2);
}
