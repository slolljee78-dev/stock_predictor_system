// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ValidationDashboard from "@/pages/ValidationDashboard";

const useLocationMock = vi.fn(() => ["/validation/dashboard", vi.fn()]);

vi.mock("wouter", () => ({
  useLocation: () => useLocationMock(),
}));

vi.mock("@/lib/navigation", () => ({
  DASHBOARD_HOME_PATH: "/dashboard",
  navigateToDashboardMenu: vi.fn(),
}));

vi.mock("@/components/PageTransition", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ValidationDashboard", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    storage.set(
      "stock-predictor-trading-simulator-state",
      JSON.stringify({
        selectedPortfolioId: 2,
        portfolios: [
          {
            id: 2,
            name: "Validation Portfolio",
            initialCapital: 10000,
            currentValue: 11000,
            cash: 6400,
            totalReturn: 1000,
            totalReturnPercent: 10,
            positions: [
              {
                ticker: "AAPL",
                quantity: 10,
                entryPrice: 170,
                currentPrice: 180,
                unrealizedPnL: 100,
                unrealizedPnLPercent: 5.88,
              },
            ],
            trades: [
              {
                id: 1,
                ticker: "AAPL",
                type: "buy",
                quantity: 10,
                price: 170,
                date: "2026-05-08 09:30",
                executedAt: "2026-05-08T09:30:00.000Z",
                priceSource: "live",
                origin: "manual",
              },
              {
                id: 2,
                ticker: "MSFT",
                type: "sell",
                quantity: 5,
                price: 330,
                date: "2026-05-09 10:15",
                executedAt: "2026-05-09T10:15:00.000Z",
                priceSource: "live",
                origin: "auto",
                confidence: 31,
                reasoning: "Momentum faded after resistance rejection.",
              },
            ],
          },
        ],
      }),
    );

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      }),
      clear: vi.fn(() => {
        storage.clear();
      }),
      key: vi.fn(),
      length: 1,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("explains that validation mirrors simulator activity and normalizes the selected portfolio into the £100 challenge", () => {
    render(<ValidationDashboard />);

    expect(screen.getAllByText((_, node) => node?.textContent?.includes("This page does not place trades by itself.") ?? false).length).toBeGreaterThan(0);
    expect(screen.getAllByText("£110.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText((_, node) => node?.textContent?.includes("Portfolio: Validation Portfolio") ?? false).length).toBeGreaterThan(0);
    expect(screen.getByText(/auto activity recorded/i)).toBeTruthy();
    expect(screen.getByText(/latest auto-trade: msft sell/i)).toBeTruthy();
    expect(screen.getByText(/confidence: 31%/i)).toBeTruthy();
  });
});
