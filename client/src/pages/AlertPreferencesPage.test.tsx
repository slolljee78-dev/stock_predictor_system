// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AlertPreferencesPage from "@/pages/AlertPreferencesPage";

const useAuthMock = vi.fn();
const useAdminViewModeMock = vi.fn();
const useLocationMock = vi.fn(() => ["/alert-preferences", vi.fn()]);

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/lib/adminViewMode", () => ({
  useAdminViewMode: () => useAdminViewModeMock(),
}));

vi.mock("wouter", () => ({
  useLocation: () => useLocationMock(),
}));

describe("AlertPreferencesPage admin test mode", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    useLocationMock.mockReturnValue(["/alert-preferences", vi.fn()]);
    useAuthMock.mockReturnValue({
      user: {
        role: "admin",
        subscriptionTier: "free",
        subscriptionStatus: "inactive",
      },
    });
    useAdminViewModeMock.mockReturnValue({
      showAdminViewModeToggle: true,
      viewMode: "premium",
      setViewMode: vi.fn(),
      description: "Premium admin view is active in this browser.",
    });
  });

  it("shows the settings-level admin test mode switch for admins", () => {
    render(<AlertPreferencesPage />);

    expect(screen.getAllByText("Admin test mode").length).toBeGreaterThan(0);
    expect(screen.getByText(/settings-level control changes the premium access view/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /premium view/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /free-plan view/i })).toBeTruthy();
  });

  it("hides the settings-level admin switch for non-admin users", () => {
    useAuthMock.mockReturnValue({
      user: {
        role: "user",
        subscriptionTier: "free",
        subscriptionStatus: "inactive",
      },
    });
    useAdminViewModeMock.mockReturnValue({
      showAdminViewModeToggle: false,
      viewMode: "premium",
      setViewMode: vi.fn(),
      description: "",
    });

    render(<AlertPreferencesPage />);

    expect(screen.queryByText("Admin test mode")).toBeNull();
    expect(screen.queryByRole("button", { name: /free-plan view/i })).toBeNull();
  });
});
