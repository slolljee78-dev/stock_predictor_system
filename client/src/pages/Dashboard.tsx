import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Search, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);

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
      setSelectedStock(null);
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

  const handleOpenModal = () => {
    setSearchQuery("");
    setSelectedStock(null);
    setIsAddStockOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-7xl font-black">Stock Analysis Dashboard</h1>
          <p className="text-xl text-muted-foreground">Monitor Trading 212 stocks with AI-powered signals</p>
        </div>

        {/* Active Signals Section */}
        {signals.length > 0 && (
          <Card className="border-2 border-dashed border-primary bg-card">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-3xl font-black">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                Active Trading Signals
              </CardTitle>
              <CardDescription className="text-lg">Latest AI-generated buy/sell recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signals.map(signal => (
                  <div
                    key={signal.signalId}
                    className="flex items-center justify-between p-6 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-card/80 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/stock/${signal.ticker}`)}
                  >
                    <div className="flex-1">
                      <p className="font-black text-2xl text-foreground group-hover:text-primary transition-colors">{signal.ticker}</p>
                      <p className="text-base text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <Badge 
                          className={`text-lg font-black px-6 py-2 ${signal.type === 'buy' ? 'bg-primary/20 text-primary border-2 border-primary' : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'}`}
                        >
                          {signal.type === 'buy' ? '📈 BUY' : '📉 SELL'}
                        </Badge>
                        <p className="text-base text-muted-foreground mt-3">{signal.confidenceScore}% confidence</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Section */}
        <Card className="border-2 border-dashed border-primary bg-card">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black">Your Watchlist</CardTitle>
                <CardDescription className="text-lg">{watchlist.length} stocks tracked</CardDescription>
              </div>
              <Button 
                onClick={handleOpenModal}
                className="gap-2 bg-primary text-primary-foreground font-black text-lg h-14 px-8"
              >
                <Plus className="h-6 w-6" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-20 space-y-8">
                <div className="flex justify-center">
                  <div className="p-8 bg-primary/10 rounded-full">
                    <Search className="h-16 w-16 text-primary/50" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground mb-3">No stocks in your watchlist yet</p>
                  <p className="text-lg text-muted-foreground mb-8">Add your first stock to start receiving AI-powered trading signals</p>
                </div>
                <Button 
                  onClick={handleOpenModal}
                  size="lg" 
                  className="gap-2 bg-primary text-primary-foreground font-black text-xl h-16 px-10"
                >
                  <Plus className="h-7 w-7" />
                  Add Your First Stock
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {watchlist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-6 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-card/80 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/stock/${item.ticker}`)}
                  >
                    <div className="flex-1">
                      <p className="font-black text-2xl text-foreground group-hover:text-primary transition-colors">{item.ticker}</p>
                      <p className="text-base text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.alertOnBuy && (
                        <Badge className="text-sm bg-primary/20 text-primary border-2 border-primary font-bold">
                          Buy Alerts
                        </Badge>
                      )}
                      {item.alertOnSell && (
                        <Badge className="text-sm bg-red-500/20 text-red-400 border-2 border-red-500/50 font-bold">
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
      </div>

      {/* Add Stock Modal */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="max-w-2xl border-2 border-dashed border-primary bg-card">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">Add Stock to Watchlist</DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              Search for a stock by ticker symbol or company name to add it to your watchlist and receive AI-powered trading signals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search by ticker (e.g., AAPL) or company name..."
                className="pl-12 h-14 bg-input border-2 border-primary/30 text-lg font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchQuery && searchQueryTrpc.isLoading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Searching for stocks...</p>
              </div>
            )}

            {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <p className="text-base text-muted-foreground px-2 font-bold">
                  Found {searchQueryTrpc.data.length} result{searchQueryTrpc.data.length !== 1 ? 's' : ''}
                </p>
                {searchQueryTrpc.data.map(stock => {
                  const isAlreadyAdded = watchlist.some(w => w.ticker === stock.ticker);
                  return (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-5 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-card/80 transition-all"
                    >
                      <div className="flex-1">
                        <p className="font-black text-foreground text-xl">{stock.ticker}</p>
                        <p className="text-base text-muted-foreground">{stock.name}</p>
                      </div>
                      <Button
                        onClick={() => handleAddStockToWatchlist(stock.id)}
                        disabled={isAlreadyAdded || addToWatchlistMutation.isPending}
                        className={`font-black text-lg h-12 px-8 gap-2 ${
                          isAlreadyAdded 
                            ? 'bg-muted text-muted-foreground hover:bg-muted' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Added
                          </>
                        ) : addToWatchlistMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground text-lg">No stocks found matching "{searchQuery}"</p>
                <p className="text-base text-muted-foreground">Try searching with a different ticker or company name</p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-16 space-y-4">
                <Search className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                <div>
                  <p className="text-foreground font-bold text-lg mb-2">Start typing to search</p>
                  <p className="text-base text-muted-foreground">Enter a stock ticker (AAPL, MSFT, GOOGL) or company name</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
