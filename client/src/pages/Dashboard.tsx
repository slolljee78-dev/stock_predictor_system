import DashboardLayout from "@/components/DashboardLayout";
import MarketOverview from "@/components/MarketOverview";
import RealtimeSignalFeed from "@/components/RealtimeSignalFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { RiskStrategySelector, RiskStrategyBadge } from "@/components/RiskStrategySelector";
import { WatchlistManager } from "@/components/WatchlistManager";
import { DraggableStockList } from "@/components/DraggableStockList";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | undefined>();

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
  // signals is already defined above from signalsQuery

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stock Analysis Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor Trading 212 stocks with AI-powered signals and technical analysis
              </p>
            </div>
            <RiskStrategyBadge />
          </div>
        </div>

        <Card className="border-border/50 bg-gradient-to-br from-background to-background/50">
          <CardHeader>
            <CardTitle>Trading Strategy</CardTitle>
            <CardDescription>Select your risk tolerance for signal generation</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskStrategySelector showDescription={false} />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-background to-background/50">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks by ticker or name (e.g., AAPL, Microsoft)..."
                className="pl-10 h-11 text-base"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {searchQueryTrpc.data.map(stock => (
                  <div
                    key={stock.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/stock/${stock.ticker}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{stock.ticker}</p>
                        <p className="text-xs text-muted-foreground">{stock.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {stock.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-Time Signal Feed */}
        <RealtimeSignalFeed limit={15} autoRefresh={true} refreshInterval={5000} />

        {/* Watchlist Management */}
        <WatchlistManager 
          onSelectWatchlist={setSelectedWatchlistId}
          selectedGroupId={selectedWatchlistId}
        />

        {/* Watchlist Section with Drag-and-Drop */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Watchlist</CardTitle>
                <CardDescription>Drag to reorder • Click to view details</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setSearchQuery('')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedWatchlistId ? (
              <DraggableStockList
                stocks={watchlist}
                groupId={selectedWatchlistId}
                onStocksReordered={() => {
                  // Refresh watchlist after reordering
                }}
                onStockRemoved={() => {
                  // Refresh watchlist after removing stock
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Select a watchlist to view and manage stocks</p>
                <p className="text-xs text-muted-foreground">Use the watchlist manager above to create or select a watchlist</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Overview */}
        <MarketOverview />
      </div>
    </DashboardLayout>
  );
}
