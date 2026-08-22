import { describe, expect, it } from "vitest";
import {
  DASHBOARD_AUTO_REFRESH_INTERVAL_MS,
  formatLastUpdated,
  getLatestRefreshTimestamp,
  shouldEnableAutoRefresh,
} from "./dashboardRefreshMeta";

describe("dashboardRefreshMeta", () => {
  it("returns null when there are no valid refresh timestamps", () => {
    expect(getLatestRefreshTimestamp([undefined, 0])).toBeNull();
  });

  it("returns the newest valid refresh timestamp", () => {
    expect(getLatestRefreshTimestamp([1000, 4500, 3200])).toBe(4500);
  });

  it("formats an empty state before the first live update", () => {
    expect(formatLastUpdated(null, 10_000)).toBe("Waiting for first live update");
  });

  it("formats very recent updates as just now", () => {
    expect(formatLastUpdated(9_998, 10_000)).toBe("Updated just now");
  });

  it("formats second-level recency labels", () => {
    expect(formatLastUpdated(5_000, 18_000)).toBe("Updated 13s ago");
  });

  it("formats minute-level recency labels", () => {
    expect(formatLastUpdated(10_000, 190_000)).toBe("Updated 3m ago");
  });

  it("formats hour-level recency labels", () => {
    expect(formatLastUpdated(10_000, 7_300_000)).toBe("Updated 2h ago");
  });

  it("enables automatic refresh only when a signed-in user has a watchlist", () => {
    expect(shouldEnableAutoRefresh(true, 2)).toBe(true);
    expect(shouldEnableAutoRefresh(true, 0)).toBe(false);
    expect(shouldEnableAutoRefresh(false, 3)).toBe(false);
  });

  it("keeps the auto refresh interval at one minute", () => {
    expect(DASHBOARD_AUTO_REFRESH_INTERVAL_MS).toBe(60_000);
  });
});
