import MarketOverview from "@/components/MarketOverview";
import RealtimeSignalFeed from "@/components/RealtimeSignalFeed";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, Plus, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { RiskStrategySelector, RiskStrategyBadge } from "@/components/RiskStrategySelector";
import { WatchlistManager } from "@/components/WatchlistManager";
import { DraggableStockList } from "@/components/DraggableStockList";
import { UsageAnalyticsDashboard } from "@/components/UsageAnalyticsDashboard";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | undefined>();
  const [showEmailVerification, setShowEmailVerification] = useState(!user?.emailVerified);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch watchlist
  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch active signals
  const signalsQuery = trpc.signals.getActiveSignals.useQuery({ limit: 10 }, {
    enabled: !!user,
  });

  const signals = signalsQuery.data?.signals || [];

  // Search stocks
  const searchQueryTrpc = trpc.stocks.search.useQuery(searchQuery, {
    enabled: searchQuery.length > 0,
  });

  const watchlist = watchlistQuery.data || [];

  return (
    <>
      <EmailVerificationModal
        open={showEmailVerification}
        onOpenChange={setShowEmailVerification}
        userEmail={user?.email || ''}
        onVerified={() => setShowOnboarding(true)}
      />
      <OnboardingTutorial
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
      />
      <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Stock Analysis Dashboard</h1>
          <p className="text-sm text-slate-400">
            Monitor Trading 212 stocks with AI-powered signals and technical analysis
          </p>
        </div>

        {/* Usage Analytics for Free Tier Users */}
        {user?.subscriptionTier === "free" && (
          <UsageAnalyticsDashboard
            analytics={{
              tier: "free",
              signalsUsedToday: 0,
              signalsLimit: 5,
              signalsRemaining: 5,
              stocksMonitored: watchlist.length,
              stocksLimit: 3,
              stocksRemaining: Math.max(0, 3 - watchlist.length),
              watchlistsCount: 1,
              watchlistsLimit: 1,
              watchlistsRemaining: 0,
              quotaPercentage: Math.round((watchlist.length / 3) * 100),
              isAtLimit: watchlist.length >= 3,
            }}
            showUpgradePrompt={true}
          />
        )}

        {/* Grid Layout - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Strategy Card */}
          <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50 hover:border-slate-700/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Trading Strategy
              </CardTitle>
              <CardDescription className="text-slate-400">Select your risk tolerance</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskStrategySelector showDescription={false} />
            </CardContent>
          </Card>

          {/* Stock Search Card */}
          <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50 hover:border-slate-700/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-400" />
                Find Stocks
              </CardTitle>
              <CardDescription className="text-slate-400">Search by ticker or name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="AAPL, Microsoft, Tesla..."
                  className="pl-10 h-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchQueryTrpc.data.slice(0, 5).map(stock => (
                    <div
                      key={stock.id}
                      className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/stock/${stock.ticker}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-white">{stock.ticker}</p>
                          <p className="text-xs text-slate-400">{stock.name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-700/50 text-slate-300">
                          {stock.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Signal Feed - Full Width */}
        <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50 hover:border-slate-700/50 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Live Trading Signals
            </CardTitle>
            <CardDescription className="text-slate-400">Real-time AI-powered signals updated every 5 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeSignalFeed limit={15} autoRefresh={true} refreshInterval={5000} />
          </CardContent>
        </Card>

        {/* Watchlist Management - 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Watchlist Manager */}
          <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50 hover:border-slate-700/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white">My Watchlists</CardTitle>
              <CardDescription className="text-slate-400">Organize stocks by strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <WatchlistManager 
                onSelectWatchlist={setSelectedWatchlistId}
                selectedGroupId={selectedWatchlistId}
              />
            </CardContent>
          </Card>

          {/* Watchlist Stocks */}
          <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50 hover:border-slate-700/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Stocks</CardTitle>
                  <CardDescription className="text-slate-400">Drag to reorder • Click to view</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedWatchlistId ? (
                <DraggableStockList
                  stocks={watchlist}
                  groupId={selectedWatchlistId}
                  onStocksReordered={() => {}}
                  onStockRemoved={() => {}}
                />
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Select a watchlist to view stocks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Signals Feed */}
        {signals.length > 0 && (
          <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Live Trading Signals</CardTitle>
              <CardDescription>Real-time AI-powered buy and sell signals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {signals.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-white font-medium">{signal.stock.ticker}</span>
                    <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'}>
                      {signal.type.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
    </>
  );
}