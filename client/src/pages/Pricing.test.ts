import { describe, expect, it } from "vitest";

import { PRICING_TIERS } from "./Pricing";

describe("PRICING_TIERS", () => {
  it("keeps the Pro plan focused on trading features without export/api copy", () => {
    const proPlan = PRICING_TIERS.find((tier) => tier.name === "Pro");

    expect(proPlan).toBeDefined();
    expect(proPlan?.bullets.map((bullet) => bullet.name)).toContain("Auto-trading access");
    expect(proPlan?.bullets.map((bullet) => bullet.name)).not.toContain("Exports and API access");
  });
});
