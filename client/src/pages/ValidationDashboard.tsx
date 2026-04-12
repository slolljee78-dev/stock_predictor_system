import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, AlertTriangle, RefreshCw, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

interface ValidationMetrics {
  currentCapital: number;
  dailyPnL: number;
  monthlyReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
}

interface MonthlyTarget {
  month: number;
  target: number;
  actual: number;
  met: boolean;
}

export default function ValidationDashboard() {
  const [metrics, setMetrics] = useState<ValidationMetrics>({
    currentCapital: 100,
    dailyPnL: 0,
    monthlyReturn: 0,
    winRate: 0.65,
    sharpeRatio: 1.2,
    maxDrawdown: 3.5,
    totalTrades: 12,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());

  // Fetch live market data
  const { data: liveData, refetch: refetchLiveData } = trpc.liveMarket.getPrices.useQuery(
    { tickers: ["AAPL", "MSFT", "GOOGL"] },
    { enabled: false }
  );

  // Refresh live data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(true);
      refetchLiveData().finally(() => {
        setLoading(false);
        setLastUpdate(new Date().toLocaleTimeString());
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchLiveData]);

  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([
    { month: 1, target: 110, actual: 100, met: false },
    { month: 2, target: 121, actual: 100, met: false },
    { month: 3, target: 133.1, actual: 100, met: false },
  ]);

  const [performanceHistory, setPerformanceHistory] = useState([
    { date: "Day 1", capital: 100, target: 100 },
    { date: "Day 2", capital: 101, target: 100.5 },
    { date: "Day 3", capital: 102.5, target: 101 },
  ]);

  const [tradeHistory, setTradeHistory] = useState([
    {
      id: 1,
      date: "2026-04-11",
      ticker: "AAPL",
      type: "BUY",
      quantity: 10,
      price: 150.5,
      pnl: 15,
      pnlPercent: 1.0,
    },
    {
      id: 2,
      date: "2026-04-11",
      ticker: "MSFT",
      type: "SELL",
      quantity: 5,
      price: 320.2,
      pnl: 8,
      pnlPercent: 0.5,
    },
  ]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await refetchLiveData();
    setLoading(false);
    setLastUpdate(new Date().toLocaleTimeString());
  };

  const capitalProgress = (metrics.currentCapital / monthlyTargets[2].target) * 100;
  const riskLimitStatus = Math.abs(metrics.dailyPnL) > 2 ? "EXCEEDED" : "OK";
  const riskColor = riskLimitStatus === "EXCEEDED" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";

  const winLossData = [
    { name: "Wins", value: Math.round(metrics.totalTrades * metrics.winRate) },
    { name: "Losses", value: Math.round(metrics.totalTrades * (1 - metrics.winRate)) },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <PageTransition>
      <div className="space-y-8 p-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">3-Month Validation</h1>
          <p className="text-muted-foreground">Track your paper trading performance toward £100 → £133.10</p>
        </div>
        <Button 
          onClick={handleManualRefresh}
          disabled={loading}
          className="btn-premium gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Capital */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">CAPITAL</span>
          </div>
          <div className="metric-value">£{metrics.currentCapital.toFixed(2)}</div>
          <div className={`metric-change ${metrics.dailyPnL >= 0 ? 'positive' : 'negative'}`}>
            {metrics.dailyPnL >= 0 ? '+' : ''}{metrics.dailyPnL.toFixed(2)} today
          </div>
        </div>

        {/* Win Rate */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">WIN RATE</span>
          </div>
          <div className="metric-value">{(metrics.winRate * 100).toFixed(1)}%</div>
          <div className="metric-label">Target: 60%+</div>
          <div className="progress-premium mt-3">
            <div 
              className="progress-premium-fill" 
              style={{ width: `${Math.min(metrics.winRate * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">SHARPE RATIO</span>
          </div>
          <div className="metric-value">{metrics.sharpeRatio.toFixed(2)}</div>
          <div className="metric-label">Target: {'>'}1.0</div>
        </div>

        {/* Max Drawdown */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">MAX DRAWDOWN</span>
          </div>
          <div className="metric-value">{metrics.maxDrawdown.toFixed(1)}%</div>
              <div className="metric-label">Target: {'<'}5%</div>
        </div>
      </div>

      {/* Monthly Targets */}
      <div className="card-premium">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Monthly Targets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {monthlyTargets.map((target) => (
            <div key={target.month} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Month {target.month}</span>
                {target.met === true ? (
                  <CheckCircle className="h-5 w-5 text-accent" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-semibold">£{target.target.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-semibold">£{target.actual.toFixed(2)}</span>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="card-premium">
          <h3 className="text-lg font-bold mb-4">Capital Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="capital" 
                stroke="var(--accent)" 
                strokeWidth={2}
                dot={{ fill: 'var(--accent)' }}
                name="Your Capital"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="var(--muted-foreground)" 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss Distribution */}
        <div className="card-premium">
          <h3 className="text-lg font-bold mb-4">Win/Loss Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Status */}
      <div className={`card-premium border-l-4 ${riskLimitStatus === 'EXCEEDED' ? 'border-red-500' : 'border-accent'}`}>
        <div className="flex items-center gap-3">
          {riskLimitStatus === 'EXCEEDED' ? (
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle className="h-6 w-6 text-accent" />
          )}
          <div>
            <p className="font-semibold">Daily Loss Limit: 2%</p>
            <p className={`text-sm ${riskColor}`}>
              Status: {riskLimitStatus} - {Math.abs(metrics.dailyPnL).toFixed(2)} loss today
            </p>
          </div>
        </div>
      </div>

      {/* Trade History */}
      <div className="card-premium">
        <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticker</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>P&L</th>
                <th>P&L %</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.map((trade) => (
                <tr key={trade.id}>
                  <td>{trade.date}</td>
                  <td className="font-semibold">{trade.ticker}</td>
                  <td>
                    <span className={`badge-premium ${trade.type === 'BUY' ? 'badge-success' : 'badge-warning'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td>{trade.quantity}</td>
                  <td>£{trade.price.toFixed(2)}</td>
                  <td className={trade.pnl >= 0 ? 'text-accent' : 'text-red-600 dark:text-red-400'}>
                    {trade.pnl >= 0 ? '+' : ''}£{trade.pnl.toFixed(2)}
                  </td>
                  <td className={trade.pnlPercent >= 0 ? 'text-accent font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdate}
      </div>
      </div>
    </PageTransition>
  );
}
