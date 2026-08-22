import { DEFAULT_FILTERS, type SignalFilterOptions } from "@/components/SignalFilters";

export type QuickSignalFilter = "all" | "buy" | "sell" | "high-confidence";

export function getQuickFilterValue(filters: SignalFilterOptions): QuickSignalFilter {
  if (filters.signalType === "buy") {
    return "buy";
  }

  if (filters.signalType === "sell") {
    return "sell";
  }

  if (filters.minConfidence >= 40) {
    return "high-confidence";
  }

  return "all";
}

export function applyQuickFilter(
  current: SignalFilterOptions,
  mode: QuickSignalFilter,
): SignalFilterOptions {
  if (mode === "buy") {
    return { ...current, signalType: "buy" };
  }

  if (mode === "sell") {
    return { ...current, signalType: "sell" };
  }

  if (mode === "high-confidence") {
    return {
      ...current,
      signalType: "all",
      minConfidence: Math.max(current.minConfidence, 40),
    };
  }

  return {
    ...current,
    signalType: "all",
    minConfidence: 0,
  };
}
