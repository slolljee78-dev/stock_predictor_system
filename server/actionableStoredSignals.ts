export interface StoredSignalWithPreferences {
  type: "buy" | "sell" | "hold";
  confidenceScore: number;
  minConfidenceThreshold?: number | null;
  alertOnBuy?: number | boolean | null;
  alertOnSell?: number | boolean | null;
}

export const DEFAULT_STORED_SIGNAL_CONFIDENCE_THRESHOLD = 25;

export function isStoredSignalActionable(signal: StoredSignalWithPreferences): boolean {
  const threshold = typeof signal.minConfidenceThreshold === "number"
    ? signal.minConfidenceThreshold
    : DEFAULT_STORED_SIGNAL_CONFIDENCE_THRESHOLD;

  if (signal.confidenceScore < threshold) {
    return false;
  }

  if (signal.type === "buy") {
    return Boolean(signal.alertOnBuy ?? true);
  }

  if (signal.type === "sell") {
    return Boolean(signal.alertOnSell ?? true);
  }

  return false;
}
