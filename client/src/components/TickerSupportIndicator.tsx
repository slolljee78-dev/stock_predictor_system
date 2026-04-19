/**
 * Ticker Support Indicator Component
 * Displays ticker validation status with helpful messaging and suggestions
 */

import React from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTickerValidation } from "@/hooks/useRealtimePriceUpdates";

export interface TickerSupportIndicatorProps {
  ticker: string;
  showDetails?: boolean;
  onUnsupportedTicker?: (ticker: string) => void;
}

export function TickerSupportIndicator({
  ticker,
  showDetails = true,
  onUnsupportedTicker,
}: TickerSupportIndicatorProps) {
  const { validation, isValidating, suggestions } = useTickerValidation(ticker);
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    return null;
  }

  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking ticker support...</span>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  if (validation.isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          {validation.name || normalizedTicker} is supported
          {validation.currency && ` (${validation.currency})`}
        </span>
      </div>
    );
  }

  // Unsupported ticker
  return (
    <div className="space-y-2">
      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              {normalizedTicker} is not supported or not found on Alpha Vantage
            </p>
            {validation.error && <p className="text-sm opacity-90">{validation.error}</p>}

            {showDetails && suggestions && suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">Did you mean:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={`${suggestion.ticker}-${suggestion.exchange}`}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // This would be handled by parent component
                      }}
                    >
                      {suggestion.ticker} ({suggestion.exchange})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showDetails && (
              <div className="mt-3 space-y-1 text-xs opacity-75">
                <p>
                  <HelpCircle className="mb-1 inline h-3 w-3" /> Supported exchanges include US, LSE, TSE, Frankfurt,
                  Euronext, NSE, and ASX
                </p>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {onUnsupportedTicker && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnsupportedTicker(normalizedTicker)}
          className="w-full"
        >
          Try Another Ticker
        </Button>
      )}
    </div>
  );
}

/**
 * Inline ticker support indicator (compact version)
 */
export function TickerSupportBadge({ ticker }: { ticker: string }) {
  const { validation, isValidating } = useTickerValidation(ticker);
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker || isValidating) {
    return null;
  }

  if (!validation) {
    return null;
  }

  if (validation.isSupported) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
        <CheckCircle2 className="h-3 w-3" />
        Supported
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
      <AlertCircle className="h-3 w-3" />
      Not Supported
    </div>
  );
}

/**
 * Price freshness indicator
 */
export interface PriceFreshnessIndicatorProps {
  lastUpdateTime: number | null;
  isStale: boolean;
  isLoading: boolean;
}

export function PriceFreshnessIndicator({
  lastUpdateTime,
  isStale,
  isLoading,
}: PriceFreshnessIndicatorProps) {
  if (!lastUpdateTime) {
    return null;
  }

  const secondsSinceUpdate = Math.floor((Date.now() - lastUpdateTime) / 1000);
  const formattedTime =
    secondsSinceUpdate < 60
      ? `${secondsSinceUpdate}s ago`
      : `${Math.floor(secondsSinceUpdate / 60)}m ago`;

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Updating...</span>
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3 w-3" />
        <span>Last update: {formattedTime}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
      <CheckCircle2 className="h-3 w-3" />
      <span>Updated {formattedTime}</span>
    </div>
  );
}
