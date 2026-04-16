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
