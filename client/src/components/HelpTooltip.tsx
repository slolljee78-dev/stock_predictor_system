import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  title?: string;
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpTooltip({ title, content, side = 'right', className = '' }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors ${className}`}
            aria-label={title || 'More information'}
          >
            <HelpCircle className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && <p className="font-medium mb-1">{title}</p>}
          <div className="text-xs leading-relaxed">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined help content for common concepts
export const HELP_CONTENT = {
  confidence: {
    title: 'Confidence Score',
    content: 'A percentage (25-100%) indicating how strong the signal is. Higher confidence means more technical indicators align on the same direction. 75%+ is considered high confidence.',
  },
  signalType: {
    title: 'Signal Types',
    content: (
      <div className="space-y-1">
        <p><strong>Buy:</strong> Technical indicators suggest upward momentum</p>
        <p><strong>Sell:</strong> Technical indicators suggest downward momentum</p>
        <p><strong>Hold:</strong> Mixed signals or no clear direction</p>
      </div>
    ),
  },
  rsi: {
    title: 'RSI (Relative Strength Index)',
    content: 'Measures momentum on a scale of 0-100. Above 70 = overbought (potential sell), Below 30 = oversold (potential buy). Range 30-70 = neutral.',
  },
  macd: {
    title: 'MACD (Moving Average Convergence Divergence)',
    content: 'Tracks the relationship between two moving averages. Positive MACD = bullish momentum, Negative MACD = bearish momentum. Crossovers signal potential trend changes.',
  },
  bollingerBands: {
    title: 'Bollinger Bands',
    content: 'Shows volatility and price levels. Price near upper band = potentially overbought, near lower band = potentially oversold. Wider bands = higher volatility.',
  },
  sma: {
    title: 'SMA (Simple Moving Average)',
    content: 'Average price over a specific period (e.g., 50-day or 200-day). Price above SMA = uptrend, below SMA = downtrend. Useful for identifying trend direction.',
  },
  simulatorCommission: {
    title: 'Commission',
    content: 'A 0.1% fee charged on every trade (buy or sell) to simulate realistic trading costs. This is deducted from your portfolio value.',
  },
  simulatorSlippage: {
    title: 'Slippage',
    content: 'The difference between your expected execution price and actual price. Simulated at 0.05% to account for market volatility and bid-ask spreads.',
  },
  paperTrading: {
    title: 'Paper Trading',
    content: 'Virtual trading with simulated money. No real capital is at risk. Use this to test strategies and validate signals before trading with real money.',
  },
  autoTrading: {
    title: 'Auto-Trading',
    content: 'The simulator automatically scans stocks and executes trades based on live signals. Useful for testing how a signal-following strategy would perform without manual intervention.',
  },
  dataFreshness: {
    title: 'Data Freshness',
    content: 'Signals are generated daily using end-of-day market data. They work best for swing trades (3-5 day holds), not day trading. Real-time data updates every 15 minutes.',
  },
  watchlist: {
    title: 'Watchlist',
    content: 'A personalized list of stocks you want to monitor. Add stocks here to see their latest signals, price changes, and technical indicators in one place.',
  },
  portfolio: {
    title: 'Portfolio',
    content: 'Your collection of open positions and trade history. Track your unrealized P&L (open positions), realized P&L (closed trades), and overall performance.',
  },
  limitOrder: {
    title: 'Limit Order',
    content: 'Buy at or below a specified price, or sell at or above a specified price. The order remains pending until the price reaches your limit. May not execute if price never reaches your limit.',
  },
  stopLossOrder: {
    title: 'Stop-Loss Order',
    content: 'Automatically sells a position if the price drops below your specified level. Used to limit losses on existing positions. Converts to a market order when triggered.',
  },
};
