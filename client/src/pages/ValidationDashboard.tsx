import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Clock3, Home, RefreshCw, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { useLocation } from "wouter";
import { DASHBOARD_HOME_PATH, navigateToDashboardMenu } from "@/lib/navigation";
import { calculateSimulatorPerformanceSummary, formatHoldingTime } from "@/lib/simulatorInsights";
import { getSelectedPortfolio, loadTradingSimulatorState, type SimulatorTrade } from "@/lib/tradingSimulatorState";

const VALIDATION_BASE_CAPITAL = 100;
const VALIDATION_TARGETS = [110, 121, 133.1] as const;

function getBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Not recorded yet";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortTradesDescending(trades: SimulatorTrade[]) {
  return [...trades].sort((left, right) => {
    const leftTime = left.executedAt ? new Date(left.executedAt).getTime() : 0;
    const rightTime = right.executedAt ? new Date(right.executedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export default function ValidationDashboard() {
  const [, setLocation] = useLocation();
  const [simulatorState, setSimulatorState] = useState(() => loadTradingSimulatorState(getBrowserStorage()));
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString("en-GB"));

  const refreshFromStorage = useCallback(() => {
    setLoading(true);
    setSimulatorState(loadTradingSimulatorState(getBrowserStorage()));
    setLastUpdated(new Date().toLocaleTimeString("en-GB"));
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshFromStorage();
    }, 30000);

    const handleFocus = () => refreshFromStorage();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [refreshFromStorage]);

  const selectedPortfolio = useMemo(() => getSelectedPortfolio(simulatorState), [simulatorState]);
  const performanceSummary = useMemo(() => calculateSimulatorPerformanceSummary(selectedPortfolio), [selectedPortfolio]);
  const sortedTrades = useMemo(() => sortTradesDescending(selectedPortfolio.trades), [selectedPortfolio.trades]);
  const recentTrades = sortedTrades.slice(0, 6);
  const autoTrades = sortedTrades.filter((trade) => trade.origin === "auto");
  const latestAutoTrade = autoTrades[0] ?? null;

  const challengeCapital = useMemo(
    () => VALIDATION_BASE_CAPITAL * (1 + selectedPortfolio.totalReturnPercent / 100),
    [selectedPortfolio.totalReturnPercent],
  );
  const finalTarget = VALIDATION_TARGETS[2];
  const progressPercent = Math.max(0, Math.min((challengeCapital / finalTarget) * 100, 100));
  const monthlyTargets = VALIDATION_TARGETS.map((target, index) => ({
    month: index + 1,
    target,
    actual: challengeCapital,
    met: challengeCapital >= target,
  }));

  const validationStatus = challengeCapital >= finalTarget
    ? "Target already reached"
    : challengeCapital >= VALIDATION_TARGETS[1]
      ? "Ahead of the month-two checkpoint"
      : challengeCapital >= VALIDATION_TARGETS[0]
        ? "Ahead of the month-one checkpoint"
        : "Still building toward the challenge target";

  return (
    <PageTransition>
      <div className="space-y-8 p-6 page-enter">
        <div className="flex items-center justify-between gap-3 mb-6">
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
            <Home className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">3-Month Validation</h1>
            <p className="max-w-3xl text-muted-foreground">
              This page does <strong>not</strong> place trades by itself. It converts your currently selected simulator portfolio into a
              normalized <strong>{formatCurrency(VALIDATION_BASE_CAPITAL)}</strong> challenge so you can see whether the strategy is tracking toward
              <strong> {formatCurrency(finalTarget)}</strong> over three months.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={refreshFromStorage} disabled={loading} className="gap-2 btn-premium">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh data
            </Button>
            <Button variant="outline" onClick={() => setLocation("/simulator")} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Open simulator
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/20 bg-primary/8 p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">How it works</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Manual simulator trades update this page after refresh. Auto-trades also appear here once the simulator records them.
                If you do not run trades in the simulator, this validation view will remain unchanged.
              </p>
            </div>
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Last synced at {lastUpdated}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">CHALLENGE VALUE</span>
            </div>
            <div className="metric-value">{formatCurrency(challengeCapital)}</div>
            <div className={`metric-change ${challengeCapital >= VALIDATION_BASE_CAPITAL ? "positive" : "negative"}`}>
              {selectedPortfolio.totalReturnPercent >= 0 ? "+" : ""}{selectedPortfolio.totalReturnPercent.toFixed(2)}% vs simulator start
            </div>
            <div className="progress-premium mt-3">
              <div className="progress-premium-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">SIMULATOR PORTFOLIO</span>
            </div>
            <div className="metric-value">{formatCurrency(selectedPortfolio.currentValue)}</div>
            <div className="metric-label">Cash: {formatCurrency(selectedPortfolio.cash)}</div>
            <div className="mt-2 text-xs text-muted-foreground">Portfolio: {selectedPortfolio.name}</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">WIN RATE</span>
            </div>
            <div className="metric-value">{performanceSummary.closedTrades > 0 ? `${performanceSummary.winRate.toFixed(1)}%` : "No closes yet"}</div>
            <div className="metric-label">{performanceSummary.winningTrades} wins from {performanceSummary.closedTrades} closed trades</div>
            <div className="mt-2 text-xs text-muted-foreground">Average hold: {formatHoldingTime(performanceSummary.averageHoldingMinutes)}</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">BACKGROUND STATUS</span>
            </div>
            <div className="metric-value text-2xl">{latestAutoTrade ? "Auto activity recorded" : "Manual only"}</div>
            <div className="metric-label">{selectedPortfolio.trades.length} total trade{selectedPortfolio.trades.length === 1 ? "" : "s"}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {latestAutoTrade
                ? `Latest auto-trade: ${latestAutoTrade.ticker} ${latestAutoTrade.type.toUpperCase()} on ${formatDateTime(latestAutoTrade.executedAt)}`
                : "No scheduled or auto-trader activity has been recorded in this portfolio yet."}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card-premium">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold">Monthly checkpoints</h2>
                <p className="text-sm text-muted-foreground">Current challenge status: {validationStatus}</p>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Target {formatCurrency(finalTarget)}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {monthlyTargets.map((target) => (
                <div key={target.month} className="rounded-2xl border border-border/60 bg-background/35 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Month {target.month}</p>
                    <span className={`text-xs font-semibold ${target.met ? "text-emerald-300" : "text-muted-foreground"}`}>
                      {target.met ? "Met" : "In progress"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium text-foreground">{formatCurrency(target.target)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current equivalent</span>
                      <span className="font-medium text-foreground">{formatCurrency(target.actual)}</span>
                    </div>
                  </div>
                  <div className="progress-premium">
                    <div
                      className="progress-premium-fill"
                      style={{ width: `${Math.min((target.actual / target.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium">
            <h2 className="text-xl font-bold">What this page is for</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-6">
              <p>
                The validation dashboard is a <strong>scoreboard</strong> for your simulator, not a second simulator. It translates your paper-trading
                return into the <strong>{formatCurrency(VALIDATION_BASE_CAPITAL)} to {formatCurrency(finalTarget)}</strong> challenge format.
              </p>
              <p>
                If you trade manually in the simulator, the metrics here move after refresh. If you enable auto-trading there, those recorded trades
                also feed into this page once they are saved in the simulator portfolio.
              </p>
              <p>
                If nothing changes here, it usually means the simulator portfolio has not changed yet rather than this page failing silently.
              </p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold">Recent validation activity</h2>
              <p className="text-sm text-muted-foreground">The latest manual and auto simulator trades flowing into this validation scorecard.</p>
            </div>
            <div className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              Auto: {autoTrades.length} · Manual: {selectedPortfolio.trades.length - autoTrades.length}
            </div>
          </div>

          {recentTrades.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/25 p-6 text-sm text-muted-foreground">
              No simulator trades have been recorded yet. Open the simulator to place manual trades or start an auto-trading run, then refresh this page.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{trade.ticker}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${trade.type === "buy" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>
                          {trade.type}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {trade.origin === "auto" ? "Auto" : "Manual"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {trade.quantity} share{trade.quantity === 1 ? "" : "s"} at {formatCurrency(trade.price)} · {formatDateTime(trade.executedAt)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">
                      {typeof trade.confidence === "number" ? <p>Confidence: {Math.round(trade.confidence)}%</p> : null}
                      {trade.reasoning ? <p className="max-w-md">{trade.reasoning}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
