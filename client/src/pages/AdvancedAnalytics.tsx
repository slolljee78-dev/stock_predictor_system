import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  date: string;
  return: number;
  volatility: number;
  sharpe: number;
  drawdown: number;
}

interface SectorAllocation {
  name: string;
  value: number;
  color: string;
}

interface RiskMetrics {
  var95: number;
  cvar95: number;
  beta: number;
  correlation: number;
  maxDrawdown: number;
  recoveryTime: number;
}

export default function AdvancedAnalytics() {
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('1y');

  const analyticsData: AnalyticsData[] = generateAnalyticsData();
  const sectorData: SectorAllocation[] = [
    { name: 'Technology', value: 35, color: '#667eea' },
    { name: 'Healthcare', value: 20, color: '#764ba2' },
    { name: 'Finance', value: 18, color: '#f093fb' },
    { name: 'Consumer', value: 15, color: '#4facfe' },
    { name: 'Industrial', value: 12, color: '#43e97b' },
  ];

  const riskMetrics: RiskMetrics = {
    var95: 2.45,
    cvar95: 3.12,
    beta: 1.15,
    correlation: 0.72,
    maxDrawdown: 8.5,
    recoveryTime: 45,
  };

  const correlationMatrix = [
    { name: 'AAPL', AAPL: 1.0, MSFT: 0.82, NVDA: 0.78, TSLA: 0.65, JNJ: 0.45 },
    { name: 'MSFT', AAPL: 0.82, MSFT: 1.0, NVDA: 0.81, TSLA: 0.62, JNJ: 0.48 },
    { name: 'NVDA', AAPL: 0.78, MSFT: 0.81, NVDA: 1.0, TSLA: 0.68, JNJ: 0.42 },
    { name: 'TSLA', AAPL: 0.65, MSFT: 0.62, NVDA: 0.68, TSLA: 1.0, JNJ: 0.35 },
    { name: 'JNJ', AAPL: 0.45, MSFT: 0.48, NVDA: 0.42, TSLA: 0.35, JNJ: 1.0 },
  ];

  const riskReturnData = [
    { name: 'AAPL', return: 28.5, risk: 22.3 },
    { name: 'MSFT', return: 24.2, risk: 18.5 },
    { name: 'NVDA', return: 35.8, risk: 28.2 },
    { name: 'TSLA', return: 18.5, risk: 35.2 },
    { name: 'JNJ', return: 12.3, risk: 14.5 },
    { name: 'Portfolio', return: 22.5, risk: 16.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep dive into portfolio metrics and risk analysis</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['1m', '3m', '6m', '1y', 'all'] as const).map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            onClick={() => setTimeframe(tf)}
            size="sm"
          >
            {tf === '1m' ? '1M' : tf === '3m' ? '3M' : tf === '6m' ? '6M' : tf === '1y' ? '1Y' : 'All'}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.45</div>
            <p className="text-xs text-muted-foreground mt-1">Risk-adjusted returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sortino Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.12</div>
            <p className="text-xs text-muted-foreground mt-1">Downside risk-adjusted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Information Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.85</div>
            <p className="text-xs text-muted-foreground mt-1">vs benchmark</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calmar Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.65</div>
            <p className="text-xs text-muted-foreground mt-1">Return/max drawdown</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics Over Time</CardTitle>
          <CardDescription>Rolling metrics for {timeframe === '1m' ? '1 month' : timeframe === '3m' ? '3 months' : timeframe === '6m' ? '6 months' : timeframe === '1y' ? '1 year' : 'all time'}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="return" stroke="#667eea" name="Return (%)" />
              <Line yAxisId="right" type="monotone" dataKey="volatility" stroke="#764ba2" name="Volatility (%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
            <CardDescription>Portfolio composition by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>Portfolio risk analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Value at Risk (95%)</span>
                <span className="font-semibold">{riskMetrics.var95.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Conditional VaR (95%)</span>
                <span className="font-semibold">{riskMetrics.cvar95.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Beta</span>
                <span className="font-semibold">{riskMetrics.beta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Correlation (Market)</span>
                <span className="font-semibold">{riskMetrics.correlation.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Max Drawdown</span>
                <span className="font-semibold text-red-600">{riskMetrics.maxDrawdown.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recovery Time (days)</span>
                <span className="font-semibold">{riskMetrics.recoveryTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk-Return Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Risk-Return Profile</CardTitle>
          <CardDescription>Individual stocks vs portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk" name="Risk (Volatility %)" />
              <YAxis dataKey="return" name="Return (%)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Holdings" data={riskReturnData.slice(0, 5)} fill="#667eea" />
              <Scatter name="Portfolio" data={riskReturnData.slice(5)} fill="#28a745" shape="diamond" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Correlation Matrix</CardTitle>
          <CardDescription>Correlation between holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Symbol</th>
                  <th className="text-center py-2 px-3 font-medium">AAPL</th>
                  <th className="text-center py-2 px-3 font-medium">MSFT</th>
                  <th className="text-center py-2 px-3 font-medium">NVDA</th>
                  <th className="text-center py-2 px-3 font-medium">TSLA</th>
                  <th className="text-center py-2 px-3 font-medium">JNJ</th>
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row) => (
                  <tr key={row.name} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 font-mono font-semibold">{row.name}</td>
                    <td className="py-2 px-3 text-center">{row.AAPL.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">{row.MSFT.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">{row.NVDA.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">{row.TSLA.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">{row.JNJ.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Strong Risk-Adjusted Returns</p>
              <p className="text-sm text-muted-foreground">Your Sharpe ratio of 1.45 is above the market average, indicating good risk-adjusted performance.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingDown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">High Tech Concentration</p>
              <p className="text-sm text-muted-foreground">35% of your portfolio is in Technology. Consider diversifying to reduce sector risk.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <BarChart3 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Moderate Correlation</p>
              <p className="text-sm text-muted-foreground">Average correlation of 0.72 suggests good diversification benefits within your holdings.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generate mock analytics data
 */
function generateAnalyticsData(): AnalyticsData[] {
  const data: AnalyticsData[] = [];
  const startDate = new Date('2025-01-01');

  for (let i = 0; i < 252; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      return: 15 + Math.sin(i / 50) * 5 + (Math.random() - 0.5) * 2,
      volatility: 18 + Math.cos(i / 60) * 4 + (Math.random() - 0.5) * 1.5,
      sharpe: 1.2 + Math.sin(i / 80) * 0.3,
      drawdown: Math.max(0, -5 + Math.sin(i / 100) * 3),
    });
  }

  return data;
}
