type WatchlistItemLike = {
  stockId?: number | null;
  ticker: string;
};

type SignalLike = {
  ticker: string;
};

type SearchResultLike = {
  id: number;
  ticker: string;
};

export type QuickAddStock = {
  ticker: string;
  name: string;
  exchange: string;
  type: "equity";
  currency: "USD";
};

export const QUICK_ADD_STOCKS: readonly QuickAddStock[] = [
  { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "equity", currency: "USD" },
  { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: "equity", currency: "USD" },
  { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: "equity", currency: "USD" },
  { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", type: "equity", currency: "USD" },
  { ticker: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", type: "equity", currency: "USD" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", type: "equity", currency: "USD" },
] as const;

export function calculateSignalCoverage(
  watchlist: WatchlistItemLike[],
  signals: SignalLike[]
): number {
  if (!watchlist.length) return 0;

  const watchlistTickers = new Set(watchlist.map((item) => item.ticker));
  const covered = signals.filter((signal) => watchlistTickers.has(signal.ticker)).length;

  return Math.min(100, Math.round((covered / watchlist.length) * 100));
}

export function isStockAlreadyInWatchlist(
  watchlist: WatchlistItemLike[],
  stock: SearchResultLike
): boolean {
  return watchlist.some(
    (item) => item.stockId === stock.id || item.ticker === stock.ticker
  );
}
