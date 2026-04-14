import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface PriceDisplayProps {
  ticker: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PriceDisplay({
  ticker,
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
}: PriceDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live price data
  const priceQuery = trpc.liveMarket.getPrice.useQuery(
    { ticker },
    {
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: refreshInterval - 1000,
    }
  );

  const price = priceQuery.data;
  const isLoading = priceQuery.isLoading;
  const isError = priceQuery.isError;

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await priceQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isError || (price && "error" in price)) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-4">
          <p className="text-sm text-destructive">Unable to fetch live price data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !price) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = price.changePercent >= 0;
  const changeColor = isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const bgColor = isPositive ? "bg-green-500/10" : "bg-red-500/10";
  const borderColor = isPositive ? "border-green-500/30" : "border-red-500/30";

  return (
    <Card className={`${bgColor} border-2 ${borderColor}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Current Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <p className="text-4xl font-bold">
                £{typeof price.price === "number" ? price.price.toFixed(2) : "N/A"}
              </p>
            </div>

            {/* Change Indicator */}
            <div className={`flex items-center gap-2 ${changeColor}`}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {isPositive ? "+" : ""}
                  {typeof price.change === "number" ? price.change.toFixed(2) : "N/A"}
                </p>
                <p className="text-sm font-semibold">
                  {isPositive ? "+" : ""}
                  {typeof price.changePercent === "number" ? price.changePercent.toFixed(2) : "N/A"}%
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-sm font-semibold">
                {price.volume
                  ? `${(price.volume / 1e6).toFixed(1)}M`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-xs font-semibold">
                {price.timestamp
                  ? new Date(price.timestamp).toLocaleTimeString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || priceQuery.isFetching}
            className="w-full mt-2"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Price"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
