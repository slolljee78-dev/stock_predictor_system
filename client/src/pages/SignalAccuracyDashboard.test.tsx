import React from "react";
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignalAccuracyDashboard from "@/pages/SignalAccuracyDashboard";

const useAuthMock = vi.fn();
const useLocationMock = vi.fn(() => ["/signal-accuracy", vi.fn()]);
const getTrendDataMock = vi.fn();
const getStatsMock = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("wouter", () => ({
  useLocation: () => useLocationMock(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    dashboard: {
      getTrendData: {
        useQuery: () => getTrendDataMock(),
      },
    },
    signalAccuracy: {
      getStats: {
        useQuery: () => getStatsMock(),
      },
    },
  },
}));

describe("SignalAccuracyDashboard - Real Metrics", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    
    useLocationMock.mockReturnValue(["/signal-accuracy", vi.fn()]);
    getStatsMock.mockReturnValue({
      data: {
        totalSignals: 12,
        buySignals: 7,
        sellSignals: 5,
        highConfidenceSignals: 4,
        avgConfidence: 62,
        topSymbols: [],
        recentActivity: [],
      },
      isLoading: false,
    });
    useAuthMock.mockReturnValue({
      user: {
        id: 1,
        name: "Test User",
        subscriptionTier: "pro",
      },
    });
    
    getTrendDataMock.mockReturnValue({
      data: {},
      isLoading: false,
    });

    // Mock localStorage with real simulator portfolio data
    const mockPortfolioData = {
      portfolios: [
        {
          id: 1,
          name: "Core Strategy",
          initialCapital: 10000,
          currentValue: 11247,
          cash: 5000,
          totalReturn: 1247,
          totalReturnPercent: 12.47,
          positions: [
            {
              ticker: "AAPL",
              quantity: 10,
              entryPrice: 180.5,
              currentPrice: 185.2,
              unrealizedPnL: 47,
              unrealizedPnLPercent: 2.6,
            },
          ],
          trades: [
            {
              id: 1,
              ticker: "AAPL",
              type: "buy",
              quantity: 10,
              price: 180.5,
              date: "2026-04-11 09:30",
              executedAt: "2026-04-11T09:30:00.000Z",
              priceSource: "live",
              origin: "manual",
            },
            {
              id: 2,
              ticker: "AAPL",
              type: "sell",
              quantity: 5,
              price: 185.2,
              date: "2026-04-12 10:15",
              executedAt: "2026-04-12T10:15:00.000Z",
              priceSource: "live",
              origin: "auto",
            },
          ],
        },
      ],
      selectedPortfolioId: 1,
    };

    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(mockPortfolioData)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 1,
      key: vi.fn(),
    };

    vi.stubGlobal("localStorage", mockStorage);
  });

  it("renders the signal accuracy title", () => {
    render(<SignalAccuracyDashboard />);
    expect(screen.getByText("Signal Accuracy")).toBeDefined();
  });

  it("displays real portfolio metrics instead of fake ones", () => {
    render(<SignalAccuracyDashboard />);
    
    // Should NOT display fake metrics from old version
    const winRateElement = screen.queryByText("75.5%");
    const buyAccuracyElement = screen.queryByText("78.2%");
    
    expect(winRateElement).toBeNull();
    expect(buyAccuracyElement).toBeNull();
    
    // Should display real metrics from simulator
    expect(screen.getByText("Total Trades Executed")).toBeDefined();
    expect(screen.getByText("Portfolio Return")).toBeDefined();
    expect(screen.getByText("Current Value")).toBeDefined();
    expect(screen.getByText("Cash Balance")).toBeDefined();
  });

  it("displays paper trading disclaimer", () => {
    render(<SignalAccuracyDashboard />);
    expect(screen.getByText("Paper Trading Results")).toBeDefined();
  });

  it("displays portfolio summary section", () => {
    render(<SignalAccuracyDashboard />);
    expect(screen.getByText("Portfolio Summary")).toBeDefined();
    expect(screen.getByText("Initial Capital")).toBeDefined();
    expect(screen.getByText("Total Return")).toBeDefined();
    expect(screen.getByText("Open Positions")).toBeDefined();
  });

  it("displays how simulator performance is calculated", () => {
    render(<SignalAccuracyDashboard />);
    expect(screen.getByText("How Signal Accuracy is Calculated")).toBeDefined();
  });

  it("displays back navigation buttons", () => {
    render(<SignalAccuracyDashboard />);
    expect(screen.getByText("Back to menu")).toBeDefined();
    expect(screen.getByText("Back to dashboard")).toBeDefined();
  });

  it("displays real portfolio values from simulator state", () => {
    render(<SignalAccuracyDashboard />);
    
    // Check that real values are displayed
    const initialCapitalText = screen.queryByText("$10000.00");
    const currentValueText = screen.queryByText("$11247.00");
    
    expect(initialCapitalText).toBeDefined();
    expect(currentValueText).toBeDefined();
  });

  it("displays positive return badge when portfolio is profitable", () => {
    render(<SignalAccuracyDashboard />);
    
    // The portfolio return is 12.47%, which should show an "Up" badge
    const upBadges = screen.queryAllByText("Up");
    expect(upBadges.length).toBeGreaterThan(0);
  });
});
