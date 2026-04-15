import DashboardLayout from "@/components/DashboardLayout";
import MarketOverview from "@/components/MarketOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

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

  const watchlist = watchlistQuery.data || [];
  const signals = signalsQuery.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Stock Analysis Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor Trading 212 stocks with AI-powered signals and technical analysis
          </p>
        </div>

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

        {signals.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Active Trading Signals
              </CardTitle>
              <CardDescription>Latest AI-generated buy/sell recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signals.map(signal => (
                  <div
                    key={signal.signalId}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">{signal.ticker}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(signal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant={signal.type === 'buy' ? 'default' : 'destructive'}
                          className="mb-1"
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

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Watchlist</CardTitle>
                <CardDescription>Tracked stocks and ETFs</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const element = document.querySelector('input[placeholder*="Search stocks"]') as HTMLInputElement;
                  if (element) {
                    element.focus();
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">No stocks in your watchlist yet</p>
                <Button
                  onClick={() => {
                    const element = document.querySelector('input[placeholder*="Search stocks"]') as HTMLInputElement;
                    if (element) {
                      element.focus();
                      element.value = 'AAPL';
                      element.dispatchEvent(new Event('input', { bubbles: true }));
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Stock
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/stock/${item.ticker}`)}
                  >
                    <div>
                      <p className="font-semibold">{item.ticker}</p>
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
    </DashboardLayout>
  );
}
