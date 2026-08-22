import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const policySource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../client/src/pages/DataAndAccessPolicy.tsx"),
  "utf8",
);

describe("data and access policy", () => {
  it("states the canonical freshness, paper-trading, and launch-preview boundaries", () => {
    expect(policySource).toContain("Product transparency policy");
    expect(policySource).toContain("paper-trade simulated candidates");
    expect(policySource).toContain("do not place broker orders");
    expect(policySource).toContain("launch-preview mode");
    expect(policySource).toContain("not financial advice");
  });
});
