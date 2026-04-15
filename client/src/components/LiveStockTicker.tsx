import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA'];

export function LiveStockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch top gainers from the API
  const { data: gainersData, isLoading: gainersLoading } = trpc.liveMarket.getTopGainers.useQuery(
    { tickers: DEFAULT_TICKERS, limit: 6 },
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  useEffect(() => {
    if (gainersData && Array.isArray(gainersData)) {
      const formattedStocks: StockData[] = gainersData.map((price: any) => ({
        symbol: price.ticker,
        price: price.price,
        change: price.change || 0,
        changePercent: price.changePercent || 0,
        volume: (price.volume || 0) / 1_000_000, // Convert to millions
        high: price.dayHigh || price.price,
        low: price.dayLow || price.price,
      }));
      setStocks(formattedStocks);
      setLoading(false);
      setError(null);
    }
  }, [gainersData]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 overflow-hidden border border-slate-700 animate-pulse">
        <div className="h-20 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (error || stocks.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 overflow-hidden border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-slate-200">Live Market Ticker</h3>
        </div>
        <p className="text-xs text-slate-400">Unable to load market data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 overflow-hidden border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <h3 className="text-sm font-semibold text-slate-200">Live Market Ticker</h3>
        {gainersLoading && <span className="text-xs text-slate-400 ml-auto">Updating...</span>}
      </div>

      {/* Horizontal scrolling ticker */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-2 min-w-max">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="flex-shrink-0 bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors min-w-[200px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{stock.symbol}</span>
                {stock.changePercent >= 0 ? (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp size={14} />
                    <span className="text-xs font-semibold">{stock.changePercent.toFixed(2)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <TrendingDown size={14} />
                    <span className="text-xs font-semibold">{stock.changePercent.toFixed(2)}%</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Price</span>
                  <span className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Change</span>
                  <span className={`text-xs font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Volume</span>
                  <span className="text-xs text-slate-300">{stock.volume.toFixed(1)}M</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                  <span className="text-xs text-slate-400">Range</span>
                  <span className="text-xs text-slate-300">${stock.low.toFixed(2)} - ${stock.high.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market indicators */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700">
        <div className="text-center">
          <div className="text-xs text-slate-400">Market Status</div>
          <div className="text-sm font-semibold text-emerald-400">Live</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">Top Gainers</div>
          <div className="text-sm font-semibold text-emerald-400">+{Math.max(...stocks.map(s => s.changePercent)).toFixed(2)}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">Avg Volume</div>
          <div className="text-sm font-semibold text-slate-300">{(stocks.reduce((a, b) => a + b.volume, 0) / stocks.length).toFixed(1)}M</div>
        </div>
      </div>
    </div>
  );
}
