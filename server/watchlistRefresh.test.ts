import { describe, expect, it } from "vitest";
import {
  getWatchlistRefreshLabel,
  isWatchlistRefreshing,
} from "../client/src/lib/watchlistRefresh";

describe("watchlist refresh helpers", () => {
  it("returns false when no watchlist queries are fetching", () => {
    expect(isWatchlistRefreshing([false, false, false])).toBe(false);
  });

  it("returns true when any watchlist query is fetching", () => {
    expect(isWatchlistRefreshing([false, true, false])).toBe(true);
  });

  it("uses the correct button label for idle and refreshing states", () => {
    expect(getWatchlistRefreshLabel(false)).toBe("Refresh");
    expect(getWatchlistRefreshLabel(true)).toBe("Refreshing");
  });
});
