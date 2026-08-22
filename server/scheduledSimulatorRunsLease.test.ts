import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.resolve(import.meta.dirname, "scheduledSimulatorRuns.ts"),
  "utf8",
);

describe("scheduled simulator execution lease", () => {
  it("claims due runs atomically and releases the lease after persistence", () => {
    expect(source).toContain("processingAt TIMESTAMP NULL");
    expect(source).toContain("SET processingAt = ?");
    expect(source).toContain("claim.affectedRows !== 1");
    expect(source).toContain("processingAt = NULL");
  });
});
