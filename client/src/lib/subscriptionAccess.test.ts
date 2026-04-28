import { describe, expect, it } from "vitest";

import {
  canUseAutoTrading,
  canViewPremiumSignalDetails,
  getAutoTradingUpgradeMessage,
  getSignalUpgradeMessage,
  hasActivePaidPlan,
} from "./subscriptionAccess";

describe("client subscription access", () => {
  it("treats free inactive users as locked", () => {
    const user = { subscriptionTier: "free", subscriptionStatus: "inactive" };

    expect(hasActivePaidPlan(user)).toBe(false);
    expect(canViewPremiumSignalDetails(user)).toBe(false);
    expect(canUseAutoTrading(user)).toBe(false);
    expect(getSignalUpgradeMessage(user)).toContain("Upgrade");
    expect(getAutoTradingUpgradeMessage(user)).toContain("Upgrade");
  });

  it("allows active paid subscribers to use premium features", () => {
    const user = { subscriptionTier: "PRO", subscriptionStatus: "active" };

    expect(hasActivePaidPlan(user)).toBe(true);
    expect(canViewPremiumSignalDetails(user)).toBe(true);
    expect(canUseAutoTrading(user)).toBe(true);
    expect(getSignalUpgradeMessage(user)).toContain("active on your account");
    expect(getAutoTradingUpgradeMessage(user)).toContain("available on your account");
  });

  it("normalizes missing values to a locked state", () => {
    expect(hasActivePaidPlan(null)).toBe(false);
    expect(hasActivePaidPlan({})).toBe(false);
    expect(canViewPremiumSignalDetails(undefined)).toBe(false);
    expect(canUseAutoTrading(undefined)).toBe(false);
  });
});
