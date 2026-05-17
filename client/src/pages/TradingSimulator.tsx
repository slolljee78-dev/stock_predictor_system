import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, AlertCircle, BarChart3, CheckCircle2, DollarSign, History, House, Plus, Target, TrendingDown, TrendingUp } from "lucide-react";

import { SimulatorAutoTrader } from "@/components/SimulatorAutoTrader";
import { AdminViewModeToggle } from "@/components/AdminViewModeToggle";
import { OrderTypeSelector, type OrderType } from "@/components/OrderTypeSelector";
import { HelpTooltip, HELP_CONTENT } from "@/components/HelpTooltip";
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
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { canUseAutoTrading } from "@/lib/subscriptionAccess";
import { useAdminViewMode } from "@/lib/adminViewMode";
import { DASHBOARD_HOME_PATH, navigateToDashboardMenu } from "@/lib/navigation";
import { applyAutoExecutedTrades, type AutoExecutedTrade } from "@/lib/simulatorAutoTrading";
import {
  calculateSimulatorPerformanceSummary,
  filterTradesByOrigin,
  formatHoldingTime,
  type TradeHistoryFilter,
} from "@/lib/simulatorInsights";
import {
  createEmptyPortfolio,
  getSelectedPortfolio,
  getTradePriceSourceLabel,
  loadTradingSimulatorState,
  saveTradingSimulatorState,
  type SimulatorPortfolio,
  type TradingSimulatorState,
} from "@/lib/tradingSimulatorState";
import { useRealtimePriceUpdates } from "@/hooks/useRealtimePriceUpdates";
import { TickerSupportIndicator, PriceFreshnessIndicator } from "@/components/TickerSupportIndicator";

const getStorage = () => (typeof window !== "undefined" ? window.localStorage : undefined);

function isLivePriceResponse(value: unknown): value is {
  ticker: string;
  price: number;
  timestamp: string;
  change?: number;
  changePercent?: number;
} {
  return typeof value === "object" && value !== null && typeof (value as { price?: unknown }).price === "number";
}

function formatCurrency(value: number) {
  return `£${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TradingSimulator() {
  const [simulatorState, setSimulatorState] = useState<TradingSimulatorState>(() => loadTradingSimulatorState(getStorage()));
  const [tradeForm, setTradeForm] = useState({
    ticker: "",
    quantity: "",
    price: "",
  });
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasManualPriceOverride, setHasManualPriceOverride] = useState(false);
  const [tradeHistoryFilter, setTradeHistoryFilter] = useState<TradeHistoryFilter>("all");
  const { user } = useAuth();
  const {
    effectiveUser,
    showAdminViewModeToggle,
    viewMode,
    setViewMode,
    description: adminViewModeDescription,
  } = useAdminViewMode(user);
  const [, setLocation] = useLocation();

  const selectedPortfolio = useMemo(() => getSelectedPortfolio(simulatorState), [simulatorState]);
  const autoTradingEnabled = canUseAutoTrading(effectiveUser);
  const positions = selectedPortfolio.positions;
  const trades = selectedPortfolio.trades;
  const normalizedTicker = tradeForm.ticker.trim().toUpperCase();
  const exposure = useMemo(() => selectedPortfolio.currentValue - selectedPortfolio.cash, [selectedPortfolio]);
  const performanceSummary = useMemo(() => calculateSimulatorPerformanceSummary(selectedPortfolio), [selectedPortfolio]);
  const filteredTrades = useMemo(() => filterTradesByOrigin(trades, tradeHistoryFilter), [tradeHistoryFilter, trades]);

  const executeLiveTradeWithMarketPrice = trpc.simulator.executeLiveTradeWithMarketPrice.useMutation();
  const calculateLivePortfolioValue = trpc.simulator.calculateLivePortfolioValue.useQuery(
    {
      positions: positions.map((position) => ({
        ticker: position.ticker,
        quantity: position.quantity,
        averagePrice: position.entryPrice,
      })),
      cashBalance: selectedPortfolio.cash,
    },
    {
      enabled: positions.length > 0,
      refetchInterval: 60000,
    }
  );

  // Real-time price updates with 15-second polling for responsive updates
  const priceUpdates = useRealtimePriceUpdates(normalizedTicker, {
    pollInterval: 15000, // 15 seconds for more responsive updates during active trading
    enableAutoRefresh: true,
  });

  const livePriceData = priceUpdates.price
    ? {
        ticker: normalizedTicker,
        price: priceUpdates.price,
        timestamp: priceUpdates.timestamp || new Date().toISOString(),
      }
    : null;
  const livePriceUnavailable = normalizedTicker.length > 0 && !priceUpdates.isLoading && !priceUpdates.price;

  useEffect(() => {
    saveTradingSimulatorState(simulatorState, getStorage());
  }, [simulatorState]);

  useEffect(() => {
    if (!livePriceData || hasManualPriceOverride) {
      return;
    }

    const formattedLivePrice = livePriceData.price.toFixed(2);
    setTradeForm((current) => {
      if (current.price === formattedLivePrice) {
        return current;
      }

      return {
        ...current,
        price: formattedLivePrice,
      };
    });
  }, [hasManualPriceOverride, livePriceData]);

  useEffect(() => {
    if (!calculateLivePortfolioValue.data) {
      return;
    }

    const liveData = calculateLivePortfolioValue.data;
    setSimulatorState((current) => ({
      ...current,
      portfolios: current.portfolios.map((portfolio) => {
        if (portfolio.id !== current.selectedPortfolioId) {
          return portfolio;
        }

        return {
          ...portfolio,
          positions: liveData.positions.map((livePosition) => ({
            ticker: livePosition.ticker,
            quantity: livePosition.quantity,
            entryPrice: livePosition.averagePrice,
            currentPrice: livePosition.currentPrice,
            unrealizedPnL: livePosition.unrealizedPnL,
            unrealizedPnLPercent: livePosition.unrealizedPnLPercent,
          })),
          currentValue: liveData.totalValue,
          cash: liveData.cashBalance,
          totalReturn: liveData.totalPnL,
          totalReturnPercent: liveData.totalPnLPercent,
        };
      }),
    }));
  }, [calculateLivePortfolioValue.data]);

  const handleTickerChange = (value: string) => {
    const nextTicker = value.toUpperCase().replace(/[^A-Z.-]/g, "");
    setHasManualPriceOverride(false);
    setTradeForm((current) => ({
      ...current,
      ticker: nextTicker,
      price: current.ticker === nextTicker ? current.price : "",
    }));
  };

  const handlePriceChange = (value: string) => {
    setHasManualPriceOverride(value.trim().length > 0);
    setTradeForm((current) => ({
      ...current,
      price: value,
    }));
  };

  const handleTrade = async (type: "buy" | "sell") => {
    if (!tradeForm.ticker || !tradeForm.quantity || !tradeForm.price) {
      setFeedback({ type: "error", message: "Please enter a ticker, quantity, and price before placing the trade." });
      return;
    }

    const quantity = parseInt(tradeForm.quantity, 10);
    const requestedPrice = parseFloat(tradeForm.price);

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(requestedPrice) || requestedPrice <= 0) {
      setFeedback({ type: "error", message: "Quantity and price must both be valid positive numbers." });
      return;
    }

    if (type === "sell") {
      const existingPosition = positions.find((position) => position.ticker === normalizedTicker);
      if (!existingPosition || existingPosition.quantity < quantity) {
        setFeedback({ type: "error", message: `You only hold ${existingPosition?.quantity ?? 0} shares of ${normalizedTicker}.` });
        return;
      }
    }

    try {
      const result = await executeLiveTradeWithMarketPrice.mutateAsync({
        ticker: normalizedTicker,
        type: type.toUpperCase() as "BUY" | "SELL",
        quantity,
        requestedPrice,
        slippagePercent: 0.05,
        commissionPercent: 0.1,
      });

      if (!result.success) {
        setFeedback({ type: "error", message: result.error ?? "Trade failed." });
        return;
      }

      const priceSource = result.priceSource === "fallback" ? "fallback" : "live";
      const executedAt = new Date().toISOString();
      const newTrade = {
        id: trades.length > 0 ? Math.max(...trades.map((trade) => trade.id)) + 1 : 1,
        ticker: result.ticker,
        type,
        quantity: result.quantity,
        price: result.executedPrice,
        date: new Date(executedAt).toLocaleString(),
        executedAt,
        priceSource,
        origin: "manual" as const,
      } as const;

      setSimulatorState((current) => ({
        ...current,
        portfolios: current.portfolios.map((portfolio) => {
          if (portfolio.id !== current.selectedPortfolioId) {
            return portfolio;
          }

          const existingPosition = portfolio.positions.find((position) => position.ticker === result.ticker);
          let nextPositions = portfolio.positions;

          if (type === "buy") {
            if (existingPosition) {
              const totalCost = existingPosition.entryPrice * existingPosition.quantity + result.executedPrice * result.quantity;
              const totalQuantity = existingPosition.quantity + result.quantity;
              const averagePrice = totalCost / totalQuantity;
              nextPositions = portfolio.positions.map((position) =>
                position.ticker === result.ticker
                  ? {
                      ...position,
                      quantity: totalQuantity,
                      entryPrice: averagePrice,
                      currentPrice: result.executedPrice,
                      unrealizedPnL: (result.executedPrice - averagePrice) * totalQuantity,
                      unrealizedPnLPercent: averagePrice > 0 ? ((result.executedPrice - averagePrice) / averagePrice) * 100 : 0,
                    }
                  : position
              );
            } else {
              nextPositions = [
                ...portfolio.positions,
                {
                  ticker: result.ticker,
                  quantity: result.quantity,
                  entryPrice: result.executedPrice,
                  currentPrice: result.executedPrice,
                  unrealizedPnL: 0,
                  unrealizedPnLPercent: 0,
                },
              ];
            }
          } else if (existingPosition) {
            const remainingQuantity = existingPosition.quantity - result.quantity;
            if (remainingQuantity <= 0) {
              nextPositions = portfolio.positions.filter((position) => position.ticker !== result.ticker);
            } else {
              nextPositions = portfolio.positions.map((position) =>
                position.ticker === result.ticker
                  ? {
                      ...position,
                      quantity: remainingQuantity,
                      currentPrice: result.executedPrice,
                      unrealizedPnL: (result.executedPrice - position.entryPrice) * remainingQuantity,
                      unrealizedPnLPercent: position.entryPrice > 0
                        ? ((result.executedPrice - position.entryPrice) / position.entryPrice) * 100
                        : 0,
                    }
                  : position
              );
            }
          }

          const nextCash = type === "buy"
            ? portfolio.cash - result.totalCost
            : portfolio.cash + result.totalCost;

          return {
            ...portfolio,
            positions: nextPositions,
            trades: [newTrade, ...portfolio.trades],
            cash: nextCash,
            currentValue: portfolio.currentValue - result.commission,
          };
        }),
      }));

      setTradeForm({ ticker: "", quantity: "", price: "" });
      setOrderType("market");
      setLimitPrice("");
      setStopPrice("");
      setHasManualPriceOverride(false);
      setFeedback({
        type: "success",
        message: `${type.toUpperCase()} order executed for ${result.quantity} ${result.ticker} at ${formatCurrency(result.executedPrice)} using ${getTradePriceSourceLabel(priceSource).toLowerCase()}.`,
      });
      setTimeout(() => setFeedback(null), 4000);

      await calculateLivePortfolioValue.refetch();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Trade execution failed." });
    }
  };

  const createPortfolio = () => {
    setSimulatorState((current) => {
      const nextId = current.portfolios.length > 0 ? Math.max(...current.portfolios.map((portfolio) => portfolio.id)) + 1 : 1;
      const portfolio = createEmptyPortfolio(nextId, `Portfolio ${nextId}`);
      return {
        portfolios: [...current.portfolios, portfolio],
        selectedPortfolioId: portfolio.id,
      };
    });
    setFeedback({ type: "success", message: "New simulator portfolio created. It will now persist in this browser until you reset it." });
  };

  const resetPortfolio = () => {
    if (!window.confirm("Reset this simulator portfolio? This cannot be undone.")) {
      return;
    }

    setSimulatorState((current) => ({
      ...current,
      portfolios: current.portfolios.map((portfolio) =>
        portfolio.id === current.selectedPortfolioId
          ? {
              ...portfolio,
              currentValue: portfolio.initialCapital,
              cash: portfolio.initialCapital,
              totalReturn: 0,
              totalReturnPercent: 0,
              positions: [],
              trades: [],
            }
          : portfolio
      ),
    }));
    setFeedback({ type: "success", message: "The selected simulator portfolio was reset and the cleared state has been saved." });
  };

  const handleAutoTradesApplied = async (executedTrades: AutoExecutedTrade[], summaryMessage: string) => {
    setSimulatorState((current) => ({
      ...current,
      portfolios: current.portfolios.map((portfolio) =>
        portfolio.id === current.selectedPortfolioId
          ? applyAutoExecutedTrades(portfolio, executedTrades)
          : portfolio
      ),
    }));
    setFeedback({ type: "success", message: summaryMessage });
    setTimeout(() => setFeedback(null), 4000);
    await calculateLivePortfolioValue.refetch();
  };

  const priceFieldHint = useMemo(() => {
    if (!normalizedTicker) {
      return "Enter a ticker and the latest live price will load automatically when available.";
    }

    if (priceUpdates.isLoading) {
      return `Checking the latest live price for ${normalizedTicker}...`;
    }

    if (livePriceData) {
      return `Live price loaded for ${normalizedTicker}: ${formatCurrency(livePriceData.price)} as of ${formatTimestamp(livePriceData.timestamp)}. You can still override it manually if needed.`;
    }

    return `Live price is unavailable for ${normalizedTicker} right now. Enter a manual fallback price to continue.`;
  }, [livePriceData, priceUpdates.isLoading, normalizedTicker]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 page-enter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 mb-8 pt-3">
          <button
            onClick={() => navigateToDashboardMenu(setLocation)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </button>
          <button
            onClick={() => setLocation(DASHBOARD_HOME_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            <House className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold gradient-text">Trading Simulator</h1>
                <p className="text-muted-foreground max-w-2xl">
                  Practice trades with live market prices when they are available, or let the built-in auto-trader scan broader stock baskets and execute signal-driven paper trades before you commit real money.
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

          <Button onClick={createPortfolio} className="pill-button pill-button-primary w-full sm:w-auto lg:self-start">
            <Plus className="h-4 w-4 mr-2" />
            New Portfolio
          </Button>
        </div>

        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-8">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                {autoTradingEnabled ? "Major differentiator" : "Paid-plan feature"}
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Automated paper trading is built directly into your simulator.</h2>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Instead of only logging manual practice trades, the simulator can now scan a wider universe, rotate through random baskets, and place virtual buy and sell trades from live signals so users can validate the strategy first.
              </p>
              {!autoTradingEnabled && (
                <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">Free accounts can keep using manual paper trading, but auto trading unlocks after upgrading to a paid plan.</p>
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Broader universe</p>
                <p className="mt-2 text-lg font-semibold">25 stocks per auto-trade pool</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Signal driven</p>
                <p className="mt-2 text-lg font-semibold">Virtual buys and sells from live analysis</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Why it matters</p>
                <p className="mt-2 text-lg font-semibold">Test the system before risking capital</p>
              </div>
              {!autoTradingEnabled && (
                <Button type="button" onClick={() => setLocation("/pricing")} className="pill-button pill-button-primary h-11 px-5 md:self-start">
                  Unlock paid auto trading
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {feedback && (
          <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${feedback.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-rose-500/30 bg-rose-500/10 text-rose-100"}`}>
            {feedback.type === "success" ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
            <p className="text-sm leading-6">{feedback.message}</p>
          </div>
        )}

        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">{selectedPortfolio.name}</CardTitle>
            <CardDescription>
              Your simulator portfolios now save automatically in this browser. Use <span className="font-medium text-foreground">New Portfolio</span> only when you want a separate paper-trading workspace.
              {simulatorState.portfolios.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {simulatorState.portfolios.map((portfolio) => (
                    <button
                      key={portfolio.id}
                      onClick={() => setSimulatorState((current) => ({ ...current, selectedPortfolioId: portfolio.id }))}
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
          <CardContent className="grid gap-6 md:grid-cols-5">
            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="metric-label">Portfolio Value</p>
                    <p className="metric-value">{formatCurrency(selectedPortfolio.currentValue)}</p>
                  </div>
                  <HelpTooltip content={HELP_CONTENT.portfolio.content} />
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="metric-label">Cash Balance</p>
                    <p className="metric-value">{formatCurrency(selectedPortfolio.cash)}</p>
                  </div>
                  <HelpTooltip content="Available cash to place new trades" />
                </div>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Total Return</p>
                  <p className={`metric-value ${selectedPortfolio.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(selectedPortfolio.totalReturn)}
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

            <div className="metric-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Invested</p>
                  <p className="metric-value">{formatCurrency(exposure)}</p>
                </div>
                <History className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Auto-trade performance summary</CardTitle>
            <CardDescription>
              Review how manual and automated trades are contributing to realised outcomes, open exposure, and holding discipline.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div className="metric-card">
              <p className="metric-label">Win Rate</p>
              <p className={`metric-value ${performanceSummary.winRate >= 50 ? "text-emerald-400" : "text-amber-300"}`}>{performanceSummary.winRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-2">{performanceSummary.winningTrades} winning closes out of {performanceSummary.closedTrades}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Realised P&amp;L</p>
              <p className={`metric-value ${performanceSummary.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatCurrency(performanceSummary.realizedPnL)}</p>
              <p className="text-xs text-muted-foreground mt-2">Closed trade outcomes only</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Unrealised P&amp;L</p>
              <p className={`metric-value ${performanceSummary.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatCurrency(performanceSummary.unrealizedPnL)}</p>
              <p className="text-xs text-muted-foreground mt-2">Open position mark-to-market</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Best / Worst</p>
              <p className="metric-value text-lg leading-tight">{performanceSummary.bestTrade ? `${performanceSummary.bestTrade.ticker} ${formatCurrency(performanceSummary.bestTrade.realizedPnL)}` : "No closed trades"}</p>
              <p className="text-xs text-muted-foreground mt-2">{performanceSummary.worstTrade ? `${performanceSummary.worstTrade.ticker} ${formatCurrency(performanceSummary.worstTrade.realizedPnL)}` : "Worst trade appears after the first close."}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Average Hold</p>
              <p className="metric-value text-lg leading-tight">{formatHoldingTime(performanceSummary.averageHoldingMinutes)}</p>
              <p className="text-xs text-muted-foreground mt-2">Manual trades: {performanceSummary.manualTrades} · Auto trades: {performanceSummary.autoTrades}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="premium-card border-0 bg-transparent shadow-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">Execute Trade <HelpTooltip content={HELP_CONTENT.paperTrading.content} /></CardTitle>
              <CardDescription>
                Choose a ticker to auto-load the latest live price. If the live feed is unavailable, you can still enter a manual fallback price and continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Ticker</label>
                  <Input
                    placeholder="AAPL"
                    value={tradeForm.ticker}
                    onChange={(e) => handleTickerChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    placeholder="10"
                    type="number"
                    value={tradeForm.quantity}
                    onChange={(e) => setTradeForm((current) => ({ ...current, quantity: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">Price</label>
                    {livePriceData ? (
                      <Badge variant="secondary" className="text-[11px] uppercase tracking-[0.2em]">
                        Live auto-fill
                      </Badge>
                    ) : livePriceUnavailable ? (
                      <Badge variant="outline" className="text-[11px] uppercase tracking-[0.2em] border-amber-400/40 text-amber-200">
                        Manual fallback
                      </Badge>
                    ) : null}
                  </div>
                  <Input
                    placeholder="150.00"
                    type="number"
                    step="0.01"
                    value={tradeForm.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${livePriceData ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-50" : livePriceUnavailable ? "border-amber-500/20 bg-amber-500/10 text-amber-50" : "border-white/10 bg-white/5 text-muted-foreground"}`}>
                {priceFieldHint}
              </div>

              <OrderTypeSelector
                orderType={orderType}
                onOrderTypeChange={setOrderType}
                currentPrice={livePriceData?.price || (tradeForm.price ? parseFloat(tradeForm.price) : null)}
                limitPrice={limitPrice}
                onLimitPriceChange={setLimitPrice}
                stopPrice={stopPrice}
                onStopPriceChange={setStopPrice}
                tradeType="buy"
                isLoading={executeLiveTradeWithMarketPrice.isPending}
              />

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

              {calculateLivePortfolioValue.isLoading && positions.length > 0 && (
                <p className="text-sm text-muted-foreground">Refreshing live prices for the current portfolio...</p>
              )}
            </CardContent>
          </Card>

          <SimulatorAutoTrader
            portfolio={selectedPortfolio}
            accessUser={effectiveUser}
            onApplyTrades={(executedTrades, summaryMessage) => {
              void handleAutoTradesApplied(executedTrades, summaryMessage);
            }}
          />

          <Card className="premium-card border-0 bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Positions</CardTitle>
              <CardDescription>{positions.length} open positions in this portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {positions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No positions yet. Place a trade to start building this portfolio.</p>
              ) : (
                positions.map((position) => (
                  <div key={position.ticker} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-semibold">{position.ticker}</p>
                      <p className="text-sm text-muted-foreground">{position.quantity} shares · Avg {formatCurrency(position.entryPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${position.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatCurrency(position.unrealizedPnL)}
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight">Trade History</CardTitle>
                <CardDescription>{filteredTrades.length} shown of {trades.length} total trades in this portfolio</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {([
                  ["all", "All trades"],
                  ["manual", "Manual only"],
                  ["auto", "Auto only"],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={tradeHistoryFilter === value ? "default" : "outline"}
                    onClick={() => setTradeHistoryFilter(value)}
                    className="rounded-full"
                  >
                    {label}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={resetPortfolio}>
                  Reset Portfolio
                </Button>
              </div>
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
                {filteredTrades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trades match the current filter yet.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                            {trade.type.toUpperCase()}
                          </Badge>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{trade.ticker}</p>
                              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                                {trade.origin === "auto" ? "Auto" : "Manual"}
                              </Badge>
                              {trade.riskProfile ? (
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.2em]">
                                  {trade.riskProfile}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">{trade.date}</p>
                            <p className="text-xs text-muted-foreground">{getTradePriceSourceLabel(trade.priceSource)}{typeof trade.confidence === "number" ? ` · ${trade.confidence}% confidence` : ""}</p>
                            {trade.reasoning ? <p className="text-xs text-muted-foreground truncate max-w-[28rem]">{trade.reasoning}</p> : null}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold">{trade.quantity} @ {formatCurrency(trade.price)}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(trade.quantity * trade.price)}</p>
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
