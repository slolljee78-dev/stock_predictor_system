export interface DashboardSignalRecord {
  ticker: string;
  type: "buy" | "sell";
  createdAt: string | number | Date;
  confidenceScore?: number;
}

export interface DailySignalSummary {
  date: string;
  buyCount: number;
  sellCount: number;
}

function toTimestamp(value: string | number | Date): number {
  return new Date(value).getTime();
}

function toDateKey(value: string | number | Date): string {
  return new Date(value).toISOString().split("T")[0];
}

export function getLatestSignalsByTicker(
  signals: DashboardSignalRecord[],
): Record<string, DashboardSignalRecord> {
  return signals.reduce<Record<string, DashboardSignalRecord>>((acc, signal) => {
    const existing = acc[signal.ticker];

    if (!existing || toTimestamp(signal.createdAt) > toTimestamp(existing.createdAt)) {
      acc[signal.ticker] = signal;
    }

    return acc;
  }, {});
}

export function getUniqueActionableCounts(signals: DashboardSignalRecord[]) {
  const latestSignals = Object.values(getLatestSignalsByTicker(signals));

  return {
    buyCount: latestSignals.filter((signal) => signal.type === "buy").length,
    sellCount: latestSignals.filter((signal) => signal.type === "sell").length,
  };
}

export function getDailyStockSignalSummary(
  signals: DashboardSignalRecord[],
  days = 7,
): DailySignalSummary[] {
  const summaryMap = new Map<string, { buyTickers: Set<string>; sellTickers: Set<string> }>();

  for (let i = 0; i < days; i += 1) {
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split("T")[0];
    summaryMap.set(dateKey, { buyTickers: new Set(), sellTickers: new Set() });
  }

  signals.forEach((signal) => {
    const dateKey = toDateKey(signal.createdAt);
    const entry = summaryMap.get(dateKey);

    if (!entry) {
      return;
    }

    if (signal.type === "buy") {
      entry.buyTickers.add(signal.ticker);
      return;
    }

    entry.sellTickers.add(signal.ticker);
  });

  return Array.from(summaryMap.entries()).map(([date, counts]) => ({
    date,
    buyCount: counts.buyTickers.size,
    sellCount: counts.sellTickers.size,
  }));
}
