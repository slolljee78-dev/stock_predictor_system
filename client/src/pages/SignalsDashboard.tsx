import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, ArrowLeft, Home, Filter } from 'lucide-react';
import { SignalDetailsModal } from '@/components/SignalDetailsModal';
import { SignalFilters, SignalFilterOptions, DEFAULT_FILTERS } from '@/components/SignalFilters';
import { applyQuickFilter, getQuickFilterValue } from '@/lib/signalQuickFilters';
import { useLocation } from 'wouter';
import { DASHBOARD_HOME_PATH, navigateToDashboardMenu } from '@/lib/navigation';
import { getSignalFilterFromSearch } from '@/lib/dashboardNavigation';
import { PriceFreshnessIndicator } from '@/components/TickerSupportIndicator';

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

const STORAGE_KEY = 'signal_filters';

export default function SignalsDashboard() {
  const [, setLocation] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [signals, setSignals] = useState<SignalWithMetrics[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load filters from localStorage or use defaults
  const [filters, setFilters] = useState<SignalFilterOptions>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // Fetch user's signals from database
  const { data: userSignals, isLoading, refetch } = trpc.signals.getForUser.useQuery(
    undefined,
    {
      refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
    }
  );

  // Update signals when data changes
  useEffect(() => {
    if (userSignals) {
      const processedSignals = userSignals.map(item => ({
        ticker: item.ticker,
        signalType: item.type as 'buy' | 'sell' | 'hold',
        confidence: item.confidenceScore,
        price: item.priceAtSignal,
        change: 0,
        changePercent: 0,
        rsi: null,
        macd: null,
        timestamp: item.createdAt instanceof Date ? item.createdAt.getTime() : item.createdAt,
      }));

      setSignals(processedSignals);
    }
  }, [userSignals]);

  // Filter signals based on all filter criteria
  const filteredSignals = signals.filter(signal => {
    // Signal type filter
    if (filters.signalType !== 'all' && signal.signalType !== filters.signalType) {
      return false;
    }

    // Confidence filter
    if (signal.confidence < filters.minConfidence) {
      return false;
    }

    // RSI filter
    if (signal.rsi !== null) {
      if (signal.rsi < filters.rsiMin || signal.rsi > filters.rsiMax) {
        return false;
      }
    }

    // MACD filter
    if (filters.macdFilter !== 'all' && signal.macd !== null) {
      const isMacdPositive = signal.macd > 0;
      if (filters.macdFilter === 'positive' && !isMacdPositive) {
        return false;
      }
      if (filters.macdFilter === 'negative' && isMacdPositive) {
        return false;
      }
    }

    // Price change filter
    if (signal.changePercent < filters.priceChangeMin || signal.changePercent > filters.priceChangeMax) {
      return false;
    }

    return true;
  });

  // Sort signals based on selected sort option
  const sortedSignals = [...filteredSignals].sort((a, b) => {
    switch (filters.sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'price':
        return b.price - a.price;
      case 'time':
        return b.timestamp - a.timestamp;
      case 'rsi':
        // Sort by RSI extremes (closest to 0 or 100)
        const aRsiDist = a.rsi ? Math.min(a.rsi, 100 - a.rsi) : 50;
        const bRsiDist = b.rsi ? Math.min(b.rsi, 100 - b.rsi) : 50;
        return aRsiDist - bRsiDist;
      case 'change':
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const buySignals = signals.filter(s => s.signalType === 'buy').length;
  const sellSignals = signals.filter(s => s.signalType === 'sell').length;
  const avgConfidence = signals.length > 0 ? Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) : 0;
  const quickFilterValue = getQuickFilterValue(filters);
  const buyIdeaSignals = sortedSignals.filter((signal) => signal.signalType === 'buy').slice(0, 3);
  const sellIdeaSignals = sortedSignals.filter((signal) => signal.signalType === 'sell').slice(0, 3);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => navigateToDashboardMenu(setLocation)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to menu</span>
          </button>
          <button
            onClick={() => setLocation(DASHBOARD_HOME_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            <span>Back to dashboard</span>
          </button>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold gradient-text md:text-5xl">Real-time Signals Dashboard</h1>
          <p className="text-muted-foreground">Live trading signals powered by technical analysis</p>
        </div>

        <div className="sticky top-3 z-30 rounded-2xl border border-border/70 bg-background/88 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300/80">Buy</p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">{buySignals}</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300/80">Sell</p>
                <p className="mt-1 text-lg font-semibold text-rose-300">{sellSignals}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/80">Avg confidence</p>
                <p className="mt-1 text-lg font-semibold text-primary">{avgConfidence}%</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Showing</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{sortedSignals.length}/{signals.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {autoRefresh ? 'Auto refresh on' : 'Auto refresh off'}
              </Badge>
              <span>{isLoading ? 'Refreshing now' : 'Live summary pinned while you review signals'}</span>
            </div>
          </div>
        </div>

        {/* Idea Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-2" data-testid="buy-ideas-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Buy Ideas</CardTitle>
                  <CardDescription className="mt-1">Top buy signals matching your current filters</CardDescription>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">{buySignals} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {buyIdeaSignals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No buy ideas match the current filters yet.</p>
              ) : (
                <div className="space-y-3">
                  {buyIdeaSignals.map((signal) => (
                    <div key={`buy-idea-${signal.ticker}-${signal.timestamp}`} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{signal.ticker}</p>
                        <p className="text-xs text-muted-foreground">{signal.confidence}% confidence buy idea</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-300">${signal.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(signal.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2" data-testid="sell-ideas-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sell Ideas</CardTitle>
                  <CardDescription className="mt-1">Top sell signals matching your current filters</CardDescription>
                </div>
                <Badge className="bg-rose-500/15 text-rose-300 hover:bg-rose-500/15">{sellSignals} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {sellIdeaSignals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sell ideas match the current filters yet.</p>
              ) : (
                <div className="space-y-3">
                  {sellIdeaSignals.map((signal) => (
                    <div key={`sell-idea-${signal.ticker}-${signal.timestamp}`} className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/15 bg-rose-500/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{signal.ticker}</p>
                        <p className="text-xs text-muted-foreground">{signal.confidence}% confidence sell idea</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-rose-300">${signal.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(signal.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{avgConfidence}%</div>
              <p className="mt-1 text-xs text-muted-foreground">Signal strength across the current feed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Showing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{sortedSignals.length}/{signals.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Signals visible after your filters are applied</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All signals', value: 'all' as const },
            { label: 'Buy', value: 'buy' as const },
            { label: 'Sell', value: 'sell' as const },
            { label: 'High confidence', value: 'high-confidence' as const },
          ].map((chip) => {
            const isActive = quickFilterValue === chip.value;
            return (
              <Button
                key={chip.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters((current) => applyQuickFilter(current, chip.value))}
                className={isActive ? 'rounded-full' : 'rounded-full border-border/70 bg-background/40'}
              >
                {chip.label}
              </Button>
            );
          })}
        </div>

        {/* Filters Toggle and Display */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
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

        {/* Advanced Filters Panel */}
        {showFilters && (
          <SignalFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {showFilters && <div className="mb-4" />}

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

  // Calculate freshness state
  const isStale = Date.now() - signal.timestamp > 3600000; // Stale if older than 1 hour
  const isLoading = false; // Not loading in this context

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
        <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4 flex-1">
          {/* Ticker and Signal Type */}
          <div>
            <h3 className="text-lg font-bold text-foreground">{signal.ticker}</h3>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge
                variant={isGreen ? 'default' : 'destructive'}
                className={isGreen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {signal.signalType.toUpperCase()}
              </Badge>
              <Badge variant="outline">Confidence: {signal.confidence}%</Badge>
              <PriceFreshnessIndicator
                lastUpdateTime={signal.timestamp}
                isStale={isStale}
                isLoading={isLoading}
              />
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
