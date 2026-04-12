import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceData {
  date: string;
  portfolio: number;
  benchmark: number;
  cumulative: number;
}

interface ComparisonMetrics {
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
  sharpeRatio: number;
  benchmarkSharpe: number;
  maxDrawdown: number;
  benchmarkDrawdown: number;
  winRate: number;
  profitFactor: number;
}

interface PerformanceComparisonProps {
  data?: PerformanceData[];
  metrics?: ComparisonMetrics;
  benchmark?: 'sp500' | 'nasdaq' | 'ftse100';
}

export function PerformanceComparison({ 
  data = generateMockData(), 
  metrics = generateMockMetrics(),
  benchmark = 'sp500'
}: PerformanceComparisonProps) {
  const benchmarkName = {
    sp500: 'S&P 500',
    nasdaq: 'NASDAQ',
    ftse100: 'FTSE 100',
  }[benchmark];

  const isOutperforming = metrics.outperformance > 0;

  return (
    <div className="space-y-6">
      {/* Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.portfolioReturn.toFixed(2)}%</div>
              {metrics.portfolioReturn > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs {metrics.benchmarkReturn.toFixed(2)}% benchmark</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outperformance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${isOutperforming ? 'text-green-600' : 'text-red-600'}`}>
                {isOutperforming ? '+' : ''}{metrics.outperformance.toFixed(2)}%
              </div>
              {isOutperforming ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs {benchmarkName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
              <Badge variant={metrics.sharpeRatio > metrics.benchmarkSharpe ? 'default' : 'secondary'}>
                {metrics.sharpeRatio > metrics.benchmarkSharpe ? 'Better' : 'Lower'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Benchmark: {metrics.benchmarkSharpe.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">{metrics.maxDrawdown.toFixed(2)}%</div>
              <Badge variant={metrics.maxDrawdown < metrics.benchmarkDrawdown ? 'default' : 'secondary'}>
                {metrics.maxDrawdown < metrics.benchmarkDrawdown ? 'Better' : 'Worse'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Benchmark: {metrics.benchmarkDrawdown.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Performance</CardTitle>
          <CardDescription>Portfolio vs {benchmarkName} benchmark over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#764ba2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `${(value as number).toFixed(2)}%`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#667eea"
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                name="Portfolio"
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#764ba2"
                fillOpacity={1}
                fill="url(#colorBenchmark)"
                name={benchmarkName}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Returns Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Returns Comparison</CardTitle>
          <CardDescription>Side-by-side monthly performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="portfolio" fill="#667eea" name="Portfolio" />
              <Bar dataKey="benchmark" fill="#764ba2" name={benchmarkName} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trading Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Win Rate</span>
              <span className="font-semibold">{metrics.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profit Factor</span>
              <span className="font-semibold">{metrics.profitFactor.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Return/Drawdown</span>
              <span className="font-semibold">{(metrics.portfolioReturn / Math.abs(metrics.maxDrawdown)).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Max Drawdown</span>
              <span className="font-semibold text-red-600">{metrics.maxDrawdown.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Benchmark Drawdown</span>
              <span className="font-semibold">{metrics.benchmarkDrawdown.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Drawdown Reduction</span>
              <span className="font-semibold text-green-600">
                {((metrics.benchmarkDrawdown - metrics.maxDrawdown) / metrics.benchmarkDrawdown * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Generate mock performance data
 */
function generateMockData(): PerformanceData[] {
  const data: PerformanceData[] = [];
  const startDate = new Date('2025-01-01');
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const portfolio = 10 + Math.sin(i / 50) * 5 + (Math.random() - 0.5) * 2 + i * 0.02;
    const benchmark = 8 + Math.sin(i / 60) * 4 + (Math.random() - 0.5) * 1.5 + i * 0.015;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      portfolio: Math.max(0, portfolio),
      benchmark: Math.max(0, benchmark),
      cumulative: portfolio - benchmark,
    });
  }
  
  return data;
}

/**
 * Generate monthly comparison data
 */
function generateMonthlyData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month) => ({
    month,
    portfolio: Math.random() * 8 - 2,
    benchmark: Math.random() * 6 - 1.5,
  }));
}

/**
 * Generate mock metrics
 */
function generateMockMetrics(): ComparisonMetrics {
  return {
    portfolioReturn: 24.5,
    benchmarkReturn: 18.2,
    outperformance: 6.3,
    sharpeRatio: 1.45,
    benchmarkSharpe: 1.12,
    maxDrawdown: 8.5,
    benchmarkDrawdown: 12.3,
    winRate: 62.5,
    profitFactor: 2.15,
  };
}
