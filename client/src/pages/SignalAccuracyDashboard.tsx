import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, BarChart3, ArrowLeft, Home, AlertCircle, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { DASHBOARD_HOME_PATH, navigateToDashboardMenu } from "@/lib/navigation";
import { getSelectedPortfolio, loadTradingSimulatorState } from "@/lib/tradingSimulatorState";
import { useEffect, useState } from "react";

const getStorage = () => (typeof window !== "undefined" ? window.localStorage : undefined);

export default function SignalAccuracyDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: accuracyData, isLoading } = trpc.dashboard.getTrendData.useQuery(undefined, {
    enabled: !!user,
  });
  
  const [simulatorState, setSimulatorState] = useState(() => {
    return loadTradingSimulatorState(getStorage());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatorState(loadTradingSimulatorState(getStorage()));
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const selectedPortfolio = getSelectedPortfolio(simulatorState);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Trades Executed",
      value: selectedPortfolio.trades.length.toString(),
      icon: BarChart3,
      trend: selectedPortfolio.trades.length > 0 ? "up" : "neutral",
      description: "Trades executed in your simulator portfolio",
    },
    {
      label: "Portfolio Return",
      value: `${selectedPortfolio.totalReturnPercent.toFixed(2)}%`,
      icon: TrendingUp,
      trend: selectedPortfolio.totalReturnPercent > 0 ? "up" : "down",
      description: "Total return on initial capital",
    },
    {
      label: "Current Value",
      value: `$${selectedPortfolio.currentValue.toFixed(2)}`,
      icon: Target,
      trend: selectedPortfolio.currentValue > selectedPortfolio.initialCapital ? "up" : "down",
      description: "Current portfolio value",
    },
    {
      label: "Cash Balance",
      value: `$${selectedPortfolio.cash.toFixed(2)}`,
      icon: TrendingDown,
      trend: "neutral",
      description: "Available cash for trades",
    },
  ];

  return (
    <div className="space-y-6 px-1 sm:px-0">
      <div className="flex items-center justify-between gap-3 mb-8 pt-2">
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

      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Simulator Performance</h1>
        <p className="text-muted-foreground">
          Track your paper trading performance from the simulator
        </p>
      </div>

      {/* Disclaimer Banner */}
      <Card className="border-amber-500/50 bg-amber-500/10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">Paper Trading Results</p>
              <p className="text-sm text-amber-800">
                These metrics reflect simulator performance only. Real trading results may differ significantly due to market conditions, execution prices, and other factors. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </div>
                  <Icon className="h-4 w-4 text-primary/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  {metric.trend === "up" && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Up
                    </Badge>
                  )}
                  {metric.trend === "down" && (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-700">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Down
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
          <CardDescription>
            Overview of your simulator portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Initial Capital</span>
              <span className="text-lg font-bold">${selectedPortfolio.initialCapital.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total Return</span>
              <span className={`text-lg font-bold ${selectedPortfolio.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${selectedPortfolio.totalReturn.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Open Positions</span>
              <span className="text-lg font-bold">{selectedPortfolio.positions.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total Trades</span>
              <span className="text-lg font-bold">{selectedPortfolio.trades.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Box */}
      <Card className="border-blue-500/50 bg-blue-500/10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">How Simulator Performance is Calculated</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Trades are executed at current market prices with 0.05% slippage</li>
                <li>Commission is charged at 0.1% per trade</li>
                <li>Positions are valued at current market prices (refreshed every 60 seconds)</li>
                <li>Signals are generated from daily technical indicators (RSI, MACD, SMA, Bollinger Bands)</li>
                <li>Auto-trading scans your selected universe and executes trades based on confidence thresholds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
