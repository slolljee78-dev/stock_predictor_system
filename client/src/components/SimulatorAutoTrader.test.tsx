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
});
