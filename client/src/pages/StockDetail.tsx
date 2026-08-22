import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  LineChart as LineChartIcon,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const stockQuery = trpc.stocks.getByTicker.useQuery(ticker || "", {
    enabled: !!ticker,
  });

  const signalsQuery = trpc.signals.getForStock.useQuery(stockQuery.data?.id || 0, {
    enabled: !!stockQuery.data?.id,
  });

  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: async () => {
      await utils.watchlist.list.invalidate();
    },
  });

  const removeFromWatchlistMutation = trpc.watchlist.remove.useMutation({
    onSuccess: async () => {
      await utils.watchlist.list.invalidate();
    },
  });

  const stock = stockQuery.data;
  const signals = signalsQuery.data ?? [];
  const watchlist = watchlistQuery.data ?? [];

  useEffect(() => {
    if (stock && watchlist) {
      setIsInWatchlist(watchlist.some((item) => item.stockId === stock.id));
    }
  }, [stock, watchlist]);

  const handleToggleWatchlist = async () => {
    if (!stock) return;

    if (isInWatchlist) {
      const watchlistItem = watchlist.find((item) => item.stockId === stock.id);
      if (watchlistItem) {
        await removeFromWatchlistMutation.mutateAsync({ watchlistId: watchlistItem.id });
        setIsInWatchlist(false);
      }
      return;
    }

    await addToWatchlistMutation.mutateAsync({ stockId: stock.id, label: stock.ticker });
    setIsInWatchlist(true);
  };

  const chartData = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        date: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        price: 100 + Math.sin(index / 4) * 7 + index * 0.6,
        volume: Math.floor(3500000 + Math.random() * 5000000),
      })),
    []
  );

  const latestSignal = signals[0];
  const positiveSignals = signals.filter((signal: any) => signal.type === "buy").length;
  const negativeSignals = signals.filter((signal: any) => signal.type === "sell").length;

  if (stockQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-border/70 bg-background/40 p-10 text-center text-muted-foreground">
          Loading stock workspace…
        </div>
      </DashboardLayout>
    );
  }

  if (!stock) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="rounded-full px-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
          <div className="rounded-3xl border border-dashed border-border/80 bg-background/30 p-12 text-center">
            <p className="text-xl font-semibold text-foreground">Stock not found</p>
            <p className="mt-3 text-muted-foreground">The requested ticker could not be loaded. Return to the dashboard and search again.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 lg:space-y-10">
        <section className="dashboard-frame px-6 py-0 md:px-8 md:py-2">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4 pt-2">
              <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="-ml-2 rounded-full px-4 text-muted-foreground hover:text-foreground relative z-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Button>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{stock.ticker}</h1>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">{stock.exchange}</Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">{stock.type}</Badge>
                  {stock.sector && <Badge variant="secondary" className="rounded-full px-3 py-1">{stock.sector}</Badge>}
                </div>
                <p className="max-w-3xl text-lg text-muted-foreground">{stock.name}</p>
                <p className="max-w-3xl text-base text-muted-foreground">
                  Review recent price behaviour, signal history, and technical context from a single premium stock workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleToggleWatchlist}
                className={isInWatchlist ? "pill-button pill-button-secondary h-12 px-5" : "pill-button pill-button-primary h-12 px-5"}
              >
                {isInWatchlist ? (
                  <>
                    <X className="h-4 w-4" />
                    Remove from watchlist
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to watchlist
                  </>
                )}
              </Button>
              <Button variant="outline" className="pill-button pill-button-secondary h-12 px-5" onClick={() => setLocation("/simulator") }>
                <ArrowUpRight className="h-4 w-4" />
                Send to simulator
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Latest price snapshot" value={`£${chartData[chartData.length - 1].price.toFixed(2)}`} helper="Synthetic preview data for the current experience" />
          <StatCard label="Buy signals" value={String(positiveSignals)} helper="Positive setups recorded" />
          <StatCard label="Sell signals" value={String(negativeSignals)} helper="Risk or weakness events" />
          <StatCard label="Latest confidence" value={latestSignal ? `${latestSignal.confidenceScore}%` : "--"} helper="Most recent signal strength" />
        </section>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="rounded-full bg-card/70 p-1">
            <TabsTrigger value="overview" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
            <TabsTrigger value="signals" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Signals</TabsTrigger>
            <TabsTrigger value="indicators" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Indicators</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="premium-card border-0 bg-transparent shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/40 text-primary">
                      <LineChartIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-semibold tracking-tight">30-day price view</CardTitle>
                      <CardDescription className="text-base text-muted-foreground">A clean visual of the recent price path.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-3xl border border-border/70 bg-background/30 p-4">
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="rgba(148,163,184,0.7)" />
                        <YAxis stroke="rgba(148,163,184,0.7)" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="price" stroke="#58d4ff" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-0 bg-transparent shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/40 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-semibold tracking-tight">Signal snapshot</CardTitle>
                      <CardDescription className="text-base text-muted-foreground">The latest read on this name.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-border/70 bg-background/35 p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Current stance</p>
                    {latestSignal ? (
                      <>
                        <div className="mt-3 flex items-center gap-3">
                          <Badge className={latestSignal.type === "buy" ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/25" : "bg-rose-400/15 text-rose-300 border border-rose-400/25"}>
                            {latestSignal.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{new Date(latestSignal.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-4 text-4xl font-semibold tracking-tight">{latestSignal.confidenceScore}%</p>
                        <p className="mt-2 text-sm text-muted-foreground">Confidence score for the most recent signal event.</p>
                      </>
                    ) : (
                      <p className="mt-4 text-muted-foreground">No signals have been recorded for this stock yet.</p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-border/70 bg-background/35 p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Use this page well</p>
                    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <li>Start with the latest signal and confidence score.</li>
                      <li>Review the recent price and volume trend for context.</li>
                      <li>Send the idea to the simulator if you want to test sizing first.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/40 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-semibold tracking-tight">Volume trend</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">Supporting context for conviction and participation.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl border border-border/70 bg-background/30 p-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="rgba(148,163,184,0.7)" />
                      <YAxis stroke="rgba(148,163,184,0.7)" />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#3f8cff" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals">
            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-semibold tracking-tight">Signal history</CardTitle>
                <CardDescription className="text-base text-muted-foreground">Every recorded buy and sell event for this stock.</CardDescription>
              </CardHeader>
              <CardContent>
                {signals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/80 bg-background/30 p-10 text-center">
                    <p className="text-lg font-medium text-foreground">No signals generated yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">Signals will appear here as the analysis engine records new events.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {signals.map((signal: any) => (
                      <div key={signal.signalId || signal.id} className="rounded-3xl border border-border/70 bg-background/35 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <Badge className={signal.type === "buy" ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/25" : "bg-rose-400/15 text-rose-300 border border-rose-400/25"}>
                                {signal.type.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{new Date(signal.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">Recorded price at signal: £{(signal.priceAtSignal / 100).toFixed(2)}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-2xl font-semibold tracking-tight">{signal.confidenceScore}%</p>
                            <p className="text-sm text-muted-foreground">Confidence score</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="indicators">
            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-semibold tracking-tight">Technical indicator board</CardTitle>
                <CardDescription className="text-base text-muted-foreground">A clean placeholder board for the next layer of technical enrichment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["RSI (14)", "--", "Momentum read"],
                    ["MACD", "--", "Trend confirmation"],
                    ["SMA 20", "--", "Short-term trend"],
                    ["SMA 50", "--", "Medium-term trend"],
                  ].map(([label, value, helper]) => (
                    <div key={label} className="rounded-3xl border border-border/70 bg-background/35 p-5">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-3">{value}</p>
      <p className="mt-3 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}
