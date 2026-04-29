import { describe, expect, it } from "vitest";

import {
  getAdminViewModeDescription,
  resolveAccessUserForAdminViewMode,
} from "@/lib/adminViewMode";
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

describe("resolveAccessUserForAdminViewMode", () => {
  it("keeps admins fully unlocked in premium view", () => {
    expect(resolveAccessUserForAdminViewMode(adminUser, "premium")).toEqual(adminUser);
  });

  it("simulates a free-plan user when an admin selects free view", () => {
    expect(resolveAccessUserForAdminViewMode(adminUser, "free")).toEqual({
      ...adminUser,
      role: "user",
      subscriptionTier: "free",
      subscriptionStatus: "inactive",
    });
  });

  it("does not alter non-admin users", () => {
    expect(resolveAccessUserForAdminViewMode(paidUser, "free")).toEqual(paidUser);
    expect(resolveAccessUserForAdminViewMode(paidUser, "premium")).toEqual(paidUser);
  });

  it("passes through missing users safely", () => {
    expect(resolveAccessUserForAdminViewMode(null, "free")).toBeNull();
    expect(resolveAccessUserForAdminViewMode(undefined, "premium")).toBeUndefined();
  });
});

describe("getAdminViewModeDescription", () => {
  it("returns distinct descriptions for premium and free admin testing modes", () => {
    expect(getAdminViewModeDescription("premium")).toContain("Premium admin view");
    expect(getAdminViewModeDescription("free")).toContain("Free-plan preview mode");
  });
});
