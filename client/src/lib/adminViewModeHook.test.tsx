// @vitest-environment jsdom
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useAdminViewMode } from "@/lib/adminViewMode";
import type { SubscriptionAwareUser } from "@/lib/subscriptionAccess";

const adminUser: SubscriptionAwareUser = {
  role: "admin",
  subscriptionTier: "free",
  subscriptionStatus: "inactive",
};

const paidUser: SubscriptionAwareUser = {
  role: "user",
  subscriptionTier: "pro",
  subscriptionStatus: "active",
};

afterEach(() => {
  window.localStorage.clear();
});

describe("useAdminViewMode", () => {
  it("clears stored admin testing mode and hides admin controls for non-admin users", async () => {
    window.localStorage.setItem("stock-predictor-admin-view-mode", "free");

    const { result } = renderHook(() => useAdminViewMode(paidUser));

    await waitFor(() => {
      expect(result.current.viewMode).toBe("premium");
    });

    expect(result.current.showAdminViewModeToggle).toBe(false);
    expect(result.current.description).toBe("");
    expect(result.current.effectiveUser).toEqual(paidUser);
    expect(window.localStorage.getItem("stock-predictor-admin-view-mode")).toBeNull();
  });

  it("restores the stored admin testing mode for admin users", async () => {
    window.localStorage.setItem("stock-predictor-admin-view-mode", "free");

    const { result } = renderHook(() => useAdminViewMode(adminUser));

    await waitFor(() => {
      expect(result.current.viewMode).toBe("free");
    });

    expect(result.current.showAdminViewModeToggle).toBe(true);
    expect(result.current.description).toContain("Free-plan preview mode");
  });
});
