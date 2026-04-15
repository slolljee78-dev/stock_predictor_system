import DashboardLayout from "@/components/DashboardLayout";
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
        <div className="space-y-2">
          <h1 className="text-5xl font-black">Dashboard</h1>
          <p className="text-lg text-slate-400">Monitor and manage your stock watchlist with AI-powered signals</p>
        </div>

        {/* Active Signals Section */}
        {signals.length > 0 && (
          <Card className="border-slate-700/50 bg-slate-800/50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Active Trading Signals
              </CardTitle>
              <CardDescription className="text-base">Latest AI-generated buy/sell recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signals.map(signal => (
                  <div
                    key={signal.signalId}
                    className="flex items-center justify-between p-5 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/stock/${signal.ticker}`)}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{signal.ticker}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(signal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <Badge 
                          variant={signal.type === 'buy' ? 'default' : 'destructive'}
                          className={`text-sm font-bold px-4 py-2 ${signal.type === 'buy' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}
                        >
                          {signal.type === 'buy' ? '📈 BUY' : '📉 SELL'}
                        </Badge>
                        <p className="text-sm text-slate-400 mt-2">{signal.confidenceScore}% confidence</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Section */}
        <Card className="border-slate-700/50 bg-slate-800/50">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Watchlist</CardTitle>
                <CardDescription className="text-base">{watchlist.length} stocks tracked</CardDescription>
              </div>
              <Button 
                onClick={handleOpenModal}
                className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-base h-12 px-6"
              >
                <Plus className="h-5 w-5" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 bg-slate-700/30 rounded-full">
                    <Search className="h-12 w-12 text-slate-500" />
                  </div>
                </div>
                <div>
                  <p className="text-lg text-slate-300 font-semibold mb-2">No stocks in your watchlist yet</p>
                  <p className="text-slate-400 mb-8">Add your first stock to start receiving AI-powered trading signals</p>
                </div>
                <Button 
                  onClick={handleOpenModal}
                  size="lg" 
                  className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg h-14 px-8"
                >
                  <Plus className="h-6 w-6" />
                  Add Your First Stock
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-5 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/stock/${item.ticker}`)}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{item.ticker}</p>
                      <p className="text-sm text-slate-400">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.alertOnBuy && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                          Buy Alerts
                        </Badge>
                      )}
                      {item.alertOnSell && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-300 border-red-500/30">
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
        <DialogContent className="max-w-2xl border-slate-700/50 bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add Stock to Watchlist</DialogTitle>
            <DialogDescription className="text-base text-slate-400">
              Search for a stock by ticker symbol or company name to add it to your watchlist and receive AI-powered trading signals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                autoFocus
                placeholder="Search by ticker (e.g., AAPL) or company name..."
                className="pl-12 h-12 bg-slate-700/50 border-slate-600 text-base"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchQuery && searchQueryTrpc.isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-slate-400">Searching for stocks...</p>
              </div>
            )}

            {searchQuery && searchQueryTrpc.data && searchQueryTrpc.data.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <p className="text-sm text-slate-400 px-2 font-semibold">
                  Found {searchQueryTrpc.data.length} result{searchQueryTrpc.data.length !== 1 ? 's' : ''}
                </p>
                {searchQueryTrpc.data.map(stock => {
                  const isAlreadyAdded = watchlist.some(w => w.ticker === stock.ticker);
                  return (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">{stock.ticker}</p>
                        <p className="text-sm text-slate-400">{stock.name}</p>
                      </div>
                      <Button
                        onClick={() => handleAddStockToWatchlist(stock.id)}
                        disabled={isAlreadyAdded || addToWatchlistMutation.isPending}
                        className={`font-bold text-base h-10 px-6 gap-2 ${
                          isAlreadyAdded 
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-700' 
                            : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Added
                          </>
                        ) : addToWatchlistMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
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
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-500 mx-auto" />
                <p className="text-slate-400">No stocks found matching "{searchQuery}"</p>
                <p className="text-sm text-slate-500">Try searching with a different ticker or company name</p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12 space-y-4">
                <Search className="h-12 w-12 text-slate-500 mx-auto" />
                <div>
                  <p className="text-slate-300 font-semibold mb-2">Start typing to search</p>
                  <p className="text-sm text-slate-500">Enter a stock ticker (AAPL, MSFT, GOOGL) or company name</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
