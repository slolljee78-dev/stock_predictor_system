/**
 * Sentiment Analysis Service - Phase 2
 * Analyzes financial news and market sentiment to enhance trading signals
 */

import { invokeLLM } from "./_core/llm";

export interface SentimentScore {
  score: number; // -1 to 1 (negative to positive)
  label: "bullish" | "neutral" | "bearish";
  confidence: number; // 0 to 1
  reasoning: string;
}

export interface NewsItem {
  title: string;
  source: string;
  date: Date;
  url?: string;
  sentiment?: SentimentScore;
}

export interface EarningsEvent {
  ticker: string;
  date: Date;
  estimatedEPS?: number;
  reportedEPS?: number;
  surprise?: number; // percentage
}

export interface ChartPattern {
  type: "head_shoulders" | "double_top" | "double_bottom" | "triangle" | "flag" | "wedge";
  strength: number; // 0 to 1
  direction: "bullish" | "bearish";
  breakoutPrice: number;
  targetPrice: number;
}

export interface SupportResistance {
  support: number[];
  resistance: number[];
  keyLevel: number;
}

/**
 * Analyze sentiment of financial news headlines using LLM
 */
export async function analyzeSentiment(text: string): Promise<SentimentScore> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a financial sentiment analyst. Analyze the sentiment of financial news headlines and return a JSON response with:
- score: number from -1 (very bearish) to 1 (very bullish)
- label: "bullish", "neutral", or "bearish"
- confidence: number from 0 to 1
- reasoning: brief explanation

Return ONLY valid JSON, no other text.`,
        },
        {
          role: "user",
          content: `Analyze this financial news: "${text}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentiment_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Sentiment score from -1 to 1",
              },
              label: {
                type: "string",
                enum: ["bullish", "neutral", "bearish"],
              },
              confidence: {
                type: "number",
                description: "Confidence from 0 to 1",
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of sentiment",
              },
            },
            required: ["score", "label", "confidence", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    const contentStr = typeof content === 'string' ? content : '';
    if (!contentStr) {
      return {
        score: 0,
        label: "neutral",
        confidence: 0.5,
        reasoning: "Unable to analyze sentiment",
      };
    }

    const parsed = JSON.parse(contentStr);
    return {
      score: Math.max(-1, Math.min(1, parsed.score || 0)),
      label: parsed.label || "neutral",
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      reasoning: parsed.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      score: 0,
      label: "neutral",
      confidence: 0,
      reasoning: "Error during analysis",
    };
  }
}

/**
 * Detect advanced chart patterns from price data
 */
export function detectChartPatterns(prices: number[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];

  if (prices.length < 5) return patterns;

  const recent = prices.slice(-20);

  // Head and Shoulders pattern
  if (recent.length >= 5) {
    const leftShoulder = recent[0];
    const head = Math.max(...recent.slice(1, 4));
    const rightShoulder = recent[recent.length - 1];

    if (
      leftShoulder < head &&
      rightShoulder < head &&
      Math.abs(leftShoulder - rightShoulder) < head * 0.05
    ) {
      patterns.push({
        type: "head_shoulders",
        strength: 0.75,
        direction: "bearish",
        breakoutPrice: Math.min(leftShoulder, rightShoulder),
        targetPrice: Math.min(leftShoulder, rightShoulder) * 0.95,
      });
    }
  }

  // Double Top pattern
  if (recent.length >= 5) {
    const peak1 = Math.max(...recent.slice(0, 3));
    const peak2 = Math.max(...recent.slice(-3));

    if (Math.abs(peak1 - peak2) < Math.max(peak1, peak2) * 0.02) {
      patterns.push({
        type: "double_top",
        strength: 0.8,
        direction: "bearish",
        breakoutPrice: Math.min(peak1, peak2) * 0.98,
        targetPrice: Math.min(peak1, peak2) * 0.90,
      });
    }
  }

  // Double Bottom pattern
  if (recent.length >= 5) {
    const valley1 = Math.min(...recent.slice(0, 3));
    const valley2 = Math.min(...recent.slice(-3));

    if (Math.abs(valley1 - valley2) < Math.max(valley1, valley2) * 0.02) {
      patterns.push({
        type: "double_bottom",
        strength: 0.8,
        direction: "bullish",
        breakoutPrice: Math.max(valley1, valley2) * 1.02,
        targetPrice: Math.max(valley1, valley2) * 1.10,
      });
    }
  }

  // Triangle pattern (converging highs and lows)
  if (recent.length >= 10) {
    const highs = recent.map((p, i) => (i % 2 === 0 ? p : 0)).filter(p => p > 0);
    const lows = recent.map((p, i) => (i % 2 === 1 ? p : Infinity)).filter(p => p < Infinity);

    if (highs.length >= 3 && lows.length >= 3) {
      const highRange = Math.max(...highs) - Math.min(...highs);
      const lowRange = Math.max(...lows) - Math.min(...lows);

      if (highRange > 0 && lowRange > 0 && highRange < lowRange * 2) {
        patterns.push({
          type: "triangle",
          strength: 0.7,
          direction: recent[recent.length - 1] > recent[0] ? "bullish" : "bearish",
          breakoutPrice: recent[recent.length - 1],
          targetPrice: recent[recent.length - 1] * (recent[recent.length - 1] > recent[0] ? 1.08 : 0.92),
        });
      }
    }
  }

  return patterns;
}

/**
 * Identify support and resistance levels
 */
export function identifySupportResistance(prices: number[]): SupportResistance {
  if (prices.length < 10) {
    return {
      support: [],
      resistance: [],
      keyLevel: prices[prices.length - 1],
    };
  }

  const recent = prices.slice(-50);
  const sorted = [...recent].sort((a, b) => a - b);

  // Find clusters of prices (support/resistance levels)
  const levels: number[] = [];
  const tolerance = (Math.max(...sorted) - Math.min(...sorted)) * 0.02;

  for (let i = 0; i < sorted.length; i++) {
    let cluster = [sorted[i]];

    for (let j = i + 1; j < sorted.length; j++) {
      if (Math.abs(sorted[j] - sorted[i]) < tolerance) {
        cluster.push(sorted[j]);
      } else {
        break;
      }
    }

    if (cluster.length >= 2) {
      const avgLevel = cluster.reduce((a, b) => a + b, 0) / cluster.length;
      if (!levels.some(l => Math.abs(l - avgLevel) < tolerance)) {
        levels.push(avgLevel);
      }
    }
  }

  const currentPrice = prices[prices.length - 1];
  const support = levels.filter(l => l < currentPrice).sort((a, b) => b - a).slice(0, 3);
  const resistance = levels.filter(l => l > currentPrice).sort((a, b) => a - b).slice(0, 3);

  return {
    support,
    resistance,
    keyLevel: levels.length > 0 ? levels[Math.floor(levels.length / 2)] : currentPrice,
  };
}

/**
 * Check if stock has earnings event coming up
 */
export function checkEarningsProximity(ticker: string, daysAhead: number = 7): EarningsEvent | null {
  // Mock earnings calendar - in production, integrate with real earnings API
  const earningsCalendar: Record<string, Date> = {
    AAPL: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    MSFT: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    GOOGL: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    TSLA: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  };

  const earningsDate = earningsCalendar[ticker];
  if (!earningsDate) return null;

  const daysUntilEarnings = Math.floor(
    (earningsDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  if (daysUntilEarnings > 0 && daysUntilEarnings <= daysAhead) {
    return {
      ticker,
      date: earningsDate,
      estimatedEPS: undefined,
      reportedEPS: undefined,
      surprise: undefined,
    };
  }

  return null;
}

/**
 * Calculate composite sentiment score from multiple sources
 */
export function calculateCompositeSentiment(
  newsSentiment: number,
  patternSentiment: number,
  supportResistanceSentiment: number,
  weights = { news: 0.4, pattern: 0.35, supportResistance: 0.25 }
): number {
  const weighted =
    newsSentiment * weights.news +
    patternSentiment * weights.pattern +
    supportResistanceSentiment * weights.supportResistance;

  return Math.max(-1, Math.min(1, weighted));
}

/**
 * Generate sentiment-based signal adjustment
 */
export function generateSentimentSignalAdjustment(
  baseSentiment: number,
  chartPatterns: ChartPattern[],
  supportResistance: SupportResistance,
  currentPrice: number
): { adjustment: number; reasoning: string } {
  let adjustment = 0;
  const reasons: string[] = [];

  // News sentiment adjustment
  if (baseSentiment > 0.5) {
    adjustment += 15;
    reasons.push("Positive news sentiment");
  } else if (baseSentiment < -0.5) {
    adjustment -= 15;
    reasons.push("Negative news sentiment");
  }

  // Chart pattern adjustment
  const bullishPatterns = chartPatterns.filter(p => p.direction === "bullish");
  const bearishPatterns = chartPatterns.filter(p => p.direction === "bearish");

  if (bullishPatterns.length > 0) {
    adjustment += bullishPatterns.length * 10;
    reasons.push(`${bullishPatterns.length} bullish pattern(s) detected`);
  }

  if (bearishPatterns.length > 0) {
    adjustment -= bearishPatterns.length * 10;
    reasons.push(`${bearishPatterns.length} bearish pattern(s) detected`);
  }

  // Support/Resistance adjustment
  if (supportResistance.support.length > 0) {
    const nearestSupport = supportResistance.support[0];
    const distanceToSupport = ((currentPrice - nearestSupport) / currentPrice) * 100;

    if (distanceToSupport < 2) {
      adjustment += 10;
      reasons.push("Price near strong support level");
    }
  }

  if (supportResistance.resistance.length > 0) {
    const nearestResistance = supportResistance.resistance[0];
    const distanceToResistance = ((nearestResistance - currentPrice) / currentPrice) * 100;

    if (distanceToResistance < 2) {
      adjustment -= 10;
      reasons.push("Price near strong resistance level");
    }
  }

  return {
    adjustment: Math.max(-30, Math.min(30, adjustment)),
    reasoning: reasons.join("; ") || "No sentiment adjustments",
  };
}
