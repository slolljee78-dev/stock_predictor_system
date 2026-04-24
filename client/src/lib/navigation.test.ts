import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_MENU_PATH,
  consumeDashboardMenuRequest,
  navigateToDashboardMenu,
  requestDashboardMenu,
  scrollRouteToTop,
} from "./navigation";

describe("navigation helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("uses the dashboard route for Back to menu navigation", () => {
    expect(DASHBOARD_MENU_PATH).toBe("/dashboard");
  });

  it("stores and consumes the dashboard menu intent once", () => {
    requestDashboardMenu();

    expect(consumeDashboardMenuRequest()).toBe(true);
    expect(consumeDashboardMenuRequest()).toBe(false);
  });

  it("navigates to the dashboard route and primes the menu intent", () => {
    const navigate = vi.fn();

    navigateToDashboardMenu(navigate);

    expect(navigate).toHaveBeenCalledWith("/dashboard");
    expect(consumeDashboardMenuRequest()).toBe(true);
  });

  it("scrolls to the top-left corner on route changes", () => {
    const scrollToMock = vi.fn();
    vi.stubGlobal("window", { scrollTo: scrollToMock });

    scrollRouteToTop();

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
