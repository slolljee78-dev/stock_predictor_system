import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..", "client", "src");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("shared application states", () => {
  it("provides reusable empty, error, and loading state variants", () => {
    const source = read("components/AppStatePanel.tsx");
    expect(source).toContain('"empty" | "error" | "loading"');
    expect(source).toContain("state-panel-${tone}");
  });

  it("uses the shared state panel for public signal empty and error recovery", () => {
    const source = read("pages/TodaysSignals.tsx");
    expect(source).toContain('import { AppStatePanel }');
    expect(source).toContain('title="No signals yet today"');
    expect(source).toContain('title="Signals are temporarily unavailable"');
  });
});
