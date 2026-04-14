import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

export function LiveStockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([
    { symbol: 'AAPL', price: 182.52, change: 2.45, changePercent: 1.36, volume: 52.3, high: 183.50, low: 180.10 },
    { symbol: 'MSFT', price: 378.91, change: -1.23, changePercent: -0.32, volume: 18.9, high: 380.50, low: 377.20 },
    { symbol: 'GOOGL', price: 139.67, change: 3.12, changePercent: 2.28, volume: 24.5, high: 140.30, low: 137.40 },
    { symbol: 'AMZN', price: 178.45, change: 5.67, changePercent: 3.28, volume: 41.2, high: 179.20, low: 175.80 },
    { symbol: 'NVDA', price: 875.43, change: -12.34, changePercent: -1.39, volume: 35.8, high: 888.90, low: 872.10 },
    { symbol: 'TSLA', price: 242.84, change: 8.92, changePercent: 3.81, volume: 127.5, high: 245.60, low: 239.30 },
  ]);

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks =>
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: stock.price + (Math.random() - 0.5) * 2 - stock.price,
          changePercent: ((Math.random() - 0.5) * 4),
          volume: stock.volume + (Math.random() - 0.5) * 10,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setScrollPosition(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 overflow-hidden border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <h3 className="text-sm font-semibold text-slate-200">Live Market Ticker</h3>
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
                {stock.change >= 0 ? (
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
                  <span className={`text-xs font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
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
          <div className="text-sm font-semibold text-emerald-400">Open</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">S&P 500</div>
          <div className="text-sm font-semibold text-emerald-400">+1.24%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">VIX</div>
          <div className="text-sm font-semibold text-slate-300">18.45</div>
        </div>
      </div>
    </div>
  );
}
