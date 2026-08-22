import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("methodology transparency", () => {
  it("publishes a methodology route with an explicit performance-reporting limit", () => {
    const app = read("client/src/App.tsx");
    const page = read("client/src/pages/Methodology.tsx");
    expect(app).toContain('path="/methodology"');
    expect(page).toContain("Performance-reporting status");
    expect(page).toContain("does not currently publish an independently audited live-trading performance record");
  });

  it("does not manufacture trend or accuracy metrics when the database is unavailable", () => {
    const db = read("server/db.ts");
    expect(db).not.toContain("totalSignals: 247");
    expect(db).not.toContain("Math.floor(Math.random() * 5)");
    expect(db).toContain("Do not publish synthetic aggregate activity as evidence");
  });

  it("includes the methodology page in the public sitemap", () => {
    expect(read("client/public/sitemap.xml")).toContain("https://vortextrade.manus.space/methodology");
  });
});
