import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  Download,
  Filter,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface Signal {
  id: number;
  type: "buy" | "sell";
  confidenceScore: number;
  priceAtSignal: number;
  analysis: string | null;
  status: string;
  createdAt: Date;
  stock: {
    id: number;
    ticker: string;
    name: string;
  };
}

interface RealtimeSignalFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function RealtimeSignalFeed({
  limit = 20,
  autoRefresh = true,
  refreshInterval = 5000,
}: RealtimeSignalFeedProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newSignalCount, setNewSignalCount] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell">("all");
  const [filterConfidence, setFilterConfidence] = useState<number>(0);
  const [searchTicker, setSearchTicker] = useState("");
  const [showNewBadge, setShowNewBadge] = useState(false);

  // Fetch signals
  const signalsQuery = trpc.signals.getActiveSignals.useQuery({
    limit,
    offset: 0,
  });

  // Fetch signals with refetch capability
  const refetchSignals = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await signalsQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [signalsQuery]);

  // Update signals when query data changes
  useEffect(() => {
    if (signalsQuery.data?.signals) {
      const newSignals = signalsQuery.data.signals;
      
      // Track new signals for animation
      if (signals.length > 0 && newSignals.length > signals.length) {
        setNewSignalCount(newSignals.length - signals.length);
        setShowNewBadge(true);
        setTimeout(() => setShowNewBadge(false), 3000);
      }
      
      setSignals(newSignals);
    }
  }, [signalsQuery.data?.signals]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchSignals();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetchSignals]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      // Filter by type
      if (filterType !== "all" && signal.type !== filterType) {
        return false;
      }

      // Filter by confidence
      if (signal.confidenceScore < filterConfidence) {
        return false;
      }

      // Filter by ticker
      if (
        searchTicker &&
        !signal.stock.ticker.toUpperCase().includes(searchTicker.toUpperCase())
      ) {
        return false;
      }

      return true;
    });
  }, [signals, filterType, filterConfidence, searchTicker]);

  // Export signals as CSV
  const handleExportCSV = () => {
    const csv = [
      ["Ticker", "Type", "Confidence", "Price", "Date", "Analysis"],
      ...filteredSignals.map((signal) => [
        signal.stock.ticker,
        signal.type.toUpperCase(),
        `${signal.confidenceScore}%`,
        `$${signal.priceAtSignal.toFixed(2)}`,
        new Date(signal.createdAt).toLocaleString(),
        signal.analysis,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signals-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export signals as JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(filteredSignals, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signals-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterType("all");
    setFilterConfidence(0);
    setSearchTicker("");
  };

  const hasActiveFilters =
    filterType !== "all" || filterConfidence > 0 || searchTicker !== "";

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle>Real-Time Signal Feed</CardTitle>
                <CardDescription>Live trading signals updated every {refreshInterval / 1000}s</CardDescription>
              </div>
            </div>
            {showNewBadge && newSignalCount > 0 && (
              <Badge variant="default" className="animate-pulse">
                +{newSignalCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refetchSignals}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters Section */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
                className="h-6 gap-1 ml-auto"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Signal Type Filter */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Signal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                <SelectItem value="buy">Buy Only</SelectItem>
                <SelectItem value="sell">Sell Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Confidence Filter */}
            <Select
              value={filterConfidence.toString()}
              onValueChange={(value) => setFilterConfidence(parseInt(value))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Min Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Confidence</SelectItem>
                <SelectItem value="50">50%+</SelectItem>
                <SelectItem value="60">60%+</SelectItem>
                <SelectItem value="70">70%+</SelectItem>
                <SelectItem value="80">80%+</SelectItem>
                <SelectItem value="90">90%+</SelectItem>
              </SelectContent>
            </Select>

            {/* Ticker Search */}
            <div className="relative">
              <Input
                placeholder="Search ticker..."
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                className="h-9"
              />
              {searchTicker && (
                <button
                  onClick={() => setSearchTicker("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Prompt for Free Tier Users */}
        {user?.subscriptionTier === "free" && signals.length > 0 && (
          <UpgradePrompt
            type="signal-limit"
            message="You are viewing a limited set of signals. Upgrade to access unlimited trading signals and advanced features."
            onDismiss={() => {}}
          />
        )}

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredSignals.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            disabled={filteredSignals.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </div>

        {/* Signals List */}
        {filteredSignals.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">
              {signals.length === 0 ? "No signals available yet" : "No signals match your filters"}
            </p>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Showing {filteredSignals.length} of {signals.length} signals
            </p>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Signal Icon */}
                    <div className={`p-2 rounded-lg ${signal.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {signal.type === 'buy' ? (
                        <TrendingUp className={`h-5 w-5 text-green-500`} />
                      ) : (
                        <TrendingDown className={`h-5 w-5 text-red-500`} />
                      )}
                    </div>

                    {/* Signal Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">{signal.stock.ticker}</p>
                        <p className="text-xs text-muted-foreground">{signal.stock.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(signal.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Signal Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant={signal.type === 'buy' ? 'default' : 'destructive'}
                        className="mb-2"
                      >
                        {signal.type.toUpperCase()}
                      </Badge>
                      <p className="text-sm font-medium">{signal.confidenceScore}%</p>
                      <p className="text-xs text-muted-foreground">confidence</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/stock/${signal.stock.ticker}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
