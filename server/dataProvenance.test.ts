import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function readClientSource(relativePath: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, "..", "client", "src", relativePath), "utf8");
}

describe("customer-visible data provenance", () => {
  it("labels public signal timing, data limitations, and the policy destination", () => {
    const source = readClientSource("pages/TodaysSignals.tsx");
    expect(source).toContain("Data and scope:");
    expect(source).toContain("recorded price at that time");
    expect(source).toContain('href="/data-and-access"');
  });

  it("labels simulator outcomes as paper trades and distinguishes fallback estimates", () => {
    const source = readClientSource("pages/TradingSimulator.tsx");
    expect(source).toContain("Every trade is simulated and does not place a broker order");
    expect(source).toContain("fallback estimate");
  });
});
