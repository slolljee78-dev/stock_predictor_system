import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(
  new URL("../client/src/pages/Home.tsx", import.meta.url),
  "utf8",
);

describe("public homepage claims", () => {
  it("does not publish unverified testimonials, refund promises, or placeholder support details", () => {
    expect(homeSource).not.toContain("James M.");
    expect(homeSource).not.toContain("Sarah K.");
    expect(homeSource).not.toContain("Michael T.");
    expect(homeSource).not.toContain("30-day money-back guarantee");
    expect(homeSource).not.toContain("support@stockpredictor.com");
    expect(homeSource).not.toContain("XXXX XXXX");
  });

  it("describes automated runs as simulated paper trading", () => {
    expect(homeSource).toContain("paper-trade");
    expect(homeSource).toContain("simulated results");
  });
});
