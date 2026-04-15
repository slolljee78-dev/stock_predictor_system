import DashboardLayout from "@/components/DashboardLayout";
import MarketOverview from "@/components/MarketOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Search, Plus, X } from "lucide-react";
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  // Fetch watchlist
  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch active signals
  const signalsQuery = trpc.signals.getForUser.useQuery(undefined, {
    enabled: !!user,
  });

  // Search stocks
  const searchQueryTrpc = trpc.stocks.search.useQuery(searchQuery, {
    enabled: searchQuery.length > 0,
  });

  // Add stock to watchlist
  const utils = trpc.useUtils();
  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: () => {
      utils.watchlist.list.invalidate();
      setSearchQuery("");
    },
    onError: (error) => {
      console.error("Error adding stock:", error);
    },
  });

  const watchlist = watchlistQuery.data || [];
  const signals = signalsQuery.data || [];

  const handleAddStockToWatchlist = useCallback((stockId: number) => {
    console.log("Adding stock with ID:", stockId);
    addToWatchlistMutation.mutate({ stockId });
  }, [addToWatchlistMutation]);

  const handleOpenModal = useCallback(() => {
    setSearchQuery("");
    setIsAddStockOpen(true);
  }, []);

  const handleCloseModal = useCallback((open: boolean) => {
    setIsAddStockOpen(open);
    if (!open) setSearchQuery("");
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Monitor Trading 212 stocks with AI-powered signals and technical analysis
          </p>
        </div>

        {/* Active Signals Section */}
        {signals.length > 0 && (
          <Card className="border-border/40 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                Active Trading Signals
              </CardTitle>
              <CardDescription>Latest AI-generated buy/sell recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signals.map(signal => (
                  <div
                    key={signal.signalId}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-base">{signal.ticker}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(signal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant={signal.type === 'buy' ? 'default' : 'destructive'}
                          className="mb-2"
                        >
                          {signal.type.toUpperCase()}
                        </Badge>
                        <p className="text-sm font-medium">{signal.confidenceScore}% confidence</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/stock/${signal.ticker}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Section */}
        <Card className="border-border/40 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Watchlist</CardTitle>
                <CardDescription>Tracked stocks and ETFs</CardDescription>
              </div>
              <Button
                size="lg"
                onClick={handleOpenModal}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-5 w-5" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-8">No stocks in your watchlist yet</p>
                <Button
                  size="lg"
                  onClick={handleOpenModal}
                  className="gap-2 bg-accent hover:bg-accent/90"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Stock
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-card/80 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/stock/${item.ticker}`)}
                  >
                    <div>
                      <p className="font-semibold text-base">{item.ticker}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.alertOnBuy && (
                        <Badge variant="outline" className="text-xs">
                          Buy Alerts
                        </Badge>
                      )}
                      {item.alertOnSell && (
                        <Badge variant="outline" className="text-xs">
                          Sell Alerts
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Overview */}
        <MarketOverview />
      </div>

      {/* Add Stock Modal */}
      <Dialog open={isAddStockOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add Stock to Watchlist</DialogTitle>
            <DialogDescription>
              Search for a stock by ticker symbol or company name to add it to your watchlist
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search by ticker (e.g., AAPL) or company name (e.g., Apple)..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchQuery && searchQueryTrpc.isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Searching...</p>
              </div>
            )}

            {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <p className="text-sm text-muted-foreground px-2">
                  Found {searchQueryTrpc.data.length} result{searchQueryTrpc.data.length !== 1 ? 's' : ''}
                </p>
                {searchQueryTrpc.data.map(stock => {
                  const isAlreadyAdded = watchlist.some(w => w.ticker === stock.ticker);
                  return (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-base">{stock.ticker}</p>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                      <Button
                        onClick={() => handleAddStockToWatchlist(stock.id)}
                        disabled={isAlreadyAdded || addToWatchlistMutation.isPending}
                        variant={isAlreadyAdded ? "outline" : "default"}
                        size="sm"
                      >
                        {isAlreadyAdded ? "Added" : addToWatchlistMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No stocks found matching "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground mt-2">Try searching for a different ticker or company name</p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Start typing to search for stocks</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
