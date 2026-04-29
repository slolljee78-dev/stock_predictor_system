import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminViewModeToggle } from "@/components/AdminViewModeToggle";
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
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { getPublicPrimaryAction } from "@/lib/publicSite";
import {
  buildSignalDashboardPath,
  buildStockDetailPath,
  scrollToDashboardSection,
} from "@/lib/dashboardNavigation";
import {
  getDailyStockSignalSummary,
  getLatestSignalsByTicker,
} from "@/lib/dashboardSignalSummary";
import {
  getActionableWatchlistCounts,
  getLiveSignalCoverage,
  getResolvedWatchlistPresentation,
} from "@/lib/dashboardWatchlistSignals";
import {
  DASHBOARD_AUTO_REFRESH_INTERVAL_MS,
  formatLastUpdated,
  getLatestRefreshTimestamp,
  shouldEnableAutoRefresh,
} from "@/lib/dashboardRefreshMeta";
import {
  consumeDashboardSectionReturn,
  rememberDashboardSection,
} from "@/lib/navigation";
import {
  isWatchlistRefreshing,
} from "@/lib/watchlistRefresh";
import {
  canViewPremiumSignalDetails,
  getSignalUpgradeMessage,
} from "@/lib/subscriptionAccess";
import { useAdminViewMode } from "@/lib/adminViewMode";
import {
  getBlurredPreviewText,
  getPreviewUsage,
  LOCKED_FEATURE_PLAN_ROWS,
} from "@/lib/upgradeConversion";
import {
  canRefresh,
  getRefreshButtonLabel,
  getRefreshState,
  isRefreshButtonDisabled,
} from "@/lib/refreshRateLimiter";
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
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

const quickSearches = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "AMZN"];

export default function Dashboard() {
  const { user } = useAuth();
  const {
    effectiveUser,
    showAdminViewModeToggle,
    viewMode,
    setViewMode,
    description: adminViewModeDescription,
  } = useAdminViewMode(user);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const dashboardGateAction = getPublicPrimaryAction("visitor", "dashboard_gate");

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingStockId, setAddingStockId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [refreshLabelNow, setRefreshLabelNow] = useState(() => Date.now());
  const addStockPanelRef = useRef<HTMLDivElement | null>(null);

  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  const signalsQuery = trpc.signals.getForUser.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: shouldEnableAutoRefresh(!!user, watchlistQuery.data?.length ?? 0)
      ? DASHBOARD_AUTO_REFRESH_INTERVAL_MS
      : false,
    refetchIntervalInBackground: false,
  });

  const watchlistStatusesQuery = trpc.signals.statuses.useQuery(undefined, {
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: shouldEnableAutoRefresh(!!user, watchlistQuery.data?.length ?? 0)
      ? DASHBOARD_AUTO_REFRESH_INTERVAL_MS
      : false,
    refetchIntervalInBackground: false,
  });

  const searchStocksQuery = trpc.stocks.search.useQuery(searchQuery, {
    enabled: searchQuery.trim().length > 0,
  });

  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.watchlist.list.invalidate(),
        utils.signals.statuses.invalidate(),
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
  const watchlistStatuses = watchlistStatusesQuery.data ?? [];
  const hasPremiumSignalAccess = canViewPremiumSignalDetails(effectiveUser);
  const signalUpgradeMessage = getSignalUpgradeMessage(effectiveUser);
  const premiumPreviewUsage = getPreviewUsage(watchlist.length, 3);
  const isRefreshingWatchlist = isWatchlistRefreshing([
    watchlistQuery.isFetching,
    watchlistStatusesQuery.isFetching,
    signalsQuery.isFetching,
  ]);
  const refreshState = getRefreshState(lastRefreshTime);
  const canRefreshNow = canRefresh(lastRefreshTime);
  const isRefreshDisabled = isRefreshButtonDisabled(isRefreshingWatchlist, refreshState.isOnCooldown);
  const refreshButtonLabel = getRefreshButtonLabel(
    isRefreshingWatchlist,
    refreshState.isOnCooldown,
    refreshState.cooldownRemaining
  );
  const watchlistStatusMap = useMemo(
    () => Object.fromEntries(watchlistStatuses.map((status: (typeof watchlistStatuses)[number]) => [status.ticker, status])),
    [watchlistStatuses],
  );
  const latestLiveUpdate = useMemo(
    () => getLatestRefreshTimestamp([
      watchlistQuery.dataUpdatedAt,
      watchlistStatusesQuery.dataUpdatedAt,
      signalsQuery.dataUpdatedAt,
    ]),
    [watchlistQuery.dataUpdatedAt, watchlistStatusesQuery.dataUpdatedAt, signalsQuery.dataUpdatedAt],
  );
  const lastUpdatedLabel = useMemo(
    () => formatLastUpdated(latestLiveUpdate, refreshLabelNow),
    [latestLiveUpdate, refreshLabelNow],
  );
  const dailyTrendData = useMemo(() => getDailyStockSignalSummary(signals, 7), [signals]);
  const latestSignalsByTicker = useMemo(() => getLatestSignalsByTicker(signals), [signals]);
  const { buyCount: buySignals, sellCount: sellSignals } = useMemo(
    () => getActionableWatchlistCounts(watchlistStatuses),
    [watchlistStatuses],
  );

  // Safely extract trend data
  const buyTrend = 'up' as const;
  const buyTrendPercent = 0;
  const sellTrend = 'down' as const;
  const sellTrendPercent = 0;

  const signalCoverage = useMemo(
    () => getLiveSignalCoverage(watchlistStatuses, watchlist.length),
    [watchlistStatuses, watchlist.length],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const requestedSection = consumeDashboardSectionReturn();
    if (!requestedSection) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (scrollToDashboardSection(requestedSection)) {
        rememberDashboardSection(requestedSection);
        setActiveSection(requestedSection);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!user || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    if (!sections.length || typeof IntersectionObserver === "undefined") {
      rememberDashboardSection("overview");
      setActiveSection("overview");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const activeSection = visibleEntries[0]?.target.getAttribute("data-section");
        if (activeSection) {
          rememberDashboardSection(activeSection);
          setActiveSection(activeSection);
        }
      },
      {
        threshold: [0.25, 0.45, 0.7],
        rootMargin: "-18% 0px -45% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
    const initialSection = sections[0]?.getAttribute("data-section") || "overview";
    rememberDashboardSection(initialSection);
    setActiveSection(initialSection);

    return () => observer.disconnect();
  }, [user, watchlist.length, signals.length, dailyTrendData.length]);

  // Only scroll when user explicitly opens the add stock panel
  useEffect(() => {
    if (!isAddStockOpen) return;
    
    const panel = addStockPanelRef.current;
    if (!panel) return;

    // Delay scroll to ensure DOM is ready
    const timer = setTimeout(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAddStockOpen]);

  // Update cooldown countdown every second
  useEffect(() => {
    if (!refreshState.isOnCooldown) {
      setCooldownRemaining(0);
      return;
    }

    setCooldownRemaining(refreshState.cooldownRemaining);

    const interval = setInterval(() => {
      const newState = getRefreshState(lastRefreshTime);
      setCooldownRemaining(newState.cooldownRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshState.isOnCooldown, lastRefreshTime]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshLabelNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleOpenAddStock = () => {
    setSearchQuery("");
    setAddingStockId(null);
    setIsAddStockOpen(true);
  };

  const handleRefreshWatchlist = async () => {
    if (!canRefreshNow) {
      return;
    }

    setLastRefreshTime(Date.now());

    await Promise.all([
      watchlistQuery.refetch(),
      watchlistStatusesQuery.refetch(),
      signalsQuery.refetch(),
    ]);
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

  if (!user) {
    return (
      <div className="app-shell min-h-screen overflow-x-hidden pb-20 page-enter">
        <div className="hero-orb left-[-8rem] top-[-3rem] h-72 w-72 bg-primary/35" />
        <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/25" />
        <div className="container relative flex min-h-screen items-center py-12">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <div className="eyebrow">
                <Sparkles className="h-4 w-4 text-primary" />
                Members-only dashboard
              </div>
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                  Sign in to open your <span className="gradient-text">Trading 212 signal workspace</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  The dashboard is where you review your watchlist, check active buy and sell ideas, open the simulator, and manage alerts. To protect personalised data, this workspace only opens after sign-in.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="pill-button pill-button-primary h-12 px-6">
                  <a href={getLoginUrl()}>
                    {dashboardGateAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  onClick={() => setLocation("/pricing")}
                  className="pill-button pill-button-secondary h-12 px-6"
                >
                  View plans
                </Button>
              </div>
            </div>

            <div className="premium-card p-6 md:p-7">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What unlocks after sign-in</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Watchlist workspace",
                    body: "Track your chosen names and move through ideas without losing context.",
                  },
                  {
                    title: "Signal review",
                    body: "Prioritise buy and sell setups with clearer confidence-led review.",
                  },
                  {
                    title: "Simulator and validation",
                    body: "Pressure-test ideas before using real capital and review what is working.",
                  },
                  {
                    title: "Alerts and preferences",
                    body: "Control which setups matter to you and how you want to be notified.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-3xl border border-border/70 bg-background/35 p-5">
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 lg:space-y-10">
        <section data-section="overview" className="dashboard-frame relative overflow-hidden px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,151,255,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(88,212,255,0.10),transparent_22%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div className="space-y-3">
              <div className="eyebrow">
                <Sparkles className="h-4 w-4 text-primary" />
                AI trading workspace
              </div>
              <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
                  Your signal desk for <span className="gradient-text">Trading 212 decision-making</span>
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                  Review your watchlist, prioritise the strongest buy and sell setups, and move from idea to detail without the clutter of a basic dashboard.
                </p>
                {showAdminViewModeToggle ? (
                  <div className="max-w-3xl pt-2">
                    <AdminViewModeToggle
                      viewMode={viewMode}
                      description={adminViewModeDescription}
                      onChange={setViewMode}
                    />
                  </div>
                ) : null}
              </div>
            </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
              <MetricCard
                label="Watchlist"
                value={String(watchlist.length)}
                note={watchlist.length ? "Active tracked names" : "Ready to start"}
                icon={<Star className="h-5 w-5 text-primary" />}
                onClick={() => scrollToDashboardSection("watchlist")}
              />
              <MetricCard
                label="Buy ideas"
                value={hasPremiumSignalAccess ? String(buySignals) : "Preview"}
                note={hasPremiumSignalAccess ? "Stocks with current buy setups" : "Upgrade to unlock full buy signal counts"}
                icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
                trend={hasPremiumSignalAccess ? buyTrend : undefined}
                trendPercent={hasPremiumSignalAccess ? buyTrendPercent : undefined}
                onClick={() => setLocation(hasPremiumSignalAccess ? buildSignalDashboardPath("buy") : "/pricing")}
              />
              <MetricCard
                label="Sell signals"
                value={hasPremiumSignalAccess ? String(sellSignals) : "Preview"}
                note={hasPremiumSignalAccess ? "Stocks with current sell setups" : "Upgrade to unlock full sell signal counts"}
                icon={<TrendingDown className="h-5 w-5 text-rose-400" />}
                trend={hasPremiumSignalAccess ? sellTrend : undefined}
                trendPercent={hasPremiumSignalAccess ? sellTrendPercent : undefined}
                onClick={() => setLocation(hasPremiumSignalAccess ? buildSignalDashboardPath("sell") : "/pricing")}
              />
            </div>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2">
            {[
              { label: "Overview", section: "overview" },
              { label: "Trend", section: "trend" },
              { label: "Watchlist", section: "watchlist" },
              { label: "Next steps", section: "next-steps" },
            ].map((item) => {
              const isActive = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => {
                    rememberDashboardSection(item.section);
                    setActiveSection(item.section);
                    scrollToDashboardSection(item.section);
                  }}
                  className={isActive
                    ? "rounded-full border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold tracking-[0.08em] text-primary shadow-[0_0_0_1px_rgba(59,130,246,0.08)] transition"
                    : "rounded-full border border-border/70 bg-background/45 px-3 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-foreground"}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {dailyTrendData && dailyTrendData.length > 0 && (
          <section data-section="trend" className="dashboard-frame relative overflow-hidden px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Signal Trend</CardTitle>
                <CardDescription>7-day stock activity across your watchlist</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3">
                  {dailyTrendData.map((day) => {
                    const total = day.buyCount + day.sellCount;
                    const buyWidth = total > 0 ? `${(day.buyCount / total) * 100}%` : "0%";
                    const sellWidth = total > 0 ? `${(day.sellCount / total) * 100}%` : "0%";

                    return (
                      <div key={day.date} className="rounded-2xl border border-border/60 bg-background/35 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-medium text-muted-foreground">{day.date}</p>
                          <div className="flex items-center gap-2 text-[11px] font-medium">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">
                              <TrendingUp className="h-3 w-3" />
                              {day.buyCount}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-rose-300">
                              <TrendingDown className="h-3 w-3" />
                              {day.sellCount}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted/30">
                          <div className="bg-emerald-400/85 transition-all" style={{ width: buyWidth }} />
                          <div className="bg-rose-400/85 transition-all" style={{ width: sellWidth }} />
                          {total === 0 && <div className="w-full bg-muted/20" />}
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {total === 0
                            ? "No actionable stock signals recorded"
                            : `${total} watchlist stock${total === 1 ? "" : "s"} triggered signals`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section data-section="watchlist" className="dashboard-frame relative overflow-hidden px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight">Your Watchlist</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshWatchlist}
                    disabled={isRefreshDisabled}
                    className="h-8 rounded-full border-border/70 bg-background/40 px-3 text-xs text-muted-foreground hover:bg-background/70 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    title={refreshState.isOnCooldown ? `Refresh available in ${refreshState.cooldownRemaining}s` : "Refresh watchlist data"}
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshingWatchlist ? "animate-spin" : ""}`} />
                    {refreshButtonLabel}
                  </Button>
                </div>
                <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <p className="text-sm text-muted-foreground">
                    {watchlist.length === 0
                      ? "Start by adding stocks you want to track"
                      : hasPremiumSignalAccess
                        ? `${signalCoverage}% of your watchlist has active signals`
                        : "Free plan preview mode: upgrade to unlock full live buy and sell signal coverage."}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground/90">
                    <Clock3 className="h-3.5 w-3.5" />
                    {lastUpdatedLabel}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenAddStock}
                size="sm"
                className="gap-2 pill-button pill-button-primary self-start"
              >
                <Plus className="h-4 w-4" />
                Add stock
              </Button>
            </div>

            {isAddStockOpen && (
              <div ref={addStockPanelRef} className="rounded-2xl border border-border/70 bg-background/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Search and add stocks</p>
                  <button
                    onClick={() => setIsAddStockOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticker or name (e.g., AAPL, Apple)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchQuery.trim().length > 0 && searchStocksQuery.isLoading && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}

                {searchQuery.trim().length > 0 && !searchStocksQuery.isLoading && searchStocksQuery.data && searchStocksQuery.data.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchStocksQuery.data.map((stock) => {
                      const isInWatchlist = watchlist.some(
                        (w) => w.stockId === stock.id || w.ticker === stock.ticker
                      );
                      return (
                        <button
                          key={stock.id}
                          onClick={() => handleAddStock(stock)}
                          disabled={isInWatchlist || addingStockId === stock.id}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{stock.ticker}</p>
                              <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                            </div>
                            {isInWatchlist && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 ml-2" />
                            )}
                            {addingStockId === stock.id && (
                              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {searchQuery.trim().length > 0 && !searchStocksQuery.isLoading && (!searchStocksQuery.data || searchStocksQuery.data.length === 0) && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No stocks found. Try a different search.
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick add</p>
                  <div className="grid grid-cols-3 gap-2">
                    {quickSearches.map((ticker) => {
                      const stock = searchStocksQuery.data?.find((s) => s.ticker === ticker);
                      const isInWatchlist = watchlist.some((w) => w.ticker === ticker);
                      return (
                        <button
                          key={ticker}
                          onClick={() => {
                            if (stock) {
                              handleAddStock(stock);
                            }
                          }}
                          disabled={isInWatchlist}
                          className="px-3 py-2 rounded-lg text-xs font-medium border border-border/70 hover:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {ticker}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!hasPremiumSignalAccess && watchlist.length > 0 && (
              <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Premium signal detail is locked on the free plan</p>
                    <p className="mt-1 text-sm text-muted-foreground">{signalUpgradeMessage}</p>
                  </div>
                  <Button type="button" onClick={() => setLocation("/pricing")} className="pill-button pill-button-primary h-10 px-5">
                    View plans
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Free preview usage</span>
                    <span>{premiumPreviewUsage.label}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/60">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${premiumPreviewUsage.percent}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {premiumPreviewUsage.remainingLocked > 0
                      ? `${premiumPreviewUsage.remainingLocked} additional watchlist ${premiumPreviewUsage.remainingLocked === 1 ? "signal remains" : "signals remain"} locked until upgrade.`
                      : "Your current watchlist fits within the preview, but deeper live signal detail remains paid."}
                  </p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/40">
                  <div className="grid grid-cols-3 gap-px bg-border/60 text-sm">
                    <div className="bg-background/95 px-3 py-2 font-semibold text-foreground">Feature</div>
                    <div className="bg-background/95 px-3 py-2 font-semibold text-foreground">Free</div>
                    <div className="bg-background/95 px-3 py-2 font-semibold text-foreground">Paid</div>
                  </div>
                  {LOCKED_FEATURE_PLAN_ROWS.map((row) => (
                    <div key={row.label} className="grid grid-cols-3 gap-px border-t border-border/60 bg-border/60 text-sm">
                      <div className="bg-background/95 px-3 py-2 text-foreground">{row.label}</div>
                      <div className="bg-background/95 px-3 py-2 text-muted-foreground">{row.free}</div>
                      <div className="bg-background/95 px-3 py-2 text-foreground">{row.paid}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {watchlist.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center">
                <Star className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-2">No stocks yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first stock to start receiving AI-powered trading signals
                </p>
                <Button onClick={handleOpenAddStock} size="sm" className="pill-button pill-button-primary">
                  Add your first stock
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map((stock) => {
                  const latestSignal = latestSignalsByTicker[stock.ticker];
                  const liveStatus = watchlistStatusMap[stock.ticker];
                  const presentation = getResolvedWatchlistPresentation(
                    stock.ticker,
                    liveStatus,
                    latestSignal,
                  );
                  const statusClass =
                    presentation.statusTone === "buy"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : presentation.statusTone === "sell"
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        : presentation.statusTone === "low_confidence"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : presentation.statusTone === "data_unavailable"
                            ? "bg-slate-500/15 text-slate-300 border-slate-500/30"
                            : "bg-muted text-muted-foreground border-muted";

                  return (
                    <button
                      key={stock.id}
                      onClick={() => setLocation(buildStockDetailPath(stock.ticker))}
                      className="w-full text-left px-4 py-3 rounded-xl border border-border/70 bg-background/40 hover:bg-background/60 hover:border-primary/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{stock.ticker}</p>
                          <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                          <div className="mt-1 max-w-[34ch]">
                            {hasPremiumSignalAccess ? (
                              <p className="text-[11px] leading-5 text-muted-foreground line-clamp-2">{presentation.statusDetail}</p>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-[11px] leading-5 text-muted-foreground blur-[2.5px] select-none">
                                  {getBlurredPreviewText(presentation.statusDetail, "Premium signal explanation hidden until upgrade.")}
                                </p>
                                <p className="text-[11px] leading-5 text-primary">Upgrade to reveal the full live signal explanation and current buy/sell status.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={hasPremiumSignalAccess ? "" : "relative"}>
                            <Badge variant="secondary" className={hasPremiumSignalAccess ? statusClass : "bg-primary/15 text-primary border-primary/30 blur-[1.5px]"}>
                              {hasPremiumSignalAccess && presentation.statusTone === "buy" ? <TrendingUp className="h-3 w-3 mr-1" /> : null}
                              {hasPremiumSignalAccess && presentation.statusTone === "sell" ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                              {hasPremiumSignalAccess ? presentation.statusLabel : "Premium"}
                            </Badge>
                            {!hasPremiumSignalAccess ? <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Preview</span> : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section data-section="next-steps" className="dashboard-frame relative overflow-hidden px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Next steps</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <GuideCard
                title="Review signals"
                text={hasPremiumSignalAccess ? "Check today's highest-conviction buy and sell ideas" : "Unlock full buy and sell signal detail by upgrading your plan"}
                icon={<BrainCircuit className="h-5 w-5 text-primary" />}
              />
              <GuideCard
                title="Validate ideas"
                text="Use the simulator to test strategies before trading"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
              />
              <GuideCard
                title="Set alerts"
                text="Get notified when key setups appear in your watchlist"
                icon={<BellRing className="h-5 w-5 text-primary" />}
              />
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3 } from "lucide-react";

function MetricCard({
  label,
  value,
  note,
  icon,
  trend,
  trendPercent,
  onClick,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendPercent?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="metric-card w-full min-w-0 cursor-pointer text-left transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="metric-label">{label}</p>
          <p className="metric-value">{value}</p>
          {trend && trendPercent && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendPercent}% (7d)
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/45 border border-border/70">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    </button>
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
