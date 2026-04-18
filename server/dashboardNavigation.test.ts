/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import {
  buildSignalDashboardPath,
  buildStockDetailPath,
  getSignalFilterFromSearch,
  scrollToDashboardSection,
} from "../client/src/lib/dashboardNavigation";

describe("dashboard navigation helpers", () => {
  it("builds the correct signals dashboard path for buy and sell cards", () => {
    expect(buildSignalDashboardPath("buy")).toBe("/signals?type=buy");
    expect(buildSignalDashboardPath("sell")).toBe("/signals?type=sell");
  });

  it("builds the correct stock detail path for watchlist rows", () => {
    expect(buildStockDetailPath("AAPL")).toBe("/stock/AAPL");
    expect(buildStockDetailPath("MSFT")).toBe("/stock/MSFT");
  });

  it("parses a valid filter from the search string and falls back to all", () => {
    expect(getSignalFilterFromSearch("?type=buy")).toBe("buy");
    expect(getSignalFilterFromSearch("?type=sell")).toBe("sell");
    expect(getSignalFilterFromSearch("?type=hold")).toBe("all");
    expect(getSignalFilterFromSearch("")).toBe("all");
  });

  it("scrolls to an existing dashboard section when present", () => {
    document.body.innerHTML = '<section data-section="watchlist"></section>';
    const target = document.querySelector('[data-section="watchlist"]') as HTMLElement;
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;

    const didScroll = scrollToDashboardSection("watchlist");

    expect(didScroll).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("returns false when the requested dashboard section does not exist", () => {
    document.body.innerHTML = "";

    expect(scrollToDashboardSection("watchlist")).toBe(false);
  });
});
