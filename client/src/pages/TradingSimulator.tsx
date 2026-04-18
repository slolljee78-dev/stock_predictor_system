import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  DollarSign,
  History,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RecentPagesMenu } from "@/components/RecentPagesMenu";
import { MobileMenuDrawer } from "@/components/MobileMenuDrawer";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { CheckCircle2, AlertCircle } from "lucide-react";

const getBackPath = () => '/dashboard';

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
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
}

export default function TradingSimulator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: 1,
      name: "Core Strategy",
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
      ticker: "AAPL",
      quantity: 10,
      entryPrice: 180.5,
      currentPrice: 185.2,
      unrealizedPnL: 47,
      unrealizedPnLPercent: 2.6,
    },
    {
      ticker: "NVDA",
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
      ticker: "AAPL",
      type: "buy",
      quantity: 10,
      price: 180.5,
      date: "2026-04-11 09:30",
    },
    {
      id: 2,
      ticker: "NVDA",
      type: "buy",
      quantity: 5,
      price: 890,
      date: "2026-04-11 10:15",
    },
  ]);

  const [tradeForm, setTradeForm] = useState({
    ticker: "",
    quantity: "",
    price: "",
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const exposure = useMemo(() => {
    return selectedPortfolio.currentValue - selectedPortfolio.cash;
  }, [selectedPortfolio]);

  // Live simulator integration
  const executeLiveTradeWithMarketPrice = trpc.simulator.executeLiveTradeWithMarketPrice.useMutation();
  const calculateLivePortfolioValue = trpc.simulator.calculateLivePortfolioValue.useQuery(
    {
      positions: positions.map(p => ({
        ticker: p.ticker,
        quantity: p.quantity,
        averagePrice: p.entryPrice,
      })),
      cashBalance: selectedPortfolio.cash,
    },
    {
      enabled: positions.length > 0,
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Update portfolio with live prices
  useEffect(() => {
    if (calculateLivePortfolioValue.data) {
      const liveData = calculateLivePortfolioValue.data;
      const updatedPositions = liveData.positions.map(livePos => {
        const existingPos = positions.find(p => p.ticker === livePos.ticker);
        return {
          ticker: livePos.ticker,
          quantity: livePos.quantity,
          entryPrice: livePos.averagePrice,
          currentPrice: livePos.currentPrice,
          unrealizedPnL: livePos.unrealizedPnL,
          unrealizedPnLPercent: livePos.unrealizedPnLPercent,
        };
      });
      setPositions(updatedPositions);

      setSelectedPortfolio(prev => ({
        ...prev,
        currentValue: liveData.totalValue,
        cash: liveData.cashBalance,
        totalReturn: liveData.totalPnL,
        totalReturnPercent: liveData.totalPnLPercent,
      }));
    }
  }, [calculateLivePortfolioValue.data]);

  const handleTrade = async (type: "buy" | "sell") => {
    if (!tradeForm.ticker || !tradeForm.quantity || !tradeForm.price) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // Execute trade with live market price
      const result = await executeLiveTradeWithMarketPrice.mutateAsync({
        ticker: tradeForm.ticker.toUpperCase(),
        type: type.toUpperCase() as "BUY" | "SELL",
        quantity: parseInt(tradeForm.quantity, 10),
        requestedPrice: parseFloat(tradeForm.price),
        slippagePercent: 0.05,
        commissionPercent: 0.1,
      });

      if (result.success) {
        const newTrade: Trade = {
          id: trades.length + 1,
          ticker: result.ticker,
          type,
          quantity: result.quantity,
          price: result.executedPrice,
          date: new Date().toLocaleString(),
        };

        setTrades((current) => [newTrade, ...current]);
        
        // Update positions based on trade
        setPositions((current) => {
          const existingPos = current.find(p => p.ticker === result.ticker);
          if (type === 'buy') {
            if (existingPos) {
              const totalCost = existingPos.entryPrice * existingPos.quantity + result.executedPrice * result.quantity;
              const totalQuantity = existingPos.quantity + result.quantity;
              const newAvgPrice = totalCost / totalQuantity;
              return current.map(p => 
                p.ticker === result.ticker 
                  ? {
                      ...p,
                      quantity: totalQuantity,
                      entryPrice: newAvgPrice,
                      currentPrice: result.executedPrice,
                      unrealizedPnL: (result.executedPrice - newAvgPrice) * totalQuantity,
                      unrealizedPnLPercent: ((result.executedPrice - newAvgPrice) / newAvgPrice) * 100,
                    }
                  : p
              );
            } else {
              return [...current, {
                ticker: result.ticker,
                quantity: result.quantity,
                entryPrice: result.executedPrice,
                currentPrice: result.executedPrice,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
              }];
            }
          } else {
            if (existingPos) {
              const remainingQty = existingPos.quantity - result.quantity;
              if (remainingQty <= 0) {
                return current.filter(p => p.ticker !== result.ticker);
              } else {
                return current.map(p => 
                  p.ticker === result.ticker 
                    ? {
                        ...p,
                        quantity: remainingQty,
                        unrealizedPnL: (result.executedPrice - p.entryPrice) * remainingQty,
                        unrealizedPnLPercent: ((result.executedPrice - p.entryPrice) / p.entryPrice) * 100,
                      }
                    : p
                );
              }
            }
            return current;
          }
        });
        
        const tradeValue = result.totalCost;
        setSelectedPortfolio(prev => {
          const newCash = type === 'buy' ? prev.cash - tradeValue : prev.cash + tradeValue;
          const newCurrentValue = prev.currentValue + (type === 'buy' ? -tradeValue : tradeValue);
          return {
            ...prev,
            cash: newCash,
            currentValue: newCurrentValue,
          };
        });
        
        setTradeForm({ ticker: "", quantity: "", price: "" });
        setFeedback({ type: 'success', message: `${type.toUpperCase()} order executed: ${result.quantity} ${result.ticker} @ $${result.executedPrice.toFixed(2)}` });
        setTimeout(() => setFeedback(null), 3000);

        // Refresh portfolio value
        await calculateLivePortfolioValue.refetch();
      } else {
        alert(`Trade failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Trade execution error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
    setPortfolios((current) => [...current, newPortfolio]);
    setSelectedPortfolio(newPortfolio);
  };

  const resetPortfolio = () => {
    if (window.confirm("Reset this simulator portfolio? This cannot be undone.")) {
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

  const [, setLocation] = useLocation();
  const [backPath, setBackPath] = useState('/');
  const [backLabel, setBackLabel] = useState('Back to menu');

  useEffect(() => {
    setBackPath(getBackPath());
    setBackLabel('Back to menu');
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 page-enter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation(backPath)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
            <RecentPagesMenu />
            <div className="hidden md:block">
              <MobileMenuDrawer />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserProfileMenu />
            <Button onClick={() => setLocation('/dashboard')} className="pill-button pill-button-primary">
              Open dashboard
            </Button>
          </div>
        </div>
        <Breadcrumb items={[{ label: "Trading Simulator", href: "/simulator" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Simulator</h1>
            <p className="text-muted-foreground mt-1">Practice trading with live market prices</p>
          </div>
          <Button onClick={createPortfolio} className="pill-button pill-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Portfolio
          </Button>
        </div>

        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">{selectedPortfolio.name}</CardTitle>
            <CardDescription>
              {portfolios.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {portfolios.map((portfolio) => (
                    <button
                      key={portfolio.id}
                      onClick={() => setSelectedPortfolio(portfolio)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        selectedPortfolio.id === portfolio.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {portfolio.name}
                    </button>
                  ))}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-4">
            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Portfolio Value</p>
                  <p className="metric-value">£{selectedPortfolio.currentValue.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Cash Balance</p>
                  <p className="metric-value">£{selectedPortfolio.cash.toLocaleString()}</p>
                </div>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Total Return</p>
                  <p className={`metric-value ${selectedPortfolio.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    £{selectedPortfolio.totalReturn.toLocaleString()}
                  </p>
                </div>
                {selectedPortfolio.totalReturn >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                )}
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Return %</p>
                  <p className={`metric-value ${selectedPortfolio.totalReturnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {selectedPortfolio.totalReturnPercent.toFixed(2)}%
                  </p>
                </div>
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="premium-card border-0 bg-transparent shadow-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Execute Trade</CardTitle>
              <CardDescription>Place a buy or sell order with live market prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Ticker</label>
                  <Input
                    placeholder="AAPL"
                    value={tradeForm.ticker}
                    onChange={(e) => setTradeForm({ ...tradeForm, ticker: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    placeholder="10"
                    type="number"
                    value={tradeForm.quantity}
                    onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    placeholder="150.00"
                    type="number"
                    step="0.01"
                    value={tradeForm.price}
                    onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleTrade("buy")}
                  disabled={executeLiveTradeWithMarketPrice.isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {executeLiveTradeWithMarketPrice.isPending ? "Processing..." : "Buy"}
                </Button>
                <Button
                  onClick={() => handleTrade("sell")}
                  disabled={executeLiveTradeWithMarketPrice.isPending}
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                >
                  {executeLiveTradeWithMarketPrice.isPending ? "Processing..." : "Sell"}
                </Button>
              </div>

              {calculateLivePortfolioValue.isLoading && (
                <p className="text-sm text-muted-foreground">Loading live prices...</p>
              )}
            </CardContent>
          </Card>

          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Positions</CardTitle>
              <CardDescription>{positions.length} open positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {positions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No positions yet. Place a trade to get started.</p>
              ) : (
                positions.map((position) => (
                  <div key={position.ticker} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-semibold">{position.ticker}</p>
                      <p className="text-sm text-muted-foreground">{position.quantity} shares</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${position.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        £{position.unrealizedPnL.toFixed(2)}
                      </p>
                      <p className={`text-sm ${position.unrealizedPnLPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {position.unrealizedPnLPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight">Trade History</CardTitle>
                <CardDescription>{trades.length} total trades</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetPortfolio}>
                Reset Portfolio
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history" className="w-full">
              <TabsList>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  All Trades
                </TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="space-y-3">
                {trades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trades yet.</p>
                ) : (
                  <div className="space-y-2">
                    {trades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                            {trade.type.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="font-semibold">{trade.ticker}</p>
                            <p className="text-sm text-muted-foreground">{trade.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{trade.quantity} @ £{trade.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">£{(trade.quantity * trade.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
