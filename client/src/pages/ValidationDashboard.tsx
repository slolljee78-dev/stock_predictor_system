import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

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
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    totalTrades: 0,
  });

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

  const capitalProgress = (metrics.currentCapital / monthlyTargets[2].target) * 100;
  const riskLimitStatus = Math.abs(metrics.dailyPnL) > 2 ? "EXCEEDED" : "OK";
  const riskColor = riskLimitStatus === "EXCEEDED" ? "text-red-600" : "text-green-600";

  const winLossData = [
    { name: "Wins", value: Math.round(metrics.totalTrades * metrics.winRate) },
    { name: "Losses", value: Math.round(metrics.totalTrades * (1 - metrics.winRate)) },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">3-Month Validation Framework</h1>
          <p className="text-gray-600 mt-2">Track your paper trading performance toward £100 → £133.10 goal</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Start New Session</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Capital */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{metrics.currentCapital.toFixed(2)}</div>
            <p className={`text-sm mt-2 ${metrics.dailyPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {metrics.dailyPnL >= 0 ? "+" : ""}{metrics.dailyPnL.toFixed(2)} today
            </p>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.winRate * 100).toFixed(1)}%</div>
            <p className="text-sm text-gray-500 mt-2">Target: 60%+</p>
            <Progress value={Math.min(metrics.winRate * 100, 100)} className="mt-2" />
          </CardContent>
        </Card>

        {/* Sharpe Ratio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-2">Target: {">"}1.0</p>
            <div className={`text-xs mt-2 ${metrics.sharpeRatio > 1.0 ? "text-green-600" : "text-yellow-600"}`}>
              {metrics.sharpeRatio > 1.0 ? "✓ Target met" : "⚠ Below target"}
            </div>
          </CardContent>
        </Card>

        {/* Max Drawdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.maxDrawdown * 100).toFixed(2)}%</div>
            <p className="text-sm text-gray-500 mt-2">Target: {"<"}5%</p>
            <div className={`text-xs mt-2 ${metrics.maxDrawdown < 0.05 ? "text-green-600" : "text-yellow-600"}`}>
              {metrics.maxDrawdown < 0.05 ? "✓ Within limit" : "⚠ Exceeds limit"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Status Alert */}
      <Card className={riskLimitStatus === "EXCEEDED" ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {riskLimitStatus === "EXCEEDED" ? (
              <AlertTriangle className="text-red-600" />
            ) : (
              <AlertCircle className="text-green-600" />
            )}
            <CardTitle className="text-sm">Daily Loss Limit Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`font-semibold ${riskColor}`}>
            {riskLimitStatus === "EXCEEDED" ? "⚠ LIMIT EXCEEDED" : "✓ WITHIN LIMIT"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Current daily loss: {Math.abs(metrics.dailyPnL).toFixed(2)}% (Limit: 2%)
          </p>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Targets</CardTitle>
          <CardDescription>Track progress toward 10% monthly returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTargets.map((target) => (
              <div key={target.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Month {target.month}</span>
                  <span className="text-sm text-gray-600">
                    £{target.actual.toFixed(2)} / £{target.target.toFixed(2)}
                  </span>
                </div>
                <Progress value={(target.actual / target.target) * 100} />
                <div className="flex justify-between items-center text-xs">
                  <span className={target.met ? "text-green-600" : "text-gray-500"}>
                    {target.met ? "✓ Target met" : "In progress"}
                  </span>
                  <span className="text-gray-500">
                    {(((target.actual / target.target) * 100) - 100).toFixed(1)}% to target
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capital Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Capital Growth</CardTitle>
          <CardDescription>Daily capital progression vs target</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="capital" stroke="#3b82f6" name="Actual Capital" />
              <Line type="monotone" dataKey="target" stroke="#10b981" name="Target Path" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Win/Loss Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={winLossData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Trades</span>
              <span className="font-semibold">{metrics.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Winning Trades</span>
              <span className="font-semibold text-green-600">{Math.round(metrics.totalTrades * metrics.winRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Losing Trades</span>
              <span className="font-semibold text-red-600">{Math.round(metrics.totalTrades * (1 - metrics.winRate))}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-600">Monthly Return</span>
              <span className={`font-semibold ${metrics.monthlyReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                {metrics.monthlyReturn >= 0 ? "+" : ""}{metrics.monthlyReturn.toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Last 10 trades executed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Ticker</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-right py-2 px-2">Qty</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-right py-2 px-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{trade.date}</td>
                    <td className="py-2 px-2 font-semibold">{trade.ticker}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.type === "BUY" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="text-right py-2 px-2">{trade.quantity}</td>
                    <td className="text-right py-2 px-2">£{trade.price.toFixed(2)}</td>
                    <td className={`text-right py-2 px-2 font-semibold ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)} ({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline">Download Report</Button>
        <Button variant="outline">Export Data</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">View Detailed Analytics</Button>
      </div>
    </div>
  );
}
