/**
 * Live Trading Simulator
 * Executes trades using live market prices instead of historical data
 */

import { fetchStockPriceWithCache } from "./liveMarketData";

export interface LiveTradeExecution {
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  requestedPrice: number;
  executedPrice: number;
  executionTime: string;
  slippage: number;
  commission: number;
  totalCost: number;
  success: boolean;
  error?: string;
}

export interface LivePosition {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  value: number;
}

export interface LivePortfolio {
  totalCapital: number;
  cashBalance: number;
  investedValue: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: LivePosition[];
  timestamp: string;
}

/**
 * Execute a live trade using current market prices
 */
export async function executeLiveTradeWithMarketPrice(
  ticker: string,
  type: "BUY" | "SELL",
  quantity: number,
  requestedPrice: number,
  slippagePercent: number = 0.05,
  commissionPercent: number = 0.1
): Promise<LiveTradeExecution> {
  try {
    // Fetch current market price
    const priceData = await fetchStockPriceWithCache(ticker);

    if (!priceData) {
      return {
        ticker,
        type,
        quantity,
        requestedPrice,
        executedPrice: 0,
        executionTime: new Date().toISOString(),
        slippage: 0,
        commission: 0,
        totalCost: 0,
        success: false,
        error: `Could not fetch current price for ${ticker}`,
      };
    }

    const currentPrice = priceData.price;

    // Calculate slippage (worse price due to market impact)
    const slippageAmount = currentPrice * (slippagePercent / 100);
    const executedPrice = type === "BUY" ? currentPrice + slippageAmount : currentPrice - slippageAmount;

    // Calculate commission
    const tradeValue = executedPrice * quantity;
    const commission = tradeValue * (commissionPercent / 100);

    // Total cost (including commission)
    const totalCost = tradeValue + commission;

    return {
      ticker,
      type,
      quantity,
      requestedPrice,
      executedPrice,
      executionTime: new Date().toISOString(),
      slippage: slippageAmount,
      commission,
      totalCost,
      success: true,
    };
  } catch (error) {
    return {
      ticker,
      type,
      quantity,
      requestedPrice,
      executedPrice: 0,
      executionTime: new Date().toISOString(),
      slippage: 0,
      commission: 0,
      totalCost: 0,
      success: false,
      error: `Trade execution failed: ${error}`,
    };
  }
}

/**
 * Calculate portfolio value with live prices
 */
export async function calculateLivePortfolioValue(
  positions: Array<{ ticker: string; quantity: number; averagePrice: number }>,
  cashBalance: number
): Promise<LivePortfolio> {
  const livePositions: LivePosition[] = [];
  let investedValue = 0;

  for (const position of positions) {
    const priceData = await fetchStockPriceWithCache(position.ticker);
    const currentPrice = priceData?.price || position.averagePrice;

    const positionValue = currentPrice * position.quantity;
    const unrealizedPnL = positionValue - position.averagePrice * position.quantity;
    const unrealizedPnLPercent = (unrealizedPnL / (position.averagePrice * position.quantity)) * 100;

    livePositions.push({
      ticker: position.ticker,
      quantity: position.quantity,
      averagePrice: position.averagePrice,
      currentPrice,
      unrealizedPnL,
      unrealizedPnLPercent,
      value: positionValue,
    });

    investedValue += positionValue;
  }

  const totalValue = investedValue + cashBalance;
  const totalPnL = totalValue - (investedValue + cashBalance);
  const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

  return {
    totalCapital: investedValue + cashBalance,
    cashBalance,
    investedValue,
    totalValue,
    totalPnL,
    totalPnLPercent,
    positions: livePositions,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get live price for a position
 */
export async function getLivePositionValue(ticker: string, quantity: number, averagePrice: number): Promise<LivePosition> {
  const priceData = await fetchStockPriceWithCache(ticker);
  const currentPrice = priceData?.price || averagePrice;

  const positionValue = currentPrice * quantity;
  const unrealizedPnL = positionValue - averagePrice * quantity;
  const unrealizedPnLPercent = (unrealizedPnL / (averagePrice * quantity)) * 100;

  return {
    ticker,
    quantity,
    averagePrice,
    currentPrice,
    unrealizedPnL,
    unrealizedPnLPercent,
    value: positionValue,
  };
}
