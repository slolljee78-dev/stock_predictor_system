import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
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
      setIsAddStockOpen(false);
    },
    onError: (error) => {
      console.error("Error adding stock:", error);
    },
  });

  const watchlist = watchlistQuery.data || [];
  const signals = signalsQuery.data || [];

  const handleAddStockToWatchlist = useCallback((stockId: number) => {
    addToWatchlistMutation.mutate({ stockId });
  }, [addToWatchlistMutation]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage your stock watchlist</p>
        </div>

        {/* Active Signals Section */}
        {signals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Active Trading Signals
              </CardTitle>
              <CardDescription>Latest AI-generated buy/sell recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signals.map(signal => (
                  <div
                    key={signal.signalId}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-card/50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/stock/${signal.ticker}`)}
                  >
                    <div>
                      <p className="font-semibold">{signal.ticker}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'}>
                          {signal.type.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{signal.confidenceScore}% confidence</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Watchlist</CardTitle>
                <CardDescription>{watchlist.length} stocks tracked</CardDescription>
              </div>
              <Button onClick={() => setIsAddStockOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">No stocks in your watchlist yet</p>
                <Button onClick={() => setIsAddStockOpen(true)} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Add Your First Stock
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-card/50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/stock/${item.ticker}`)}
                  >
                    <div>
                      <p className="font-semibold">{item.ticker}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.alertOnBuy && <Badge variant="outline" className="text-xs">Buy Alerts</Badge>}
                      {item.alertOnSell && <Badge variant="outline" className="text-xs">Sell Alerts</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Stock Modal */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Stock to Watchlist</DialogTitle>
            <DialogDescription>
              Search for a stock by ticker symbol or company name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search by ticker (e.g., AAPL) or company name..."
                className="pl-10"
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
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-card/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{stock.ticker}</p>
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
                <p className="text-muted-foreground">No stocks found</p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Start typing to search</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
