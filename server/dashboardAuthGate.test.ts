/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();
const mutateAsync = vi.fn();

vi.mock("@/const", () => ({
  getLoginUrl: () => "/mock-login",
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/dashboard", setLocation],
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      watchlist: { list: { invalidate: vi.fn() } },
      signals: { getForUser: { invalidate: vi.fn() } },
    }),
    watchlist: {
      list: { useQuery: () => ({ data: [], isLoading: false }) },
      add: { useMutation: () => ({ mutateAsync, isPending: false }) },
    },
    signals: {
      getForUser: { useQuery: () => ({ data: [], isLoading: false }) },
      statuses: { useQuery: () => ({ data: [], isLoading: false }) },
    },
    stocks: {
      search: { useQuery: () => ({ data: [], isLoading: false }) },
    },
    dashboard: {
      getTrendData: { useQuery: () => ({ data: undefined, isLoading: false }) },
      getTrendDataByDay: { useQuery: () => ({ data: [], isLoading: false }) },
    },
  },
}));

describe("Dashboard unauthenticated gate", () => {
  afterEach(() => {
    setLocation.mockReset();
    mutateAsync.mockReset();
  });

  it("shows the premium sign-in gate and sends the secondary action to pricing", async () => {
    const { default: Dashboard } = await import("../client/src/pages/Dashboard.tsx");

    render(React.createElement(Dashboard));

    expect(screen.getByText(/members-only dashboard/i)).not.toBeNull();
    expect(screen.getByRole("link", { name: /sign in to continue/i }).getAttribute("href")).toBe("/mock-login");
    expect(screen.getByText(/watchlist workspace/i)).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /view plans/i }));

    expect(setLocation).toHaveBeenCalledWith("/pricing");
  });
});
