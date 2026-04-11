import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Target, History, BarChart3 } from 'lucide-react';

interface Portfolio {
  id: number;
  name: string;
  initialCapital: number;
  currentValue: number;
  cash: number;
  totalReturn: number;
  totalReturnPercent: number;
}

interface Position {
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

interface Trade {
  id: number;
  ticker: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
  realizedPnL?: number;
}

export default function TradingSimulator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: 1,
      name: 'My First Portfolio',
      initialCapital: 10000,
      currentValue: 11247,
      cash: 5000,
      totalReturn: 1247,
      totalReturnPercent: 12.47,
    },
  ]);

  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(portfolios[0]);
  const [positions, setPositions] = useState<Position[]>([
    {
      ticker: 'AAPL',
      quantity: 10,
      entryPrice: 180.5,
      currentPrice: 185.2,
      unrealizedPnL: 47,
      unrealizedPnLPercent: 2.6,
    },
    {
      ticker: 'NVDA',
      quantity: 5,
      entryPrice: 890,
      currentPrice: 892.5,
      unrealizedPnL: 12.5,
      unrealizedPnLPercent: 0.28,
    },
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: 1,
      ticker: 'AAPL',
      type: 'buy',
      quantity: 10,
      price: 180.5,
      date: '2026-04-11 09:30',
    },
    {
      id: 2,
      ticker: 'NVDA',
      type: 'buy',
      quantity: 5,
      price: 890,
      date: '2026-04-11 10:15',
    },
  ]);

  const [tradeForm, setTradeForm] = useState({
    ticker: '',
    quantity: '',
    price: '',
    type: 'buy' as 'buy' | 'sell',
  });

  const handleTrade = (type: 'buy' | 'sell') => {
    if (!tradeForm.ticker || !tradeForm.quantity || !tradeForm.price) {
      alert('Please fill in all fields');
      return;
    }

    const newTrade: Trade = {
      id: trades.length + 1,
      ticker: tradeForm.ticker.toUpperCase(),
      type,
      quantity: parseInt(tradeForm.quantity),
      price: parseFloat(tradeForm.price),
      date: new Date().toLocaleString(),
    };

    setTrades([...trades, newTrade]);
    setTradeForm({ ticker: '', quantity: '', price: '', type: 'buy' });
  };

  const createPortfolio = () => {
    const newPortfolio: Portfolio = {
      id: portfolios.length + 1,
      name: `Portfolio ${portfolios.length + 1}`,
      initialCapital: 10000,
      currentValue: 10000,
      cash: 10000,
      totalReturn: 0,
      totalReturnPercent: 0,
    };
    setPortfolios([...portfolios, newPortfolio]);
    setSelectedPortfolio(newPortfolio);
  };

  const resetPortfolio = () => {
    if (confirm('Reset this portfolio? This cannot be undone.')) {
      setPositions([]);
      setTrades([]);
      setSelectedPortfolio({
        ...selectedPortfolio,
        currentValue: selectedPortfolio.initialCapital,
        cash: selectedPortfolio.initialCapital,
        totalReturn: 0,
        totalReturnPercent: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Simulator</h1>
          <p className="text-muted-foreground mt-2">
            Practice trading with virtual money, risk-free
          </p>
        </div>
        <Button onClick={createPortfolio} className="gap-2">
          <DollarSign className="h-4 w-4" />
          New Portfolio
        </Button>
      </div>

      {/* Portfolio Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {portfolios.map((portfolio) => (
              <Button
                key={portfolio.id}
                variant={selectedPortfolio.id === portfolio.id ? 'default' : 'outline'}
                onClick={() => setSelectedPortfolio(portfolio)}
                className="whitespace-nowrap"
              >
                {portfolio.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{selectedPortfolio.currentValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Initial: £{selectedPortfolio.initialCapital.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                selectedPortfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {selectedPortfolio.totalReturn >= 0 ? '+' : ''}
              £{selectedPortfolio.totalReturn.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedPortfolio.totalReturnPercent >= 0 ? '+' : ''}
              {selectedPortfolio.totalReturnPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{selectedPortfolio.cash.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((selectedPortfolio.cash / selectedPortfolio.currentValue) * 100).toFixed(1)}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Open positions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trade" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trade" className="gap-2">
            <Target className="h-4 w-4" />
            Execute Trade
          </TabsTrigger>
          <TabsTrigger value="positions" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Trade History
          </TabsTrigger>
        </TabsList>

        {/* Execute Trade Tab */}
        <TabsContent value="trade">
          <Card>
            <CardHeader>
              <CardTitle>Execute Trade</CardTitle>
              <CardDescription>
                Buy or sell stocks using virtual money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stock Ticker</label>
                  <Input
                    placeholder="e.g., AAPL"
                    value={tradeForm.ticker}
                    onChange={(e) =>
                      setTradeForm({ ...tradeForm, ticker: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={tradeForm.quantity}
                    onChange={(e) =>
                      setTradeForm({ ...tradeForm, quantity: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price per Share</label>
                  <Input
                    type="number"
                    placeholder="180.50"
                    value={tradeForm.price}
                    onChange={(e) =>
                      setTradeForm({ ...tradeForm, price: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleTrade('buy')}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="h-4 w-4" />
                  Buy
                </Button>
                <Button
                  onClick={() => handleTrade('sell')}
                  variant="outline"
                  className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <TrendingDown className="h-4 w-4" />
                  Sell
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <CardDescription>
                {positions.length} active position{positions.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No open positions. Start trading!
                </p>
              ) : (
                <div className="space-y-3">
                  {positions.map((position) => (
                    <div
                      key={position.ticker}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{position.ticker}</div>
                        <div className="text-sm text-muted-foreground">
                          {position.quantity} shares @ £{position.entryPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          £{position.currentPrice.toFixed(2)}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            position.unrealizedPnL >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {position.unrealizedPnL >= 0 ? '+' : ''}
                          £{position.unrealizedPnL.toFixed(2)} (
                          {position.unrealizedPnLPercent >= 0 ? '+' : ''}
                          {position.unrealizedPnLPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trade History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                {trades.length} trade{trades.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No trades yet. Execute your first trade!
                </p>
              ) : (
                <div className="space-y-2">
                  {trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge
                          variant={trade.type === 'buy' ? 'default' : 'destructive'}
                        >
                          {trade.type.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {trade.quantity} × {trade.ticker}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {trade.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          £{(trade.quantity * trade.price).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @ £{trade.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Portfolio Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={resetPortfolio}>
          Reset Portfolio
        </Button>
      </div>
    </div>
  );
}
