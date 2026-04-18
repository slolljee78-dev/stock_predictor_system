import { afterEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_MENU_PATH, scrollRouteToTop } from "../client/src/lib/navigation";

describe("navigation helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps Back to menu aligned to the dashboard workspace route", () => {
    expect(DASHBOARD_MENU_PATH).toBe("/dashboard");
  });

  it("resets scroll position to the top-left corner", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("window", { scrollTo } as unknown as Window & typeof globalThis);

    scrollRouteToTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
