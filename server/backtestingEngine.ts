/**
 * Backtesting Engine for Signal Validation
 * 
 * Validates trading signal accuracy by running them against historical data.
 * Calculates win rate, profit factor, and other performance metrics.
 */

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SignalEvent {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  confidence: number;
}

export interface BacktestTrade {
  entryDate: string;
  entryPrice: number;
  entryConfidence: number;
  exitDate: string;
  exitPrice: number;
  profit: number;
  profitPercent: number;
  holdDays: number;
  slippage: number;
  commission: number;
}

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // 0-1
  avgWin: number;
  avgLoss: number;
  profitFactor: number; // Total wins / Total losses
  totalProfit: number;
  totalReturn: number; // Percentage
  maxDrawdown: number; // Percentage
  sharpeRatio: number;
  avgHoldDays: number;
  trades: BacktestTrade[];
}

/**
 * Run backtest on historical signals
 */
export function runBacktest(
  signals: SignalEvent[],
  historicalPrices: HistoricalPrice[],
  options?: {
    slippagePercent?: number;
    commissionPercent?: number;
    initialCapital?: number;
    maxHoldDays?: number;
  }
): BacktestResult {
  const slippage = options?.slippagePercent ?? 0.001; // 0.1%
  const commission = options?.commissionPercent ?? 0.001; // 0.1%
  const maxHoldDays = options?.maxHoldDays ?? 30;

  const priceMap = new Map(historicalPrices.map((p) => [p.date, p]));
  const trades: BacktestTrade[] = [];

  let i = 0;
  while (i < signals.length) {
    const signal = signals[i];

    // Look for buy signal
    if (signal.type === 'buy') {
      const entryPrice = signal.price * (1 + slippage); // Add slippage
      const entryCommission = entryPrice * commission;

      // Find next sell signal or max hold days
      let exitSignal: SignalEvent | null = null;
      let holdDays = 0;

      for (let j = i + 1; j < signals.length && holdDays < maxHoldDays; j++) {
        const nextSignal = signals[j];
        const priceData = priceMap.get(nextSignal.date);

        if (priceData) {
          holdDays = daysBetween(signal.date, nextSignal.date);

          if (nextSignal.type === 'sell' || holdDays >= maxHoldDays) {
            exitSignal = nextSignal;
            break;
          }
        }
      }

      // If we found an exit, record the trade
      if (exitSignal) {
        const exitPrice = exitSignal.price * (1 - slippage); // Subtract slippage
        const exitCommission = exitPrice * commission;

        const profit = exitPrice - entryPrice - entryCommission - exitCommission;
        const profitPercent = (profit / entryPrice) * 100;
        const holdDaysActual = daysBetween(signal.date, exitSignal.date);

        trades.push({
          entryDate: signal.date,
          entryPrice,
          entryConfidence: signal.confidence,
          exitDate: exitSignal.date,
          exitPrice,
          profit,
          profitPercent,
          holdDays: holdDaysActual,
          slippage: entryPrice * slippage + exitPrice * slippage,
          commission: entryCommission + exitCommission,
        });

        i = signals.indexOf(exitSignal) + 1;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }

  return calculateMetrics(trades);
}

/**
 * Calculate backtest metrics
 */
function calculateMetrics(trades: BacktestTrade[]): BacktestResult {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      totalProfit: 0,
      totalReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      avgHoldDays: 0,
      trades: [],
    };
  }

  const winningTrades = trades.filter((t) => t.profit > 0);
  const losingTrades = trades.filter((t) => t.profit < 0);

  const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));

  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalReturn = (trades.reduce((sum, t) => sum + t.profitPercent, 0) / trades.length) * trades.length;

  const drawdowns = calculateDrawdowns(trades);
  const maxDrawdown = drawdowns.length > 0 ? Math.min(...drawdowns) : 0;

  const returns = trades.map((t) => t.profitPercent / 100);
  const sharpeRatio = calculateSharpeRatio(returns);

  const avgHoldDays =
    trades.length > 0 ? trades.reduce((sum, t) => sum + t.holdDays, 0) / trades.length : 0;

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: trades.length > 0 ? winningTrades.length / trades.length : 0,
    avgWin,
    avgLoss,
    profitFactor,
    totalProfit,
    totalReturn,
    maxDrawdown,
    sharpeRatio,
    avgHoldDays,
    trades,
  };
}

/**
 * Calculate drawdowns
 */
function calculateDrawdowns(trades: BacktestTrade[]): number[] {
  const drawdowns: number[] = [];
  let runningProfit = 0;
  let peak = 0;

  for (const trade of trades) {
    runningProfit += trade.profit;
    if (runningProfit > peak) {
      peak = runningProfit;
    }
    const drawdown = ((runningProfit - peak) / peak) * 100;
    if (drawdown < 0) {
      drawdowns.push(drawdown);
    }
  }

  return drawdowns;
}

/**
 * Calculate Sharpe Ratio (risk-adjusted return)
 */
function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (avgReturn - riskFreeRate / 252) / (stdDev / Math.sqrt(252));
}

/**
 * Days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Validate signal accuracy
 * Returns true if backtest results meet minimum standards
 */
export function isSignalAccurate(result: BacktestResult, minWinRate: number = 0.5): boolean {
  return (
    result.totalTrades >= 10 && // At least 10 trades
    result.winRate >= minWinRate && // Win rate above threshold
    result.profitFactor > 1.5 && // Profit factor above 1.5
    result.sharpeRatio > 0.5 // Positive risk-adjusted return
  );
}

/**
 * Get backtest summary for display
 */
export function getBacktestSummary(result: BacktestResult): string {
  return `
Backtest Results:
- Total Trades: ${result.totalTrades}
- Win Rate: ${(result.winRate * 100).toFixed(1)}%
- Profit Factor: ${result.profitFactor.toFixed(2)}
- Total Return: ${result.totalReturn.toFixed(2)}%
- Max Drawdown: ${result.maxDrawdown.toFixed(2)}%
- Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}
- Avg Hold Days: ${result.avgHoldDays.toFixed(1)}
  `.trim();
}
