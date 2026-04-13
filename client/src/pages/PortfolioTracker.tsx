import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Plus, X } from 'lucide-react';

export default function PortfolioTracker() {
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [closingTradeId, setClosingTradeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    ticker: '',
    entryPrice: '',
    quantity: '',
    type: 'buy' as 'buy' | 'sell',
    notes: '',
  });
  const [exitPrice, setExitPrice] = useState('');

  // Fetch data
  const metricsQuery = trpc.portfolio.getMetrics.useQuery();
  const tradesQuery = trpc.portfolio.getTrades.useQuery({ status: 'all', limit: 100 });

  // Mutations
  const addTradeMutation = trpc.portfolio.addTrade.useMutation({
    onSuccess: () => {
      metricsQuery.refetch();
      tradesQuery.refetch();
      setFormData({ ticker: '', entryPrice: '', quantity: '', type: 'buy', notes: '' });
      setShowAddTrade(false);
    },
  });

  const closeTradeM = trpc.portfolio.closeTrade.useMutation({
    onSuccess: () => {
      metricsQuery.refetch();
      tradesQuery.refetch();
      setClosingTradeId(null);
      setExitPrice('');
    },
  });

  const deleteTradeM = trpc.portfolio.deleteTrade.useMutation({
    onSuccess: () => {
      metricsQuery.refetch();
      tradesQuery.refetch();
    },
  });

  const metrics = metricsQuery.data?.data;
  const trades = tradesQuery.data?.data || [];

  const handleAddTrade = () => {
    if (!formData.ticker || !formData.entryPrice || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    addTradeMutation.mutate({
      ticker: formData.ticker.toUpperCase(),
      entryPrice: parseFloat(formData.entryPrice),
      quantity: parseFloat(formData.quantity),
      type: formData.type,
      notes: formData.notes || undefined,
    });
  };

  const handleCloseTrade = (tradeId: number) => {
    if (!exitPrice) {
      alert('Please enter exit price');
      return;
    }

    closeTradeM.mutate({
      tradeId,
      exitPrice: parseFloat(exitPrice),
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black mb-2">Portfolio Tracker</h1>
            <p className="text-muted-foreground">Track your trades and monitor performance</p>
          </div>
          <Button
            onClick={() => setShowAddTrade(!showAddTrade)}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>

        {/* Add Trade Form */}
        {showAddTrade && (
          <Card className="mb-8 border-accent/50">
            <CardHeader>
              <CardTitle>Add New Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ticker</label>
                  <Input
                    placeholder="e.g., AAPL"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Entry Price (£)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Quantity</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'buy' | 'sell' })}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Notes (optional)</label>
                  <Input
                    placeholder="Add notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddTrade}
                  disabled={addTradeMutation.isPending}
                  className="bg-accent"
                >
                  {addTradeMutation.isPending ? 'Adding...' : 'Add Trade'}
                </Button>
                <Button
                  onClick={() => setShowAddTrade(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-black ${metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  £{Math.abs(metrics.totalReturn).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent">{metrics.winRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.winningTrades} wins, {metrics.losingTrades} losses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent-gold">{metrics.profitFactor}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg Win: £{metrics.averageWin}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent-emerald">£{metrics.currentPortfolioValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Invested: £{metrics.totalInvested.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Trades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trades</CardTitle>
            <CardDescription>
              {metrics?.totalTrades || 0} total trades ({metrics?.openTrades || 0} open)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Entry Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold">Exit Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Return</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-4 font-semibold">{trade.ticker}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trade.type === 'buy'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">£{trade.entryPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">{trade.quantity}</td>
                      <td className="py-3 px-4">
                        {trade.status === 'closed' ? `£${trade.exitPrice?.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {trade.status === 'closed' && trade.returnAmount ? (
                          <span className={trade.returnAmount >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {trade.returnAmount >= 0 ? '+' : ''}£{trade.returnAmount.toFixed(2)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trade.status === 'open'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {trade.status === 'open' && closingTradeId !== trade.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setClosingTradeId(trade.id)}
                          >
                            Close
                          </Button>
                        ) : closingTradeId === trade.id ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Exit price"
                              value={exitPrice}
                              onChange={(e) => setExitPrice(e.target.value)}
                              className="w-24"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleCloseTrade(trade.id)}
                              disabled={closeTradeM.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setClosingTradeId(null);
                                setExitPrice('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTradeM.mutate({ tradeId: trade.id })}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
