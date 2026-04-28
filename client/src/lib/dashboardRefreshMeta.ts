export const DASHBOARD_AUTO_REFRESH_INTERVAL_MS = 60_000;

export function getLatestRefreshTimestamp(timestamps: Array<number | undefined>): number | null {
  const validTimestamps = timestamps.filter(
    (value): value is number => typeof value === "number" && value > 0,
  );

  if (!validTimestamps.length) {
    return null;
  }

  return Math.max(...validTimestamps);
}

export function formatLastUpdated(timestamp: number | null, now = Date.now()): string {
  if (!timestamp) {
    return "Waiting for first live update";
  }

  const elapsedMs = Math.max(0, now - timestamp);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (elapsedSeconds < 5) {
    return "Updated just now";
  }

  if (elapsedSeconds < 60) {
    return `Updated ${elapsedSeconds}s ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `Updated ${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `Updated ${elapsedHours}h ago`;
}

export function shouldEnableAutoRefresh(hasUser: boolean, watchlistCount: number): boolean {
  return hasUser && watchlistCount > 0;
}
