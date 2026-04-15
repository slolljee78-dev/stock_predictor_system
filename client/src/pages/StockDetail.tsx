import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Plus, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Fetch stock details
  const stockQuery = trpc.stocks.getByTicker.useQuery(ticker || "", {
    enabled: !!ticker,
  });

  // Fetch signals for this stock
  const signalsQuery = trpc.signals.getForStock.useQuery(stockQuery.data?.id || 0, {
    enabled: !!stockQuery.data?.id,
  });

  // Fetch watchlist
  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Add/remove from watchlist
  const addToWatchlistMutation = trpc.watchlist.add.useMutation();
  const removeFromWatchlistMutation = trpc.watchlist.remove.useMutation();

  const stock = stockQuery.data;
  const signals = signalsQuery.data || [];
  const watchlist = watchlistQuery.data || [];

  useEffect(() => {
    if (stock && watchlist) {
      const inWatchlist = watchlist.some(item => item.stockId === stock.id);
      setIsInWatchlist(inWatchlist);
    }
  }, [stock, watchlist]);

  const handleToggleWatchlist = async () => {
    if (!stock) return;

    if (isInWatchlist) {
      const watchlistItem = watchlist.find(item => item.stockId === stock.id);
      if (watchlistItem) {
        await removeFromWatchlistMutation.mutateAsync({ watchlistId: watchlistItem.id });
        setIsInWatchlist(false);
      }
    } else {
      await addToWatchlistMutation.mutateAsync({ stockId: stock.id, label: stock.ticker });
      setIsInWatchlist(true);
    }
  };

  // Mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: 100 + Math.random() * 20 - 10,
    volume: Math.floor(Math.random() * 10000000),
  }));

  if (!stock) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Stock not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{stock.ticker}</h1>
            <p className="text-lg text-muted-foreground mt-1">{stock.name}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">{stock.type}</Badge>
              <Badge variant="outline">{stock.exchange}</Badge>
              {stock.sector && <Badge variant="outline">{stock.sector}</Badge>}
            </div>
          </div>
          <Button
            onClick={handleToggleWatchlist}
            variant={isInWatchlist ? "default" : "outline"}
            className="gap-2"
          >
            {isInWatchlist ? (
              <>
                <X className="h-4 w-4" />
                Remove from Watchlist
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to Watchlist
              </>
            )}
          </Button>
        </div>

        {/* Charts and Analysis */}
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Price Chart</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>30-Day Price History</CardTitle>
                <CardDescription>Historical price movement with volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Signals History</CardTitle>
                <CardDescription>All generated buy/sell signals with confidence scores</CardDescription>
              </CardHeader>
              <CardContent>
                {signals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No signals generated yet for this stock
                  </p>
                ) : (
                  <div className="space-y-3">
                    {signals.map(signal => (
                      <div
                        key={signal.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'}>
                              {signal.type.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(signal.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{signal.confidenceScore}% confidence</p>
                          <p className="text-sm text-muted-foreground">
                            ${(signal.priceAtSignal / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Current technical analysis metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">RSI (14)</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">MACD</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">SMA 20</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SMA 50</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
