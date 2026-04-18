import { describe, expect, it, vi, afterEach } from "vitest";
import { DASHBOARD_MENU_PATH, scrollRouteToTop } from "./navigation";

describe("navigation helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the dashboard route for Back to menu navigation", () => {
    expect(DASHBOARD_MENU_PATH).toBe("/dashboard");
  });

  it("scrolls to the top-left corner on route changes", () => {
    const scrollToMock = vi.fn();
    vi.stubGlobal("window", { scrollTo: scrollToMock });

    scrollRouteToTop();

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
