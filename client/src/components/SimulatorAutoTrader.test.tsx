// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SimulatorAutoTrader } from "./SimulatorAutoTrader";

const useLocationMock = vi.fn(() => ["/dashboard", vi.fn()]);
const getAutoTradingUniverseUseQueryMock = vi.fn(() => ({ data: [], isLoading: false }));
const runAutoTradingRoundUseMutationMock = vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false }));

vi.mock("wouter", () => ({
  useLocation: () => useLocationMock(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    simulator: {
      getAutoTradingUniverse: { useQuery: () => getAutoTradingUniverseUseQueryMock() },
      runAutoTradingRound: { useMutation: () => runAutoTradingRoundUseMutationMock() },
    },
  },
}));

describe("SimulatorAutoTrader disclosure", () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue(["/dashboard", vi.fn()]);
    getAutoTradingUniverseUseQueryMock.mockReturnValue({ data: [], isLoading: false });
    runAutoTradingRoundUseMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
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
        accessUser={{ role: "user", subscriptionTier: "pro" }}
        onApplyTrades={() => undefined}
      />,
    );

    expect(screen.getByText(/automated rounds only continue while this dashboard tab stays open/i)).toBeTruthy();
    expect(screen.getByText(/auto mode currently runs in the open browser tab only/i)).toBeTruthy();
    expect(screen.getByText(/background mobile tabs may pause these browser timers/i)).toBeTruthy();
  });
});
