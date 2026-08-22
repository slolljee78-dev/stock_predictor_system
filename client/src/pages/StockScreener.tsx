import React, { useState } from 'react';
import { Filter, Download, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const POPULAR_SCREENERS = [
  {
    id: 'bullish_breakout',
    name: 'Bullish Breakout',
    description: 'Stocks showing bullish signals with strong volume',
    icon: '📈',
  },
  {
    id: 'oversold_recovery',
    name: 'Oversold Recovery',
    description: 'Stocks with RSI < 30 (oversold) showing buy signals',
    icon: '🔄',
  },
  {
    id: 'momentum_gainers',
    name: 'Momentum Gainers',
    description: 'Stocks with strong positive MACD and volume',
    icon: '⚡',
  },
  {
    id: 'high_volume_sellers',
    name: 'High Volume Sellers',
    description: 'Stocks with sell signals on high volume',
    icon: '📉',
  },
  {
    id: 'golden_cross',
    name: 'Golden Cross Setup',
    description: 'Bullish SMA alignment (20 > 50 > 200)',
    icon: '✨',
  },
];

const MOCK_RESULTS = [
  {
    ticker: 'AAPL',
    price: 182.45,
    priceChange: 2.3,
    volume: 52000000,
    avgVolume: 48000000,
    signal: 'buy',
    confidence: 78,
    rsi: 65,
    macd: 0.85,
    matchScore: 94,
  },
  {
    ticker: 'MSFT',
    price: 378.91,
    priceChange: 1.8,
    volume: 18000000,
    avgVolume: 16000000,
    signal: 'buy',
    confidence: 72,
    rsi: 62,
    macd: 0.72,
    matchScore: 89,
  },
  {
    ticker: 'GOOGL',
    price: 140.23,
    priceChange: 1.2,
    volume: 22000000,
    avgVolume: 20000000,
    signal: 'hold',
    confidence: 55,
    rsi: 58,
    macd: 0.45,
    matchScore: 76,
  },
];

export default function StockScreener() {
  const [selectedScreener, setSelectedScreener] = useState<string | null>(null);
  const [results] = useState(MOCK_RESULTS);
  const [showFilters, setShowFilters] = useState(false);

  const handleExport = () => {
    const csv = [
      ['Ticker', 'Price', 'Change %', 'Volume', 'Signal', 'Confidence', 'RSI', 'Match Score'],
      ...results.map((r) => [
        r.ticker,
        r.price.toFixed(2),
        r.priceChange.toFixed(2),
        r.volume,
        r.signal,
        r.confidence,
        r.rsi.toFixed(2),
        r.matchScore.toFixed(1),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-secondary/50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Stock Screener</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Find trading opportunities using pre-built or custom filters. Screen thousands of stocks in seconds.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Popular Screeners */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Popular Screeners</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {POPULAR_SCREENERS.map((screener) => (
              <Card
                key={screener.id}
                className={`cursor-pointer transition-all ${
                  selectedScreener === screener.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:border-primary'
                }`}
                onClick={() => setSelectedScreener(screener.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl mb-2">{screener.icon}</div>
                      <CardTitle>{screener.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{screener.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Results */}
        {selectedScreener && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Screening Results</CardTitle>
                  <CardDescription>
                    {results.length} stocks match your criteria
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                      <th className="text-right py-3 px-4 font-semibold">Price</th>
                      <th className="text-right py-3 px-4 font-semibold">Change</th>
                      <th className="text-right py-3 px-4 font-semibold">Volume</th>
                      <th className="text-center py-3 px-4 font-semibold">Signal</th>
                      <th className="text-right py-3 px-4 font-semibold">Confidence</th>
                      <th className="text-right py-3 px-4 font-semibold">RSI</th>
                      <th className="text-right py-3 px-4 font-semibold">Match</th>
                      <th className="text-center py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-semibold">{result.ticker}</td>
                        <td className="text-right py-3 px-4">${result.price.toFixed(2)}</td>
                        <td
                          className={`text-right py-3 px-4 ${
                            result.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {result.priceChange > 0 ? '+' : ''}
                          {result.priceChange.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          {(result.volume / 1000000).toFixed(1)}M
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={
                              result.signal === 'buy'
                                ? 'default'
                                : result.signal === 'sell'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {result.signal.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4">{result.confidence}%</td>
                        <td className="text-right py-3 px-4">{result.rsi.toFixed(0)}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {result.matchScore.toFixed(0)}%
                        </td>
                        <td className="text-center py-3 px-4">
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {selectedScreener && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.length}</div>
                <p className="text-xs text-muted-foreground mt-1">stocks found</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Buy Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {results.filter((r) => r.signal === 'buy').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (results.filter((r) => r.signal === 'buy').length / results.length) *
                    100
                  ).toFixed(0)}
                  % of results
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(results.reduce((sum, r) => sum + r.confidence, 0) / results.length).toFixed(0)}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">average across results</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Match Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(results.reduce((sum, r) => sum + r.matchScore, 0) / results.length).toFixed(0)}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">quality of matches</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-200">How to Use the Screener</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 dark:text-blue-200 space-y-2">
            <p>
              <strong>1. Choose a Screener:</strong> Select one of the popular pre-built screeners or create custom filters.
            </p>
            <p>
              <strong>2. Review Results:</strong> See all stocks that match your criteria, sorted by match score.
            </p>
            <p>
              <strong>3. Export Data:</strong> Download results as CSV for further analysis in Excel or other tools.
            </p>
            <p>
              <strong>4. Trade:</strong> Click "View" on any stock to see detailed analysis and trade signals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
