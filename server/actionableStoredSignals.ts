export interface StoredSignalWithPreferences {
  type: "buy" | "sell";
  confidenceScore: number;
  minConfidenceThreshold?: number;
  alertOnBuy?: number | boolean;
  alertOnSell?: number | boolean;
}

export function isStoredSignalActionable(signal: StoredSignalWithPreferences): boolean {
  const threshold = typeof signal.minConfidenceThreshold === "number" ? signal.minConfidenceThreshold : 60;

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
