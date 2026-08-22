/**
 * Backtesting Engine
 * Simulates trading strategies on historical data with realistic conditions.
 * Includes dividend handling and corporate action (split/merger) adjustments.
 */

import { MarketData } from "./realMarketDataFetcher";
import { calculateAllIndicators } from "./indicators";

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDEND & CORPORATE ACTION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DividendEvent {
  /** Ex-dividend date (YYYY-MM-DD or timestamp ms) */
  exDate: string | number;
  /** Cash dividend per share */
  amount: number;
  /** Optional: dividend type */
  type?: 'cash' | 'special' | 'stock';
}

export interface StockSplitEvent {
  /** Split effective date (YYYY-MM-DD or timestamp ms) */
  date: string | number;
  /** e.g. 2 for a 2-for-1 split, 0.5 for a 1-for-2 reverse split */
  ratio: number;
}

export interface CorporateActions {
  dividends?: DividendEvent[];
  splits?: StockSplitEvent[];
}

/** Extended metrics that include dividend income */
export interface BacktestMetricsWithDividends extends BacktestMetrics {
  totalDividendIncome: number;
  dividendYieldOnCost: number; // % of initial capital
  totalReturnWithDividends: number; // % including dividend reinvestment
  dividendEvents: number;
}

/**
 * Generate buy/sell signals based on technical indicators for backtesting
 */
function generateBacktestSignal(
  indicators: any,
  currentPrice: number
): { type: "BUY" | "SELL" | "HOLD"; confidence: number } {
  let signalType: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 0;
  let signalCount = 0;
  let buySignals = 0;
  let sellSignals = 0;

  // RSI Analysis (14-period)
  if (indicators.rsi14 !== undefined && indicators.rsi14 !== null) {
    signalCount++;
    if (indicators.rsi14 < 30) {
      buySignals++;
      confidence += 40;
    } else if (indicators.rsi14 > 70) {
      sellSignals++;
      confidence += 40;
    } else if (indicators.rsi14 < 50) {
      buySignals++;
      confidence += 20;
    } else {
      sellSignals++;
      confidence += 20;
    }
  }

  // MACD Analysis
  if (indicators.macd !== undefined && indicators.macdSignal !== undefined) {
    signalCount++;
    const macdHistogram = indicators.macd - indicators.macdSignal;
    if (macdHistogram > 0 && indicators.macd > 0) {
      buySignals++;
      confidence += 30;
    } else if (macdHistogram < 0 && indicators.macd < 0) {
      sellSignals++;
      confidence += 30;
    } else if (macdHistogram > 0) {
      buySignals++;
      confidence += 25;
    } else {
      sellSignals++;
      confidence += 25;
    }
  }

  // SMA Analysis
  if (indicators.sma20 !== undefined && indicators.sma50 !== undefined) {
    signalCount++;
    if (currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50) {
      buySignals++;
      confidence += 25;
    } else if (currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50) {
      sellSignals++;
      confidence += 25;
    }
  }

  // Bollinger Bands Analysis
  if (indicators.bbUpper !== undefined && indicators.bbLower !== undefined) {
    signalCount++;
    const bbMiddle = (indicators.bbUpper + indicators.bbLower) / 2;
    if (currentPrice < indicators.bbLower) {
      buySignals++;
      confidence += 20;
    } else if (currentPrice > indicators.bbUpper) {
      sellSignals++;
      confidence += 20;
    }
  }

  // Determine final signal
  if (buySignals > sellSignals) {
    signalType = "BUY";
  } else if (sellSignals > buySignals) {
    signalType = "SELL";
  } else {
    signalType = "HOLD";
  }

  // Normalize confidence
  const normalizedConfidence = signalCount > 0 ? Math.min(100, Math.round((confidence / signalCount) * 1.2)) : 0;

  return {
    type: signalType,
    confidence: normalizedConfidence,
  };
}

export interface BacktestTrade {
  entryTime: Date;
  entryPrice: number;
  exitTime: Date;
  exitPrice: number;
  quantity: number;
  type: "BUY" | "SELL";
  profit: number;
  profitPercent: number;
  confidence: number;
}

export interface BacktestMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalReturn: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  recoveryFactor: number;
  trades: BacktestTrade[];
}

/**
 * Run backtest on historical data
 */
export async function runBacktestSimulation(
  data: MarketData[],
  initialCapital: number = 10000,
  riskPerTrade: number = 0.02,
  slippage: number = 0.0005,
  commission: number = 0.001
): Promise<BacktestMetrics> {
  const trades: BacktestTrade[] = [];
  let capital = initialCapital;
  let position: { entryPrice: number; entryTime: Date; quantity: number } | null = null;
  let peakCapital = initialCapital;
  let maxDrawdown = 0;

  const equity: number[] = [initialCapital];

  // Process each candle
  for (let i = 20; i < data.length - 1; i++) {
    const currentData = data.slice(0, i + 1);
    const nextCandle = data[i + 1];

    // Calculate indicators (convert to PricePoint format)
    const pricePoints = currentData.map(d => ({
      date: d.timestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    }));
    const indicators = calculateAllIndicators(pricePoints);

    // Generate signal based on technical indicators
    const signal = generateBacktestSignal(indicators, nextCandle.close);

    // Check if we should enter or exit
    if (!position && signal.type === "BUY" && signal.confidence > 60) {
      // Enter long position
      const entryPrice = currentData[currentData.length - 1].close * (1 + slippage);
      const positionSize = (capital * riskPerTrade) / entryPrice;

      position = {
        entryPrice,
        entryTime: currentData[currentData.length - 1].timestamp,
        quantity: positionSize,
      };
    } else if (position && (signal.type as any) === "SELL" && signal.confidence > 60) {
      // Exit position
      const exitPrice = nextCandle.close * (1 - slippage);
      const profit = (exitPrice - position.entryPrice) * position.quantity;
      const profitPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;

      // Apply commission
      const netProfit = profit - capital * commission;
      capital += netProfit;

      trades.push({
        entryTime: position.entryTime,
        entryPrice: position.entryPrice,
        exitTime: nextCandle.timestamp,
        exitPrice,
        quantity: position.quantity,
        type: "BUY",
        profit: netProfit,
        profitPercent,
        confidence: signal.confidence,
      });

      position = null;
    }

    // Update equity
    if (position) {
      const currentPrice = nextCandle.close;
      const unrealizedProfit = (currentPrice - position.entryPrice) * position.quantity;
      equity.push(capital + unrealizedProfit);
    } else {
      equity.push(capital);
    }

    // Track drawdown
    if (capital > peakCapital) {
      peakCapital = capital;
    }
    const drawdown = (peakCapital - capital) / peakCapital;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // Calculate metrics
  const winningTrades = trades.filter((t) => t.profit > 0).length;
  const losingTrades = trades.filter((t) => t.profit < 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;

  const avgWin =
    winningTrades > 0
      ? trades.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / winningTrades
      : 0;
  const avgLoss =
    losingTrades > 0
      ? trades.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) / losingTrades
      : 0;

  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : avgWin > 0 ? Infinity : 1;

  // Calculate Sharpe ratio
  const returns = [];
  for (let i = 1; i < equity.length; i++) {
    returns.push((equity[i] - equity[i - 1]) / equity[i - 1]);
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn * 252) / stdDev : 0; // Annualized

  // Recovery factor
  const recoveryFactor = maxDrawdown > 0 ? totalReturn / (maxDrawdown * 100) : 0;

  return {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate,
    totalProfit,
    totalReturn,
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor,
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100,
    recoveryFactor,
    trades,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDEND-AWARE BACKTEST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a date value (string YYYY-MM-DD or ms timestamp) to a Date object.
 */
function toDate(d: string | number): Date {
  return typeof d === 'number' ? new Date(d) : new Date(d);
}

/**
 * Apply split adjustments to historical data.
 * All prices BEFORE the split date are multiplied by 1/ratio so that the
 * series is on a consistent post-split basis.
 */
function applySplitAdjustments(data: MarketData[], splits: StockSplitEvent[]): MarketData[] {
  if (!splits || splits.length === 0) return data;

  // Sort splits chronologically
  const sortedSplits = [...splits].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
  );

  return data.map(candle => {
    let adjustedOpen = candle.open;
    let adjustedHigh = candle.high;
    let adjustedLow = candle.low;
    let adjustedClose = candle.close;
    let adjustedVolume = candle.volume;

    for (const split of sortedSplits) {
      const splitDate = toDate(split.date);
      if (candle.timestamp < splitDate) {
        // Prices before the split need to be divided by the ratio
        adjustedOpen /= split.ratio;
        adjustedHigh /= split.ratio;
        adjustedLow /= split.ratio;
        adjustedClose /= split.ratio;
        adjustedVolume *= split.ratio;
      }
    }

    return {
      ...candle,
      open: adjustedOpen,
      high: adjustedHigh,
      low: adjustedLow,
      close: adjustedClose,
      volume: adjustedVolume,
    };
  });
}

/**
 * Run a full backtest with dividend reinvestment and corporate action handling.
 *
 * Dividends are credited to cash on the ex-dividend date (if a position is held).
 * Reinvestment: dividend cash is immediately used to buy additional shares at
 * the closing price of the ex-dividend candle.
 * Stock splits: all historical prices are adjusted before the simulation runs.
 */
export async function runBacktestWithDividends(
  data: MarketData[],
  corporateActions: CorporateActions = {},
  initialCapital: number = 10000,
  riskPerTrade: number = 0.02,
  slippage: number = 0.0005,
  commission: number = 0.001,
  reinvestDividends: boolean = true
): Promise<BacktestMetricsWithDividends> {
  // 1. Apply split adjustments to the price series
  const adjustedData = applySplitAdjustments(data, corporateActions.splits ?? []);

  // 2. Build a sorted dividend schedule for quick lookup
  const dividendSchedule = (corporateActions.dividends ?? []).map(d => ({
    ...d,
    exDateMs: toDate(d.exDate).getTime(),
  })).sort((a, b) => a.exDateMs - b.exDateMs);

  const trades: BacktestTrade[] = [];
  let capital = initialCapital;
  let position: { entryPrice: number; entryTime: Date; quantity: number } | null = null;
  let peakCapital = initialCapital;
  let maxDrawdown = 0;
  let totalDividendIncome = 0;
  let dividendEventCount = 0;

  const equity: number[] = [initialCapital];

  for (let i = 20; i < adjustedData.length - 1; i++) {
    const currentData = adjustedData.slice(0, i + 1);
    const currentCandle = adjustedData[i];
    const nextCandle = adjustedData[i + 1];

    // ── Dividend processing ──────────────────────────────────────────────────
    if (position !== null && dividendSchedule.length > 0) {
      const pos = position; // narrow to non-null
      const candleDateMs: number = currentCandle.timestamp instanceof Date
        ? currentCandle.timestamp.getTime()
        : Number(currentCandle.timestamp);
      for (const div of dividendSchedule) {
        // Credit dividend if today is on or after ex-date and we haven't paid it yet
        if (
          candleDateMs >= div.exDateMs &&
          candleDateMs < div.exDateMs + 24 * 60 * 60 * 1000
        ) {
          const dividendCash: number = div.amount * pos.quantity;
          totalDividendIncome += dividendCash;
          dividendEventCount++;

          if (reinvestDividends) {
            // Buy additional shares at today's close
            const additionalShares: number = dividendCash / currentCandle.close;
            const updatedPosition: { entryPrice: number; entryTime: Date; quantity: number } = {
              entryPrice: pos.entryPrice,
              entryTime: pos.entryTime,
              quantity: pos.quantity + additionalShares,
            };
            position = updatedPosition;
            console.log(
              `[Backtest] Dividend reinvested: $${dividendCash.toFixed(2)} → ${additionalShares.toFixed(4)} extra shares at $${currentCandle.close.toFixed(2)}`
            );
          } else {
            capital += dividendCash;
            console.log(`[Backtest] Dividend credited: $${dividendCash.toFixed(2)} to cash`);
          }
        }
      }
    }

    // ── Signal generation ────────────────────────────────────────────────────
    const pricePoints = currentData.map(d => ({
      date: d.timestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
    const indicators = calculateAllIndicators(pricePoints);
    const signal = generateBacktestSignal(indicators, nextCandle.close);

    // ── Entry ────────────────────────────────────────────────────────────────
    if (!position && signal.type === 'BUY' && signal.confidence > 60) {
      const entryPrice = currentData[currentData.length - 1].close * (1 + slippage);
      const positionSize = (capital * riskPerTrade) / entryPrice;
      position = { entryPrice, entryTime: currentData[currentData.length - 1].timestamp, quantity: positionSize };
    }
    // ── Exit ─────────────────────────────────────────────────────────────────
    else if (position && (signal.type as any) === 'SELL' && signal.confidence > 60) {
      const exitPrice = nextCandle.close * (1 - slippage);
      const profit = (exitPrice - position.entryPrice) * position.quantity;
      const profitPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;
      const netProfit = profit - capital * commission;
      capital += netProfit;

      trades.push({
        entryTime: position.entryTime,
        entryPrice: position.entryPrice,
        exitTime: nextCandle.timestamp,
        exitPrice,
        quantity: position.quantity,
        type: 'BUY',
        profit: netProfit,
        profitPercent,
        confidence: signal.confidence,
      });

      position = null;
    }

    // ── Equity tracking ──────────────────────────────────────────────────────
    if (position) {
      equity.push(capital + (nextCandle.close - position.entryPrice) * position.quantity);
    } else {
      equity.push(capital);
    }

    if (capital > peakCapital) peakCapital = capital;
    const drawdown = (peakCapital - capital) / peakCapital;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // ── Metrics ──────────────────────────────────────────────────────────────
  const winningTrades = trades.filter(t => t.profit > 0).length;
  const losingTrades = trades.filter(t => t.profit < 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;
  const totalReturnWithDividends = (((capital + totalDividendIncome) - initialCapital) / initialCapital) * 100;

  const avgWin = winningTrades > 0
    ? trades.filter(t => t.profit > 0).reduce((s, t) => s + t.profit, 0) / winningTrades : 0;
  const avgLoss = losingTrades > 0
    ? trades.filter(t => t.profit < 0).reduce((s, t) => s + t.profit, 0) / losingTrades : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : avgWin > 0 ? Infinity : 1;

  const returns = equity.slice(1).map((e, i) => (e - equity[i]) / equity[i]);
  const meanReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const variance = returns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) / (returns.length || 1);
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn * 252) / stdDev : 0;
  const recoveryFactor = maxDrawdown > 0 ? totalReturn / (maxDrawdown * 100) : 0;

  const baseMetrics: BacktestMetrics = {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate,
    totalProfit,
    totalReturn,
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor,
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100,
    recoveryFactor,
    trades,
  };

  return {
    ...baseMetrics,
    totalDividendIncome,
    dividendYieldOnCost: (totalDividendIncome / initialCapital) * 100,
    totalReturnWithDividends,
    dividendEvents: dividendEventCount,
  };
}

/**
 * Walk-forward backtest (out-of-sample testing)
 */
export async function runWalkForwardBacktest(
  data: MarketData[],
  trainingPeriod: number = 252, // 1 year of trading days
  testingPeriod: number = 63, // 3 months
  initialCapital: number = 10000
): Promise<BacktestMetrics[]> {
  const results: BacktestMetrics[] = [];

  for (let i = trainingPeriod; i < data.length - testingPeriod; i += testingPeriod) {
    const testData = data.slice(i, i + testingPeriod);

    if (testData.length < testingPeriod) {
      break;
    }

    const result = await runBacktestSimulation(testData, initialCapital);
    results.push(result);
  }

  return results;
}

/**
 * Monte Carlo simulation for strategy robustness
 */
export function runMonteCarloSimulation(
  trades: BacktestTrade[],
  iterations: number = 1000,
  initialCapital: number = 10000
): { avgReturn: number; minReturn: number; maxReturn: number; stdDev: number } {
  const returns: number[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    // Randomly shuffle trades
    const shuffledTrades = [...trades].sort(() => Math.random() - 0.5);

    let capital = initialCapital;
    for (const trade of shuffledTrades) {
      capital += trade.profit;
    }

    const returnPercent = ((capital - initialCapital) / initialCapital) * 100;
    returns.push(returnPercent);
  }

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const minReturn = Math.min(...returns);
  const maxReturn = Math.max(...returns);
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return { avgReturn, minReturn, maxReturn, stdDev };
}

/**
 * Parameter optimization using grid search
 */
export interface OptimizationParams {
  rsiThresholdMin: number;
  rsiThresholdMax: number;
  macdThresholdMin: number;
  macdThresholdMax: number;
  confidenceThresholdMin: number;
  confidenceThresholdMax: number;
}

export async function optimizeParameters(
  data: MarketData[],
  params: OptimizationParams,
  step: number = 5
): Promise<{ bestParams: any; bestReturn: number; results: any[] }> {
  const results: any[] = [];
  let bestReturn = -Infinity;
  let bestParams = null;

  // Grid search
  for (let rsi = params.rsiThresholdMin; rsi <= params.rsiThresholdMax; rsi += step) {
    for (let macd = params.macdThresholdMin; macd <= params.macdThresholdMax; macd += step) {
      for (
        let confidence = params.confidenceThresholdMin;
        confidence <= params.confidenceThresholdMax;
        confidence += step
      ) {
        const result = await runBacktestSimulation(data);

        results.push({
          rsi,
          macd,
          confidence,
          return: result.totalReturn,
          sharpeRatio: result.sharpeRatio,
        });

        if (result.totalReturn > bestReturn) {
          bestReturn = result.totalReturn;
          bestParams = { rsi, macd, confidence };
        }
      }
    }
  }

  return { bestParams: bestParams || params, bestReturn, results };
}
