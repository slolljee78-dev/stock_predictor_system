type StoredSignal = {
  ticker: string;
  type: "buy" | "sell";
};

type LiveWatchlistStatus = {
  ticker: string;
  state:
    | "buy"
    | "sell"
    | "hold"
    | "low_confidence"
    | "no_active_setup"
    | "data_unavailable";
  badge: string;
  detail: string;
};

export function getActionableWatchlistCounts(statuses: LiveWatchlistStatus[]) {
  return statuses.reduce(
    (acc, status) => {
      if (status.state === "buy") acc.buyCount += 1;
      if (status.state === "sell") acc.sellCount += 1;
      return acc;
    },
    { buyCount: 0, sellCount: 0 },
  );
}

export function getLiveSignalCoverage(statuses: LiveWatchlistStatus[], totalWatchlistCount: number) {
  if (!totalWatchlistCount) return 0;

  const actionableCount = statuses.filter(
    (status) => status.state === "buy" || status.state === "sell",
  ).length;

  return Math.min(100, Math.round((actionableCount / totalWatchlistCount) * 100));
}

export function getResolvedWatchlistPresentation(
  ticker: string,
  liveStatus?: LiveWatchlistStatus,
  storedSignal?: StoredSignal,
) {
  if (liveStatus) {
    return {
      ticker,
      statusLabel: liveStatus.badge,
      statusDetail: liveStatus.detail,
      statusTone: liveStatus.state,
      source: "live" as const,
    };
  }

  if (storedSignal) {
    return {
      ticker,
      statusLabel: storedSignal.type === "buy" ? "Buy" : "Sell",
      statusDetail: `This stock currently has an active ${storedSignal.type} setup.`,
      statusTone: storedSignal.type,
      source: "stored" as const,
    };
  }

  return {
    ticker,
    statusLabel: "No active setup",
    statusDetail: "We are still monitoring this stock for a stronger setup.",
    statusTone: "no_active_setup" as const,
    source: "empty" as const,
  };
}
