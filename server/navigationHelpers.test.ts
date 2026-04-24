import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_MENU_PATH,
  consumeDashboardMenuRequest,
  navigateToDashboardMenu,
  requestDashboardMenu,
  scrollRouteToTop,
} from "../client/src/lib/navigation";

describe("navigation helpers", () => {
  let sessionStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    const store = new Map<string, string>();
    sessionStorageMock = {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(() => {
        store.clear();
      }),
    };

    vi.stubGlobal("window", {
      sessionStorage: sessionStorageMock,
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis);
  });

  afterEach(() => {
    sessionStorageMock.clear();
    vi.restoreAllMocks();
  });

  it("keeps Back to menu aligned to the dashboard workspace route", () => {
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

  it("resets scroll position to the top-left corner", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("window", {
      sessionStorage: sessionStorageMock,
      scrollTo,
    } as unknown as Window & typeof globalThis);

    scrollRouteToTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
