/**
 * Signal Generator - LLM-Powered Trading Signal Generation
 * Uses Claude/GPT to analyze technical patterns and generate buy/sell signals
 */

import { invokeLLM } from './_core/llm';
import { createSignal } from './db';
import { calculateAllIndicators, analyzeIndicators, IndicatorValues, PricePoint } from './indicators';

export interface SignalGenerationInput {
  ticker: string;
  stockId: number;
  priceHistory: PricePoint[];
  currentPrice: number;
}

export interface GeneratedSignal {
  type: 'buy' | 'sell' | null;
  confidenceScore: number;
  analysis: string;
  indicators: IndicatorValues;
}

/**
 * Generate trading signals using LLM analysis of technical indicators
 */
export async function generateTradingSignal(input: SignalGenerationInput): Promise<GeneratedSignal> {
  if (input.priceHistory.length < 50) {
    return {
      type: null,
      confidenceScore: 0,
      analysis: 'Insufficient historical data for analysis',
      indicators: {
        rsi: null,
        macd: null,
        bollingerBands: null,
        sma20: null,
        sma50: null,
        ema12: null,
        ema26: null,
      },
    };
  }

  // Calculate technical indicators
  const indicators = calculateAllIndicators(input.priceHistory);

  // Get initial signal from technical analysis
  const technicalSignal = analyzeIndicators(indicators);

  // Prepare price context for LLM
  const recentPrices = input.priceHistory.slice(-20);
  const priceChange =
    ((input.currentPrice - recentPrices[0].close) / recentPrices[0].close) * 100;
  const highestPrice = Math.max(...recentPrices.map(p => p.high));
  const lowestPrice = Math.min(...recentPrices.map(p => p.low));

  // Build LLM prompt for deeper analysis
  const prompt = `You are an expert technical analyst. Analyze the following stock data and provide a trading signal.

Stock: ${input.ticker}
Current Price: $${input.currentPrice.toFixed(2)}
20-Day Price Change: ${priceChange.toFixed(2)}%
20-Day High: $${highestPrice.toFixed(2)}
20-Day Low: $${lowestPrice.toFixed(2)}

Technical Indicators:
- RSI (14): ${indicators.rsi !== null ? indicators.rsi.toFixed(2) : 'N/A'}
- MACD Line: ${indicators.macd?.line.toFixed(4) || 'N/A'}
- MACD Signal: ${indicators.macd?.signal.toFixed(4) || 'N/A'}
- MACD Histogram: ${indicators.macd?.histogram.toFixed(4) || 'N/A'}
- Bollinger Bands Upper: $${indicators.bollingerBands?.upper.toFixed(2) || 'N/A'}
- Bollinger Bands Middle: $${indicators.bollingerBands?.middle.toFixed(2) || 'N/A'}
- Bollinger Bands Lower: $${indicators.bollingerBands?.lower.toFixed(2) || 'N/A'}
- SMA 20: $${indicators.sma20?.toFixed(2) || 'N/A'}
- SMA 50: $${indicators.sma50?.toFixed(2) || 'N/A'}
- EMA 12: $${indicators.ema12?.toFixed(2) || 'N/A'}
- EMA 26: $${indicators.ema26?.toFixed(2) || 'N/A'}

Based on this technical analysis, provide your assessment in the following JSON format:
{
  "signal": "buy" or "sell" or "hold",
  "confidence": <number between 0-100>,
  "reasoning": "<brief explanation of the signal>"
}

Consider:
1. RSI extremes (< 30 = oversold/buy signal, > 70 = overbought/sell signal)
2. MACD crossovers and histogram direction
3. Price position relative to Bollinger Bands
4. Moving average trends and crossovers
5. Recent price momentum and volatility

Provide only the JSON response, no additional text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content:
            'You are a technical analysis expert. Respond only with valid JSON in the exact format requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'trading_signal',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              signal: {
                type: 'string',
                enum: ['buy', 'sell', 'hold'],
                description: 'The trading signal',
              },
              confidence: {
                type: 'integer',
                minimum: 0,
                maximum: 100,
                description: 'Confidence score for the signal',
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of the signal',
              },
            },
            required: ['signal', 'confidence', 'reasoning'],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse LLM response
    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(typeof content === 'string' ? content : '');

    // Combine technical signal with LLM analysis
    const finalSignal = parsed.signal === 'hold' ? null : parsed.signal;
    const finalConfidence = Math.max(parsed.confidence, technicalSignal.confidence);

    return {
      type: finalSignal,
      confidenceScore: finalConfidence,
      analysis: parsed.reasoning,
      indicators,
    };
  } catch (error) {
    console.error('LLM signal generation failed:', error);

    // Fallback to technical analysis only
    return {
      type: technicalSignal.signal,
      confidenceScore: technicalSignal.confidence,
      analysis: `Technical analysis signal: ${technicalSignal.signal || 'hold'}`,
      indicators,
    };
  }
}

/**
 * Generate and store signals for all stocks in user's watchlist
 */
export async function generateSignalsForWatchlist(
  watchlistItems: Array<{ stockId: number; ticker: string }>,
  priceHistoryMap: Map<number, PricePoint[]>,
  currentPriceMap: Map<number, number>
) {
  const results = [];

  for (const item of watchlistItems) {
    const priceHistory = priceHistoryMap.get(item.stockId);
    const currentPrice = currentPriceMap.get(item.stockId);

    if (!priceHistory || !currentPrice) {
      console.warn(`Missing data for stock ${item.ticker}`);
      continue;
    }

    const signal = await generateTradingSignal({
      ticker: item.ticker,
      stockId: item.stockId,
      priceHistory,
      currentPrice,
    });

    // Store signal in database if confidence is above threshold
    if (signal.type && signal.confidenceScore >= 50) {
      try {
        await createSignal(
          item.stockId,
          signal.type,
          signal.confidenceScore,
          Math.round(currentPrice * 100),
          signal.indicators as unknown as Record<string, unknown>,
          signal.analysis
        );

        results.push({
          ticker: item.ticker,
          signal: signal.type,
          confidence: signal.confidenceScore,
        });
      } catch (error) {
        console.error(`Failed to store signal for ${item.ticker}:`, error);
      }
    }
  }

  return results;
}
