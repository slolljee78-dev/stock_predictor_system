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
import { Input } from "@/components/ui/input";
import { getQuickAddStockSelection } from "@/pages/dashboard.helpers";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

const quickSearches = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "AMZN"];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingStockId, setAddingStockId] = useState<number | null>(null);
  const addStockPanelRef = useRef<HTMLDivElement | null>(null);

  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  const signalsQuery = trpc.signals.getForUser.useQuery(undefined, {
    enabled: !!user,
  });

  const searchStocksQuery = trpc.stocks.search.useQuery(searchQuery, {
    enabled: searchQuery.trim().length > 0,
  });

  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.watchlist.list.invalidate(),
        utils.signals.getForUser.invalidate(),
      ]);
      setAddingStockId(null);
      setSearchQuery("");
      setIsAddStockOpen(false);
    },
    onError: (error) => {
      console.error('Failed to add stock:', error);
      setAddingStockId(null);
    },
  });

  const watchlist = watchlistQuery.data ?? [];
  const signals = signalsQuery.data ?? [];

  const buySignals = signals.filter((signal) => signal.type === "buy").length;
  const sellSignals = signals.filter((signal) => signal.type === "sell").length;

  const signalCoverage = useMemo(() => {
    if (!watchlist.length) return 0;
    const watchlistTickers = new Set(watchlist.map((item) => item.ticker));
    const covered = signals.filter((signal) => watchlistTickers.has(signal.ticker)).length;
    return Math.min(100, Math.round((covered / watchlist.length) * 100));
  }, [signals, watchlist]);

  useEffect(() => {
    if (!isAddStockOpen) return;

    const panel = addStockPanelRef.current;
    if (!panel) return;

    requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isAddStockOpen, searchQuery]);

  const handleOpenAddStock = () => {
    setSearchQuery("");
    setAddingStockId(null);
    setIsAddStockOpen(true);
  };

  const handleAddStock = async (stock: {
    id: number;
    ticker: string;
    name: string;
    exchange: string;
    type?: 'equity' | 'etf';
    currency?: string;
  }) => {
    setAddingStockId(stock.id);
    await addToWatchlistMutation.mutateAsync({
      stockId: stock.id > 0 ? stock.id : undefined,
      ticker: stock.ticker,
      name: stock.name,
      exchange: stock.exchange,
      type: stock.type,
      currency: stock.currency,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 lg:space-y-10">
        <section className="dashboard-frame relative overflow-hidden px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,151,255,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(88,212,255,0.10),transparent_22%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div className="space-y-5">
              <div className="eyebrow">
                <Sparkles className="h-4 w-4 text-primary" />
                AI trading workspace
              </div>
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                  Your signal desk for <span className="gradient-text">Trading 212 decision-making</span>
                </h1>
                <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                  Review your watchlist, prioritise the strongest buy and sell setups, and move from idea to detail without the clutter of a basic dashboard.
                </p>
              </div>
            </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
              <MetricCard
                label="Watchlist"
                value={String(watchlist.length)}
                note={watchlist.length ? "Active tracked names" : "Ready to start"}
                icon={<Star className="h-5 w-5 text-primary" />}
              />
              <MetricCard
                label="Buy ideas"
                value={String(buySignals)}
                note="High-conviction longs"
                icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
              />
              <MetricCard
                label="Sell signals"
                value={String(sellSignals)}
                note="Risk and weakness alerts"
                icon={<TrendingDown className="h-5 w-5 text-rose-400" />}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardHeader className="pb-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">Watchlist workspace</CardTitle>
                  <CardDescription className="max-w-2xl text-base text-muted-foreground">
                    Build a focused list of stocks you want to monitor. Add names, review the latest signal state, then tap through to the detailed stock page for the full picture.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleOpenAddStock}
                  className="pill-button pill-button-primary h-12 px-5"
                >
                  <Plus className="h-4 w-4" />
                  Add stock
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <GuideCard
                  title="Step 1"
                  text="Open Add stock and search by ticker or company name."
                  icon={<Search className="h-4 w-4 text-primary" />}
                />
                <GuideCard
                  title="Step 2"
                  text="Choose a stock from the results and add it to your watchlist."
                  icon={<Plus className="h-4 w-4 text-primary" />}
                />
                <GuideCard
                  title="Step 3"
                  text="Tap a watchlist row to inspect signals, context, and detail charts."
                  icon={<ArrowRight className="h-4 w-4 text-primary" />}
                />
              </div>

              {watchlist.length === 0 ? (
                <div className="premium-card border border-border/70 bg-background/35 p-6 sm:p-8 md:p-10">
                  <div className="grid gap-6 lg:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="space-y-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <BrainCircuit className="h-7 w-7" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">Start with a tighter watchlist</h3>
                        <p className="text-muted-foreground">
                          Search for a stock like AAPL, NVDA, or TSLA, add it to your watchlist, and this dashboard will begin to feel alive with signals and next steps.
                        </p>
                      </div>
                      <Button onClick={handleOpenAddStock} className="pill-button pill-button-primary h-12 px-5">
                        <Plus className="h-4 w-4" />
                        Add your first stock
                      </Button>
                    </div>

                    <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                      {quickSearches.slice(0, 4).map((ticker) => (
                        <button
                          key={ticker}
                          onClick={() => {
                            const nextSelection = getQuickAddStockSelection(ticker);
                            setIsAddStockOpen(nextSelection.isAddStockOpen);
                            setSearchQuery(nextSelection.searchQuery);
                          }}
                          className="feature-card text-left"
                        >
                          <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Popular search</p>
                          <p className="mt-3 text-2xl font-semibold tracking-tight">{ticker}</p>
                          <p className="mt-2 text-sm text-muted-foreground">Tap to search and add this stock to your list.</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {watchlist.map((item) => {
                    const relatedSignal = signals.find((signal) => signal.ticker === item.ticker);
                    return (
                      <button
                        key={item.id}
                        onClick={() => setLocation(`/stock/${item.ticker}`)}
                        className="premium-card flex flex-col gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/35 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="text-2xl font-semibold tracking-tight text-foreground">{item.ticker}</p>
                            <Badge variant="secondary" className="rounded-full px-3 py-1">{item.name}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Click to open the full stock view and inspect the latest trading context.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {relatedSignal ? (
                            <Badge
                              className={`rounded-full px-3 py-1 ${
                                relatedSignal.type === "buy"
                                  ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                                  : "border border-rose-400/30 bg-rose-400/15 text-rose-300"
                              }`}
                            >
                              {relatedSignal.type === "buy" ? "Buy signal active" : "Sell signal active"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="rounded-full px-3 py-1">Awaiting signal refresh</Badge>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold tracking-tight">Signal pulse</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  A quick read on what your account should look at next.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="metric-card">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="metric-label">Coverage</p>
                      <p className="metric-value">{signalCoverage}%</p>
                    </div>
                    <BellRing className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">How much of your watchlist currently has signal activity or recent ranking movement.</p>
                  <div className="progress-premium mt-4">
                    <span style={{ width: `${signalCoverage}%` }} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <SignalSummaryCard
                    title="Buy opportunities"
                    count={buySignals}
                    tone="positive"
                    description="Names worth reviewing for strength and continuation."
                  />
                  <SignalSummaryCard
                    title="Risk alerts"
                    count={sellSignals}
                    tone="negative"
                    description="Names showing weakness or deterioration."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold tracking-tight">Latest active signals</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Ranked ideas surfaced by the system for quick review.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {signals.length === 0 ? (
                  <div className="rounded-3xl border border-border/70 bg-background/35 p-6 text-center">
                    <Clock3 className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-4 font-medium text-foreground">No active signals yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add a few stocks to your watchlist first, then come back here to review ranked ideas.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {signals.slice(0, 6).map((signal) => (
                      <button
                        key={signal.signalId}
                        onClick={() => setLocation(`/stock/${signal.ticker}`)}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 px-4 py-4 text-left transition hover:border-primary/35 hover:bg-background/55"
                      >
                        <div>
                          <p className="text-lg font-semibold tracking-tight text-foreground">{signal.ticker}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(signal.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`rounded-full px-3 py-1 ${
                              signal.type === "buy"
                                ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                                : "border border-rose-400/30 bg-rose-400/15 text-rose-300"
                            }`}
                          >
                            {signal.type === "buy" ? "Buy" : "Sell"}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">{signal.confidenceScore}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {isAddStockOpen ? (
          <div ref={addStockPanelRef}>
            <Card className="premium-card border border-border/70 bg-background/95 p-0 backdrop-blur-2xl">
            <CardHeader className="border-b border-border/70 px-4 py-6 sm:px-6 sm:py-6 md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold tracking-tight">Add a stock to your watchlist</CardTitle>
                  <CardDescription className="max-w-2xl text-base text-muted-foreground">
                    Search by ticker or company name, then click <strong>Add to watchlist</strong>. Once added, the stock will appear in your workspace and begin feeding into your review flow.
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsAddStockOpen(false)}>
                  Close panel
                </Button>
              </div>
            </CardHeader>

            <CardContent className="grid gap-0 p-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-border/70 px-4 py-6 sm:px-6 sm:py-6 lg:border-b-0 lg:border-r lg:px-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">How to use this</p>
                <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
                    <p>Search for a stock like AAPL, MSFT, NVDA, or the company name you want to monitor.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
                    <p>Click <strong>Add to watchlist</strong> next to the stock you want to track.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span>
                    <p>Return to the dashboard and open the stock page whenever you want deeper analysis.</p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Popular tickers</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickSearches.map((ticker) => (
                      <Button
                        key={ticker}
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setSearchQuery(ticker)}
                      >
                        {ticker}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 sm:px-6 sm:py-6 md:px-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticker or company name"
                    className="h-14 rounded-2xl border-border/80 bg-background/55 pl-12 text-base"
                  />
                </div>

                <div className="mt-5 max-h-[26rem] overflow-y-auto pr-1">
                  {!searchQuery.trim() ? (
                    <div className="rounded-3xl border border-dashed border-border/80 bg-background/30 p-8 text-center">
                      <Search className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium text-foreground">Start with a search</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Type a ticker or tap one of the suggested names to see results you can add.
                      </p>
                    </div>
                  ) : searchStocksQuery.isLoading ? (
                    <div className="rounded-3xl border border-border/80 bg-background/30 p-8 text-center">
                      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                      <p className="mt-4 text-sm text-muted-foreground">Searching the stock universe…</p>
                    </div>
                  ) : searchStocksQuery.data && searchStocksQuery.data.length > 0 ? (
                    <div className="grid gap-3">
                      {searchStocksQuery.data.map((stock) => {
                        const alreadyAdded = watchlist.some((item) => item.stockId === stock.id || item.ticker === stock.ticker);
                        const isAdding = addingStockId === stock.id && addToWatchlistMutation.isPending;
                        return (
                          <div
                            key={stock.id}
                            className="rounded-3xl border border-border/70 bg-background/35 p-4 transition hover:border-primary/35"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-3">
                                  <p className="text-xl font-semibold tracking-tight text-foreground">{stock.ticker}</p>
                                  <Badge variant="secondary" className="rounded-full px-3 py-1">{stock.exchange}</Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{stock.name}</p>
                              </div>
                              <Button
                                type="button"
                                disabled={alreadyAdded || isAdding}
                                onClick={() => handleAddStock(stock)}
                                className={alreadyAdded ? "pill-button h-11 rounded-full px-5" : "pill-button pill-button-primary h-11 px-5"}
                                variant={alreadyAdded ? "secondary" : "default"}
                              >
                                {alreadyAdded ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Added already
                                  </>
                                ) : isAdding ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Adding…
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4" />
                                    Add to watchlist
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border/80 bg-background/30 p-8 text-center">
                      <Clock3 className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium text-foreground">No matches found</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Try a different ticker or company name, for example AAPL, Microsoft, NVDA, or Tesla.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="metric-label">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/45 border border-border/70">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function GuideCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/35 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 border border-primary/20">
          {icon}
        </div>
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function SignalSummaryCard({
  title,
  count,
  tone,
  description,
}: {
  title: string;
  count: number;
  tone: "positive" | "negative";
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/35 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <div className="mt-3 flex items-end gap-3">
        <p className="text-4xl font-semibold tracking-tight text-foreground">{count}</p>
        <p className={`metric-change ${tone}`}>{tone === "positive" ? "Healthy flow" : "Review risk"}</p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
