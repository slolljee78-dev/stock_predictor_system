import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, Minus, RotateCcw, DollarSign } from 'lucide-react';

interface SimulatedPosition {
  id: string;
  symbol: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  type: 'long' | 'short';
}

interface TradeSimulatorState {
  portfolio: SimulatedPosition[];
  cash: number;
  totalValue: number;
  trades: number;
  winRate: number;
}

export function TradeSimulator() {
  const [state, setState] = useState<TradeSimulatorState>({
    portfolio: [
      { id: '1', symbol: 'AAPL', shares: 10, entryPrice: 175.50, currentPrice: 182.52, type: 'long' },
      { id: '2', symbol: 'TSLA', shares: 5, entryPrice: 235.00, currentPrice: 242.84, type: 'long' },
    ],
    cash: 50000,
    totalValue: 0,
    trades: 2,
    winRate: 75,
  });

  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Calculate portfolio value
  const portfolioValue = state.portfolio.reduce((sum, pos) => {
    const positionValue = pos.shares * pos.currentPrice;
    return sum + positionValue;
  }, 0);

  const totalValue = state.cash + portfolioValue;
  const gainLoss = totalValue - 100000; // Assuming $100k starting capital
  const gainLossPercent = (gainLoss / 100000) * 100;

  const handleAddPosition = () => {
    if (!newSymbol || !newShares || !newPrice) return;

    const cost = parseInt(newShares) * parseFloat(newPrice);
    if (cost > state.cash) {
      alert('Insufficient cash');
      return;
    }

    const newPosition: SimulatedPosition = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      shares: parseInt(newShares),
      entryPrice: parseFloat(newPrice),
      currentPrice: parseFloat(newPrice),
      type: 'long',
    };

    setState({
      ...state,
      portfolio: [...state.portfolio, newPosition],
      cash: state.cash - cost,
      trades: state.trades + 1,
    });

    setNewSymbol('');
    setNewShares('');
    setNewPrice('');
  };

  const handleClosePosition = (id: string) => {
    const position = state.portfolio.find(p => p.id === id);
    if (!position) return;

    const proceeds = position.shares * position.currentPrice;
    const gainLoss = proceeds - (position.shares * position.entryPrice);

    setState({
      ...state,
      portfolio: state.portfolio.filter(p => p.id !== id),
      cash: state.cash + proceeds,
      winRate: gainLoss > 0 ? Math.min(100, state.winRate + 5) : Math.max(0, state.winRate - 5),
    });
  };

  const handleReset = () => {
    setState({
      portfolio: [],
      cash: 100000,
      totalValue: 100000,
      trades: 0,
      winRate: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-400" />
            Paper Trading Portfolio
          </CardTitle>
          <CardDescription className="text-slate-400">Simulate trades with virtual money</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Portfolio Value */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
              <div className="text-2xl font-bold text-white">${totalValue.toFixed(0)}</div>
              <div className={`text-xs mt-1 ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(0)} ({gainLossPercent.toFixed(1)}%)
              </div>
            </div>

            {/* Cash */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Available Cash</div>
              <div className="text-2xl font-bold text-white">${state.cash.toFixed(0)}</div>
              <div className="text-xs text-slate-300 mt-1">{((state.cash / totalValue) * 100).toFixed(1)}% of portfolio</div>
            </div>

            {/* Positions */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Open Positions</div>
              <div className="text-2xl font-bold text-white">{state.portfolio.length}</div>
              <div className="text-xs text-slate-300 mt-1">Value: ${portfolioValue.toFixed(0)}</div>
            </div>

            {/* Win Rate */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-emerald-400">{state.winRate}%</div>
              <div className="text-xs text-slate-300 mt-1">{state.trades} trades</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      {state.portfolio.length > 0 && (
        <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.portfolio.map((position) => {
                const gainLoss = (position.currentPrice - position.entryPrice) * position.shares;
                const gainLossPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
                const isProfit = gainLoss >= 0;

                return (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold text-white">{position.symbol}</div>
                          <div className="text-xs text-slate-400">{position.shares} shares @ ${position.entryPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <div className="text-sm font-semibold text-white">${(position.shares * position.currentPrice).toFixed(0)}</div>
                      <div className={`text-xs flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isProfit ? '+' : ''}{gainLoss.toFixed(0)} ({gainLossPercent.toFixed(1)}%)
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClosePosition(position.id)}
                      className="border-slate-600 hover:bg-red-900/20 hover:border-red-600 text-slate-300 hover:text-red-400"
                    >
                      Close
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Position */}
      <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-400" />
            Open New Position
          </CardTitle>
          <CardDescription className="text-slate-400">Simulate a buy order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
            />
            <Input
              placeholder="Shares"
              type="number"
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
            />
            <Input
              placeholder="Entry Price"
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={handleAddPosition}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Buy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-slate-200 gap-2"
        >
          <RotateCcw size={16} />
          Reset Portfolio
        </Button>
      </div>
    </div>
  );
}
