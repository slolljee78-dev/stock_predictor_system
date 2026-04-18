import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { SignalDetailsModal } from '@/components/SignalDetailsModal';
import { useLocation } from 'wouter';

interface SignalWithMetrics {
  ticker: string;
  signalType: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  change: number;
  changePercent: number;
  rsi: number | null;
  macd: number | null;
  timestamp: number;
}

export default function SignalsDashboard() {
  const [, setLocation] = useLocation();
  const [selectedSignalType, setSelectedSignalType] = useState<'all' | 'buy' | 'sell'>('all');
  const [minConfidence, setMinConfidence] = useState(60);
  const [sortBy, setSortBy] = useState<'confidence' | 'price' | 'time'>('confidence');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [signals, setSignals] = useState<SignalWithMetrics[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backPath, setBackPath] = useState('/dashboard');
  const [backLabel, setBackLabel] = useState('Back to dashboard');

  useEffect(() => {
    // Always set up both navigation options
    setBackPath('/');
    setBackLabel('Back to menu');
  }, []);

  // Fetch market overview with signals
  const { data: overviewData, isLoading, refetch } = trpc.realtimeSignals.getMarketOverview.useQuery(
    {
      tickers: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'ADBE', 'CRM'],
      minConfidence: minConfidence,
    },
    {
      refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
    }
  );

  // Update signals when data changes
  useEffect(() => {
    if (overviewData?.overview) {
      const processedSignals = overviewData.overview.map(item => ({
        ticker: item.ticker,
        signalType: item.signal as 'buy' | 'sell' | 'hold',
        confidence: item.confidence,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        rsi: item.rsi,
        macd: (item as any).macd || null,
        timestamp: item.timestamp,
      }));

      setSignals(processedSignals);
    }
  }, [overviewData]);

  // Filter signals
  const filteredSignals = signals.filter(signal => {
    if (selectedSignalType !== 'all' && signal.signalType !== selectedSignalType) {
      return false;
    }
    return signal.confidence >= minConfidence;
  });

  // Sort signals
  const sortedSignals = [...filteredSignals].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'price':
        return b.price - a.price;
      case 'time':
        return b.timestamp - a.timestamp;
      default:
        return 0;
    }
  });

  // Calculate statistics
  const buySignals = signals.filter(s => s.signalType === 'buy').length;
  const sellSignals = signals.filter(s => s.signalType === 'sell').length;
  const avgConfidence = signals.length > 0 ? Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to menu</span>
            </button>
          </div>
          <button
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
          >
            <span className="text-sm">Back to dashboard</span>
            <Home className="h-4 w-4" />
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Real-time Signals Dashboard</h1>
          <p className="text-muted-foreground">Live trading signals powered by technical analysis</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buy Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{buySignals}</div>
              <p className="text-xs text-muted-foreground mt-1">Active opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sell Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{sellSignals}</div>
              <p className="text-xs text-muted-foreground mt-1">Exit opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{avgConfidence}%</div>
              <p className="text-xs text-muted-foreground mt-1">Signal strength</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{signals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Monitored stocks</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters & Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Signal Type Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Signal Type</label>
                <Select value={selectedSignalType} onValueChange={(value: any) => setSelectedSignalType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Signals</SelectItem>
                    <SelectItem value="buy">Buy Only</SelectItem>
                    <SelectItem value="sell">Sell Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Threshold */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Min Confidence: {minConfidence}%
                </label>
                <Slider
                  value={[minConfidence]}
                  onValueChange={(value) => setMinConfidence(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto Refresh & Refresh Button */}
              <div className="flex gap-2 items-end">
                <Button
                  variant={autoRefresh ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="flex-1"
                >
                  {autoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="px-3"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signals List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Signals</CardTitle>
            <CardDescription>
              {sortedSignals.length} signal{sortedSignals.length !== 1 ? 's' : ''} matching your filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading signals...</p>
                </div>
              </div>
            ) : sortedSignals.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No signals match your filters</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSignals.map((signal) => (
                  <SignalCard
                    key={signal.ticker}
                    signal={signal}
                    onDetailsClick={() => {
                      setSelectedSignal(signal);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isModalOpen && selectedSignal && (
          <SignalDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            signal={selectedSignal}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Individual Signal Card Component
 */
function SignalCard({
  signal,
  onDetailsClick,
}: {
  signal: SignalWithMetrics;
  onDetailsClick: () => void;
}) {
  const isPositive = signal.changePercent >= 0;
  const isGreen = signal.signalType === 'buy';

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Ticker and Signal Type */}
          <div>
            <h3 className="text-lg font-bold text-foreground">{signal.ticker}</h3>
            <div className="flex gap-2 mt-1">
              <Badge
                variant={isGreen ? 'default' : 'destructive'}
                className={isGreen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {signal.signalType.toUpperCase()}
              </Badge>
              <Badge variant="outline">Confidence: {signal.confidence}%</Badge>
            </div>
          </div>
        </div>

        {/* Price and Change */}
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">${signal.price.toFixed(2)}</p>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}
              {signal.change.toFixed(2)} ({signal.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">RSI (14)</p>
          <p className="text-sm font-semibold text-foreground">
            {signal.rsi !== null && signal.rsi !== undefined ? signal.rsi.toFixed(1) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">MACD</p>
          <p className="text-sm font-semibold text-foreground">
            {signal.macd !== null && signal.macd !== undefined ? signal.macd.toFixed(4) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Time</p>
          <p className="text-sm font-semibold text-foreground">{new Date(signal.timestamp).toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-2 items-end">
          <Button size="sm" variant="outline" className="flex-1" onClick={onDetailsClick}>
            Details
          </Button>
          <Button size="sm" className="flex-1">
            Trade
          </Button>
        </div>
      </div>
    </div>
  );
}
