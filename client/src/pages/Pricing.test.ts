import { describe, expect, it } from "vitest";

import { PRICING_TIERS } from "./Pricing";

describe("PRICING_TIERS", () => {
  it("labels the Pro plan as a future-access preview without promising checkout", () => {
    const proPlan = PRICING_TIERS.find((tier) => tier.name === "Pro");

    expect(proPlan).toBeDefined();
    expect(proPlan?.bullets.map((bullet) => bullet.name)).toContain("Signal Engine access");
    expect(proPlan?.bullets.map((bullet) => bullet.name)).not.toContain("Exports and API access");
    expect(proPlan?.cta).toBe("Explore the workspace");
  });
});
