/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignalsDashboard from "@/pages/SignalsDashboard";

const useLocationMock = vi.fn(() => ["/signals", vi.fn()]);
const getForUserUseQueryMock = vi.fn();
const refetchMock = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => useLocationMock(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    signals: {
      getForUser: { useQuery: () => getForUserUseQueryMock() },
    },
  },
}));

vi.mock("@/components/SignalDetailsModal", () => ({
  SignalDetailsModal: () => null,
}));

vi.mock("@/lib/navigation", () => ({
  DASHBOARD_HOME_PATH: "/dashboard",
  navigateToDashboardMenu: vi.fn(),
}));

describe("SignalsDashboard ideas cards", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

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
    });

    useLocationMock.mockReturnValue(["/signals", vi.fn()]);
    refetchMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows concrete top buy and sell ideas in the summary cards", () => {
    getForUserUseQueryMock.mockReturnValue({
      data: [
        {
          ticker: "AAPL",
          type: "buy",
          confidenceScore: 61,
          priceAtSignal: 192.34,
          createdAt: new Date("2026-05-07T10:15:00.000Z"),
        },
        {
          ticker: "MSFT",
          type: "buy",
          confidenceScore: 57,
          priceAtSignal: 411.22,
          createdAt: new Date("2026-05-07T09:45:00.000Z"),
        },
        {
          ticker: "NVDA",
          type: "buy",
          confidenceScore: 49,
          priceAtSignal: 884.11,
          createdAt: new Date("2026-05-07T09:30:00.000Z"),
        },
        {
          ticker: "TSLA",
          type: "buy",
          confidenceScore: 28,
          priceAtSignal: 173.56,
          createdAt: new Date("2026-05-07T08:45:00.000Z"),
        },
        {
          ticker: "AMZN",
          type: "sell",
          confidenceScore: 55,
          priceAtSignal: 182.45,
          createdAt: new Date("2026-05-07T09:10:00.000Z"),
        },
        {
          ticker: "META",
          type: "sell",
          confidenceScore: 40,
          priceAtSignal: 501.02,
          createdAt: new Date("2026-05-07T08:20:00.000Z"),
        },
      ],
      isLoading: false,
      refetch: refetchMock,
    });

    render(<SignalsDashboard />);

    const buyIdeasCard = screen.getByTestId("buy-ideas-card");
    const sellIdeasCard = screen.getByTestId("sell-ideas-card");

    expect(within(buyIdeasCard).getByText("Buy Ideas")).toBeTruthy();
    expect(within(buyIdeasCard).getByText("AAPL")).toBeTruthy();
    expect(within(buyIdeasCard).getByText("MSFT")).toBeTruthy();
    expect(within(buyIdeasCard).getByText("NVDA")).toBeTruthy();
    expect(within(buyIdeasCard).queryByText("TSLA")).toBeNull();
    expect(within(buyIdeasCard).getByText("4 total")).toBeTruthy();

    expect(within(sellIdeasCard).getByText("Sell Ideas")).toBeTruthy();
    expect(within(sellIdeasCard).getByText("AMZN")).toBeTruthy();
    expect(within(sellIdeasCard).getByText("META")).toBeTruthy();
    expect(within(sellIdeasCard).getByText("2 total")).toBeTruthy();
  });

  it("shows an explicit empty-state message when no buy or sell ideas are available", () => {
    getForUserUseQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: refetchMock,
    });

    render(<SignalsDashboard />);

    expect(within(screen.getByTestId("buy-ideas-card")).getByText(/no buy ideas match the current filters yet/i)).toBeTruthy();
    expect(within(screen.getByTestId("sell-ideas-card")).getByText(/no sell ideas match the current filters yet/i)).toBeTruthy();
  });
});
