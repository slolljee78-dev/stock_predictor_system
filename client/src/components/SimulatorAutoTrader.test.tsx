// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SimulatorAutoTrader } from "./SimulatorAutoTrader";

const useLocationMock = vi.fn(() => ["/dashboard", vi.fn()]);
const getAutoTradingUniverseUseQueryMock = vi.fn(() => ({ data: [], isLoading: false }));
const runAutoTradingRoundUseMutationMock = vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false }));
const getScheduledAutoTradingRunUseQueryMock = vi.fn(() => ({ data: null, isLoading: false, refetch: vi.fn() }));
const startScheduledAutoTradingRunUseMutationMock = vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false }));
const cancelScheduledAutoTradingRunUseMutationMock = vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false }));

vi.mock("wouter", () => ({
  useLocation: () => useLocationMock(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    simulator: {
      getAutoTradingUniverse: { useQuery: () => getAutoTradingUniverseUseQueryMock() },
      runAutoTradingRound: { useMutation: () => runAutoTradingRoundUseMutationMock() },
      getScheduledAutoTradingRun: { useQuery: () => getScheduledAutoTradingRunUseQueryMock() },
      startScheduledAutoTradingRun: { useMutation: () => startScheduledAutoTradingRunUseMutationMock() },
      cancelScheduledAutoTradingRun: { useMutation: () => cancelScheduledAutoTradingRunUseMutationMock() },
    },
  },
}));

describe("SimulatorAutoTrader disclosure", () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue(["/dashboard", vi.fn()]);
    getAutoTradingUniverseUseQueryMock.mockReturnValue({ data: [], isLoading: false });
    runAutoTradingRoundUseMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    getScheduledAutoTradingRunUseQueryMock.mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
    startScheduledAutoTradingRunUseMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    cancelScheduledAutoTradingRunUseMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("tells paid users that automated rounds continue only while the dashboard tab stays open", () => {
    render(
      <SimulatorAutoTrader
        portfolio={{
          id: 1,
          name: "Test portfolio",
          initialCapital: 10000,
          currentValue: 10000,
          cash: 10000,
          totalReturn: 0,
          totalReturnPercent: 0,
          positions: [],
          trades: [],
        }}
        accessUser={{ role: "user", subscriptionTier: "pro", subscriptionStatus: "active" }}
        onApplyTrades={() => undefined}
      />,
    );

    expect(screen.getByText(/timed auto-trading run/i)).toBeTruthy();
    expect(screen.getByText(/server and let it execute one automated round per day/i)).toBeTruthy();
    expect(screen.getByText(/start timed run/i)).toBeTruthy();
    expect(screen.getByText(/auto mode currently runs in the open browser tab only/i)).toBeTruthy();
    expect(screen.getByText(/background mobile tabs may pause these browser timers/i)).toBeTruthy();
  });

  it("shows an in-progress state while a timed run is active", () => {
    getScheduledAutoTradingRunUseQueryMock.mockReturnValue({
      data: {
        status: "active",
        durationDays: 7,
        startedAt: "2026-05-04T15:55:00.000Z",
        endsAt: "2026-05-11T15:55:00.000Z",
        nextRunAt: "2026-05-05T15:55:00.000Z",
        lastRunAt: "2026-05-04T15:55:00.000Z",
        totalRoundsCompleted: 3,
        totalTradesExecuted: 1,
        lastSummary: "Scheduled simulator found 2 actionable signals and executed 1 virtual trade across 6 scanned stocks (0 buys, 1 sells).",
        roundHistory: [
          {
            runAt: "2026-05-04T15:55:00.000Z",
            scannedCount: 6,
            scannedTickers: ["AAPL", "MSFT", "NVDA", "AMZN", "META", "TSLA"],
            actionableSignalsCount: 2,
            actionableBuySignals: 1,
            actionableSellSignals: 1,
            executedTradesCount: 0,
            buyTrades: 0,
            sellTrades: 0,
            summary: "Scheduled simulator found 2 actionable signals and executed 1 virtual trade across 6 scanned stocks (0 buys, 1 sells).",
          },
        ],
        portfolio: {
          currentValue: 8548.68,
          cash: 4156.49,
          totalReturnPercent: -14.51,
        },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    render(
      <SimulatorAutoTrader
        portfolio={{
          id: 1,
          name: "Test portfolio",
          initialCapital: 10000,
          currentValue: 10000,
          cash: 10000,
          totalReturn: 0,
          totalReturnPercent: 0,
          positions: [],
          trades: [],
        }}
        accessUser={{ role: "user", subscriptionTier: "pro", subscriptionStatus: "active" }}
        onApplyTrades={() => undefined}
      />,
    );

    expect(screen.getByText(/timed run in progress/i)).toBeTruthy();
    expect(screen.getByText(/^in progress$/i)).toBeTruthy();
    expect(screen.getAllByText(/per-round execution log/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/3 rounds completed/i)).toBeTruthy();
    expect(screen.getAllByText(/trades only count when a signal also passes confidence, sizing, and open-position rules/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/a 3-day run now completes three daily passes, not four/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6 scanned/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 buy signals/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 sell signals/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/scanned tickers: aapl, msft, nvda, amzn, meta, tsla/i)).toBeTruthy();
  });
});
