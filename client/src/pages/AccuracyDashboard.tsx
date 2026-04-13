import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

export default function AccuracyDashboard() {
  const [daysBack, setDaysBack] = useState(30);
  
  // Fetch metrics
  const metricsQuery = trpc.accuracy.getMetrics.useQuery({ daysBack });
  const trendsQuery = trpc.accuracy.getTrends.useQuery({ daysBack: Math.max(daysBack, 7) });
  const distributionQuery = trpc.accuracy.getConfidenceDistribution.useQuery({ daysBack });
  const performanceQuery = trpc.accuracy.getPerformanceDetails.useQuery({ limit: 20 });

  const metrics = metricsQuery.data?.data;
  const trends = trendsQuery.data?.data || [];
  const distribution = distributionQuery.data?.data || [];
  const performance = performanceQuery.data?.data || [];

  const isLoading = metricsQuery.isLoading || trendsQuery.isLoading;

  const COLORS = ['oklch(0.65 0.28 200)', 'oklch(0.68 0.26 142)', 'oklch(0.72 0.22 80)', 'oklch(0.6 0.15 200)'];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Signal Accuracy Dashboard</h1>
          <p className="text-muted-foreground">Track your trading signal performance and accuracy metrics</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2 mb-8">
          {[7, 30, 90, 180].map(days => (
            <button
              key={days}
              onClick={() => setDaysBack(days)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                daysBack === days
                  ? 'bg-accent text-background'
                  : 'bg-card border border-border hover:border-accent'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-32 bg-card/50" />
              </Card>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Win Rate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent">{metrics.winRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.winningSignals} of {metrics.totalSignals} signals
                </p>
              </CardContent>
            </Card>

            {/* Total Signals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-gold" />
                  Total Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent-gold">{metrics.totalSignals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.buySignals} buy, {metrics.sellSignals} sell
                </p>
              </CardContent>
            </Card>

            {/* Avg Confidence */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent-emerald" />
                  Avg Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent-emerald">{metrics.averageConfidence}%</div>
                <p className="text-xs text-muted-foreground mt-1">Signal confidence score</p>
              </CardContent>
            </Card>

            {/* Best Stock */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent-cyan" />
                  Best Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-accent-cyan">{metrics.bestPerformingStock}</div>
                <p className="text-xs text-muted-foreground mt-1">Highest win rate</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Trends</CardTitle>
              <CardDescription>Win rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0 / 0.2)" />
                    <XAxis dataKey="date" stroke="oklch(0.7 0 0)" />
                    <YAxis stroke="oklch(0.7 0 0)" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="oklch(0.65 0.28 200)"
                      dot={{ fill: 'oklch(0.65 0.28 200)' }}
                      name="Win Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confidence Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Confidence Distribution</CardTitle>
              <CardDescription>Signals by confidence level</CardDescription>
            </CardHeader>
            <CardContent>
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signal Performance</CardTitle>
            <CardDescription>Last 20 signals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                    <th className="text-left py-3 px-4 font-semibold">Signal</th>
                    <th className="text-left py-3 px-4 font-semibold">Confidence</th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map(signal => (
                    <tr key={signal.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-4 font-semibold">{signal.ticker}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          signal.signalType === 'buy'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {signal.signalType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">{signal.confidence}%</td>
                      <td className="py-3 px-4">£{signal.entryPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          signal.status === 'triggered'
                            ? 'bg-accent/20 text-accent'
                            : signal.status === 'expired'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {signal.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
