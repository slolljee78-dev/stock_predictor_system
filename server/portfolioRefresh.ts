/**
 * Portfolio Price Refresh Service
 * Handles batch price updates for all positions in a portfolio
 */

import { fetchStockPriceWithCache, StockPrice } from "./liveMarketData";

export interface PortfolioPosition {
  ticker: string;
  quantity: number;
  entryPrice: number;
}

export interface RefreshResult {
  ticker: string;
  currentPrice: number | null;
  previousPrice: number | null;
  change: number | null;
  changePercent: number | null;
  timestamp: string | null;
  error?: string;
}

export interface PortfolioRefreshResult {
  totalPositions: number;
  successfulUpdates: number;
  failedUpdates: number;
  results: RefreshResult[];
  totalValue: number;
  totalCash: number;
  portfolioValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  refreshedAt: string;
}

/**
 * Refresh prices for all positions in a portfolio
 */
export async function refreshPortfolioPrices(
  positions: PortfolioPosition[],
  cashBalance: number,
  previousPrices?: Map<string, number>
): Promise<PortfolioRefreshResult> {
  const results: RefreshResult[] = [];
  let successfulUpdates = 0;
  let failedUpdates = 0;
  let totalValue = 0;

  // Fetch a bounded number of cached prices concurrently, then pause between
  // batches. This keeps provider load controlled without turning a portfolio
  // of dozens of positions into a multi-second serial operation.
  const batchSize = 3;
  for (let start = 0; start < positions.length; start += batchSize) {
    const batch = positions.slice(start, start + batchSize);
    const batchPrices = await Promise.all(
      batch.map(async (position) => {
        try {
          return { position, priceData: await fetchStockPriceWithCache(position.ticker) };
        } catch (error) {
          return { position, priceData: null, error };
        }
      }),
    );

    for (const { position, priceData, error } of batchPrices) {
      const previousPrice = previousPrices?.get(position.ticker);
      if (priceData) {
        const currentPrice = priceData.price;
        totalValue += currentPrice * position.quantity;
        const change = previousPrice ? currentPrice - previousPrice : 0;
        const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;
        results.push({
          ticker: position.ticker,
          currentPrice,
          previousPrice: previousPrice || null,
          change: change || null,
          changePercent: changePercent || null,
          timestamp: priceData.timestamp,
        });
        successfulUpdates++;
      } else {
        totalValue += position.entryPrice * position.quantity;
        results.push({
          ticker: position.ticker,
          currentPrice: null,
          previousPrice: previousPrice || null,
          change: null,
          changePercent: null,
          timestamp: null,
          error: error instanceof Error ? error.message : "Failed to fetch current price",
        });
        failedUpdates++;
      }
    }

    if (start + batchSize < positions.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // Calculate portfolio metrics
  const portfolioValue = totalValue + cashBalance;
  const totalReturn = portfolioValue - (positions.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0) + cashBalance);
  const totalReturnPercent = portfolioValue > 0 ? (totalReturn / portfolioValue) * 100 : 0;

  return {
    totalPositions: positions.length,
    successfulUpdates,
    failedUpdates,
    results,
    totalValue,
    totalCash: cashBalance,
    portfolioValue,
    totalReturn,
    totalReturnPercent,
    refreshedAt: new Date().toISOString(),
  };
}

/**
 * Batch refresh prices for multiple portfolios
 */
export async function refreshMultiplePortfolios(
  portfolios: Array<{
    positions: PortfolioPosition[];
    cashBalance: number;
  }>
): Promise<PortfolioRefreshResult[]> {
  const results: PortfolioRefreshResult[] = [];

  for (let i = 0; i < portfolios.length; i++) {
    const portfolio = portfolios[i];
    const result = await refreshPortfolioPrices(portfolio.positions, portfolio.cashBalance);
    results.push(result);

    // Rate limiting between portfolios
    if (i < portfolios.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Get portfolio refresh statistics
 */
export function getRefreshStatistics(result: PortfolioRefreshResult) {
  const successRate = result.totalPositions > 0 ? (result.successfulUpdates / result.totalPositions) * 100 : 0;
  const failureRate = result.totalPositions > 0 ? (result.failedUpdates / result.totalPositions) * 100 : 0;

  return {
    successRate: successRate.toFixed(1),
    failureRate: failureRate.toFixed(1),
    averageChangePercent:
      result.results.length > 0
        ? (
            result.results.reduce((sum, r) => sum + (r.changePercent || 0), 0) / result.results.length
          ).toFixed(2)
        : "0.00",
    bestPerformer: result.results.length > 0 ? result.results.reduce((best, current) => {
      if (best.changePercent === null) return current;
      if (current.changePercent === null) return best;
      return current.changePercent > best.changePercent ? current : best;
    }) : undefined,
    worstPerformer: result.results.length > 0 ? result.results.reduce((worst, current) => {
      if (worst.changePercent === null) return current;
      if (current.changePercent === null) return worst;
      return current.changePercent < worst.changePercent ? current : worst;
    }) : undefined,
  };
}
