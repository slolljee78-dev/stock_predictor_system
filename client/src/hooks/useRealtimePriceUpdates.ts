/**
 * Real-time Price Updates Hook
 * Provides configurable polling for live price updates with auto-refresh during active trading
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { trpc } from "@/lib/trpc";

export interface PriceUpdateOptions {
  /** Polling interval in milliseconds (default: 15000 = 15 seconds) */
  pollInterval?: number;
  /** Enable auto-refresh during active trading (default: true) */
  enableAutoRefresh?: boolean;
  /** Callback when price updates */
  onPriceUpdate?: (price: number, timestamp: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface PriceUpdateState {
  price: number | null;
  timestamp: string | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdateTime: number | null;
  isStale: boolean;
}

/**
 * Hook for real-time price updates with configurable polling
 * @param ticker - Stock ticker symbol
 * @param options - Configuration options for polling behavior
 * @returns Current price state and update information
 */
export function useRealtimePriceUpdates(ticker: string, options: PriceUpdateOptions = {}) {
  const {
    pollInterval = 15000, // 15 seconds default
    enableAutoRefresh = true,
    onPriceUpdate,
    onError,
  } = options;

  const [state, setState] = useState<PriceUpdateState>({
    price: null,
    timestamp: null,
    isLoading: false,
    error: null,
    lastUpdateTime: null,
    isStale: true,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const normalizedTicker = ticker.trim().toUpperCase();

  // Use tRPC query for price fetching
  const livePriceQuery = trpc.liveMarket.getPrice.useQuery(
    { ticker: normalizedTicker },
    {
      enabled: normalizedTicker.length > 0 && enableAutoRefresh,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: pollInterval * 0.75, // Consider stale after 75% of poll interval
    }
  );

  // Manual refetch function for on-demand updates
  const refetchPrice = useCallback(async () => {
    if (!normalizedTicker) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await livePriceQuery.refetch();
      if (result.data) {
        const priceData = result.data;
        if (typeof priceData === "object" && priceData !== null && "price" in priceData) {
          const price = (priceData as any).price;
          const timestamp = (priceData as any).timestamp || new Date().toISOString();
          const now = Date.now();

          setState((prev) => ({
            ...prev,
            price,
            timestamp,
            isLoading: false,
            error: null,
            lastUpdateTime: now,
            isStale: false,
          }));

          lastUpdateRef.current = now;
          onPriceUpdate?.(price, timestamp);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({ ...prev, isLoading: false, error: err }));
      onError?.(err);
    }
  }, [normalizedTicker, livePriceQuery, onPriceUpdate, onError]);

  // Update state when query data changes
  useEffect(() => {
    if (livePriceQuery.data) {
      const priceData = livePriceQuery.data;
      if (typeof priceData === "object" && priceData !== null && "price" in priceData) {
        const price = (priceData as any).price;
        const timestamp = (priceData as any).timestamp || new Date().toISOString();
        const now = Date.now();

        setState((prev) => ({
          ...prev,
          price,
          timestamp,
          isLoading: livePriceQuery.isLoading,
          error: null,
          lastUpdateTime: now,
          isStale: false,
        }));

        lastUpdateRef.current = now;
        onPriceUpdate?.(price, timestamp);
      }
    }

    if (livePriceQuery.error) {
      const error = livePriceQuery.error instanceof Error ? livePriceQuery.error : new Error(String(livePriceQuery.error));
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
      onError?.(error);
    }
  }, [livePriceQuery.data, livePriceQuery.error, livePriceQuery.isLoading, onPriceUpdate, onError]);

  // Set up polling interval
  useEffect(() => {
    if (!enableAutoRefresh || !normalizedTicker) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    refetchPrice();

    // Set up polling
    pollIntervalRef.current = setInterval(() => {
      refetchPrice();
    }, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [normalizedTicker, pollInterval, enableAutoRefresh, refetchPrice]);

  // Mark as stale after poll interval without updates
  useEffect(() => {
    if (!state.lastUpdateTime) return;

    const staleTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, isStale: true }));
    }, pollInterval * 1.5);

    return () => clearTimeout(staleTimer);
  }, [state.lastUpdateTime, pollInterval]);

  // Get time since last update in seconds
  const getTimeSinceUpdate = useCallback(() => {
    if (!state.lastUpdateTime) return null;
    return Math.floor((Date.now() - state.lastUpdateTime) / 1000);
  }, [state.lastUpdateTime]);

  // Format timestamp for display
  const getFormattedTimestamp = useCallback(() => {
    if (!state.timestamp) return null;
    const date = new Date(state.timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }, [state.timestamp]);

  return {
    ...state,
    refetchPrice,
    getTimeSinceUpdate,
    getFormattedTimestamp,
    isAutoRefreshEnabled: enableAutoRefresh,
    pollInterval,
  };
}

/**
 * Hook for ticker validation with support checking
 * @param ticker - Stock ticker symbol
 * @returns Validation result and support information
 */
export function useTickerValidation(ticker: string) {
  const normalizedTicker = ticker.trim().toUpperCase();

  const validationQuery = trpc.liveMarket.validateTicker.useQuery(
    { ticker: normalizedTicker },
    {
      enabled: normalizedTicker.length > 0,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  const suggestionsQuery = trpc.liveMarket.getTickerSuggestions.useQuery(
    { ticker: normalizedTicker },
    {
      enabled: normalizedTicker.length > 0 && !validationQuery.data?.isSupported,
      retry: false,
    }
  );

  return {
    validation: validationQuery.data,
    isValidating: validationQuery.isLoading,
    validationError: validationQuery.error,
    suggestions: suggestionsQuery.data || [],
    isSuggestionsLoading: suggestionsQuery.isLoading,
  };
}
