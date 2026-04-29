import { describe, expect, it } from "vitest";

import { assertAutoTradingAccess, hasActivePaidPlan } from "./subscriptionAccess";

describe("server subscription access", () => {
  it("rejects auto trading for free users", () => {
    expect(hasActivePaidPlan({ subscriptionTier: "free", subscriptionStatus: "inactive" })).toBe(false);
    expect(() =>
      assertAutoTradingAccess({ subscriptionTier: "free", subscriptionStatus: "inactive" })
    ).toThrow(/paid plans only/i);
  });

  it("allows auto trading for active paid users", () => {
    const user = { subscriptionTier: "STARTER", subscriptionStatus: "active" };

    expect(hasActivePaidPlan(user)).toBe(true);
    expect(() => assertAutoTradingAccess(user)).not.toThrow();
  });

  it("allows admin accounts to bypass premium gating for internal testing", () => {
    const user = { role: "admin", subscriptionTier: "free", subscriptionStatus: "inactive" };

    expect(hasActivePaidPlan(user)).toBe(true);
    expect(() => assertAutoTradingAccess(user)).not.toThrow();
  });
});
