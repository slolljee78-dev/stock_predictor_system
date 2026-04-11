/**
 * Trading Simulator Engine
 * Handles virtual portfolio management and trade execution
 */

export interface SimulatorConfig {
  commissionPercentage: number; // 0.1 = 0.1%
  slippagePercentage: number; // 0.05 = 0.05%
  minCommission: number; // Minimum commission per trade
}

export const DEFAULT_CONFIG: SimulatorConfig = {
  commissionPercentage: 0.1,
  slippagePercentage: 0.05,
  minCommission: 1,
};

export interface PortfolioPosition {
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface TradeExecution {
  success: boolean;
  message: string;
  tradeId?: number;
  executedPrice?: number;
  commission?: number;
  totalCost?: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  cash: number;
  invested: number;
  unrealizedPnL: number;
  realizedPnL: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

/**
 * Calculate commission for a trade
 */
export function calculateCommission(
  quantity: number,
  price: number,
  config: SimulatorConfig = DEFAULT_CONFIG
): number {
  const tradeValue = quantity * price;
  const commission = (tradeValue * config.commissionPercentage) / 100;
  return Math.max(commission, config.minCommission);
}

/**
 * Calculate slippage on execution price
 */
export function calculateSlippage(
  price: number,
  tradeType: "buy" | "sell",
  config: SimulatorConfig = DEFAULT_CONFIG
): number {
  const slippageAmount = (price * config.slippagePercentage) / 100;
  // Buy: price goes up, Sell: price goes down
  return tradeType === "buy" ? price + slippageAmount : price - slippageAmount;
}

/**
 * Execute a buy trade
 */
export function executeBuyTrade(
  portfolio: {
    cash: number;
    positions: Map<string, PortfolioPosition>;
  },
  ticker: string,
  quantity: number,
  currentPrice: number,
  config: SimulatorConfig = DEFAULT_CONFIG
): TradeExecution {
  // Calculate execution price with slippage
  const executionPrice = calculateSlippage(currentPrice, "buy", config);
  const commission = calculateCommission(quantity, executionPrice, config);
  const totalCost = quantity * executionPrice + commission;

  // Check if enough cash
  if (portfolio.cash < totalCost) {
    return {
      success: false,
      message: `Insufficient cash. Required: £${totalCost.toFixed(2)}, Available: £${portfolio.cash.toFixed(2)}`,
    };
  }

  // Update cash
  portfolio.cash -= totalCost;

  // Update or create position
  const existingPosition = portfolio.positions.get(ticker);
  if (existingPosition) {
    // Average up
    const totalQuantity = existingPosition.quantity + quantity;
    const totalCostBasis = existingPosition.totalCost + totalCost;
    const newEntryPrice = totalCostBasis / totalQuantity;

    existingPosition.quantity = totalQuantity;
    existingPosition.entryPrice = newEntryPrice;
    existingPosition.totalCost = totalCostBasis;
    existingPosition.currentPrice = currentPrice;
    existingPosition.currentValue = totalQuantity * currentPrice;
    existingPosition.unrealizedPnL = existingPosition.currentValue - existingPosition.totalCost;
    existingPosition.unrealizedPnLPercent =
      (existingPosition.unrealizedPnL / existingPosition.totalCost) * 100;
  } else {
    // New position
    portfolio.positions.set(ticker, {
      ticker,
      quantity,
      entryPrice: executionPrice,
      currentPrice,
      totalCost,
      currentValue: quantity * currentPrice,
      unrealizedPnL: quantity * currentPrice - totalCost,
      unrealizedPnLPercent: ((quantity * currentPrice - totalCost) / totalCost) * 100,
    });
  }

  return {
    success: true,
    message: `Bought ${quantity} shares of ${ticker} at £${executionPrice.toFixed(2)}`,
    executedPrice: executionPrice,
    commission,
    totalCost,
  };
}

/**
 * Execute a sell trade
 */
export function executeSellTrade(
  portfolio: {
    cash: number;
    positions: Map<string, PortfolioPosition>;
  },
  ticker: string,
  quantity: number,
  currentPrice: number,
  config: SimulatorConfig = DEFAULT_CONFIG
): TradeExecution {
  // Check if position exists
  const position = portfolio.positions.get(ticker);
  if (!position) {
    return {
      success: false,
      message: `No position in ${ticker} to sell`,
    };
  }

  // Check if enough shares
  if (position.quantity < quantity) {
    return {
      success: false,
      message: `Insufficient shares. Owned: ${position.quantity}, Requested: ${quantity}`,
    };
  }

  // Calculate execution price with slippage
  const executionPrice = calculateSlippage(currentPrice, "sell", config);
  const commission = calculateCommission(quantity, executionPrice, config);
  const proceeds = quantity * executionPrice - commission;

  // Calculate realized P&L
  const costBasis = (position.totalCost / position.quantity) * quantity;
  const realizedPnL = proceeds - costBasis;

  // Update cash
  portfolio.cash += proceeds;

  // Update position
  if (position.quantity === quantity) {
    // Close entire position
    portfolio.positions.delete(ticker);
  } else {
    // Partial sell
    position.quantity -= quantity;
    position.totalCost -= costBasis;
    position.currentValue = position.quantity * currentPrice;
    position.unrealizedPnL = position.currentValue - position.totalCost;
    position.unrealizedPnLPercent = (position.unrealizedPnL / position.totalCost) * 100;
  }

  return {
    success: true,
    message: `Sold ${quantity} shares of ${ticker} at £${executionPrice.toFixed(2)}, P&L: £${realizedPnL.toFixed(2)}`,
    executedPrice: executionPrice,
    commission,
    totalCost: proceeds,
  };
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(
  portfolio: {
    cash: number;
    initialCapital: number;
    positions: Map<string, PortfolioPosition>;
    trades: Array<{ type: "buy" | "sell"; realizedPnL: number }>;
    performanceHistory: number[];
  }
): PortfolioMetrics {
  // Calculate totals
  let invested = 0;
  let unrealizedPnL = 0;
  let currentValue = 0;

  portfolio.positions.forEach((position) => {
    invested += position.totalCost;
    unrealizedPnL += position.unrealizedPnL;
    currentValue += position.currentValue;
  });

  const totalValue = portfolio.cash + currentValue;
  const totalReturn = totalValue - portfolio.initialCapital;
  const totalReturnPercent = (totalReturn / portfolio.initialCapital) * 100;

  // Calculate realized P&L
  const realizedPnL = portfolio.trades.reduce((sum, trade) => sum + trade.realizedPnL, 0);

  // Calculate Sharpe Ratio
  const sharpeRatio = calculateSharpeRatio(portfolio.performanceHistory);

  // Calculate Max Drawdown
  const maxDrawdown = calculateMaxDrawdown(portfolio.performanceHistory);

  // Calculate win rate
  const winningTrades = portfolio.trades.filter((t) => t.realizedPnL > 0).length;
  const losingTrades = portfolio.trades.filter((t) => t.realizedPnL < 0).length;
  const totalTrades = portfolio.trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return {
    totalValue,
    totalReturn,
    totalReturnPercent,
    cash: portfolio.cash,
    invested,
    unrealizedPnL,
    realizedPnL,
    sharpeRatio,
    maxDrawdown,
    winRate,
    totalTrades,
    winningTrades,
    losingTrades,
  };
}

/**
 * Calculate Sharpe Ratio
 * Assumes daily returns, risk-free rate of 2% annually
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate = 0.02): number {
  if (returns.length < 2) return 0;

  const dailyRiskFreeRate = riskFreeRate / 252; // 252 trading days per year
  const excessReturns = returns.map((r) => r - dailyRiskFreeRate);

  const meanReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const variance =
    excessReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / excessReturns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Annualize Sharpe Ratio
  return (meanReturn * 252) / (stdDev * Math.sqrt(252));
}

/**
 * Calculate Maximum Drawdown
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    }
    const drawdown = ((peak - values[i]) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Validate trade parameters
 */
export function validateTradeParameters(
  quantity: number,
  price: number
): { valid: boolean; error?: string } {
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }

  if (price <= 0) {
    return { valid: false, error: "Price must be greater than 0" };
  }

  if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
    return { valid: false, error: "Invalid quantity or price" };
  }

  return { valid: true };
}
