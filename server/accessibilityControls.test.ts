import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function readClientSource(relativePath: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, "..", "client", "src", relativePath), "utf8");
}

describe("high-priority accessible controls", () => {
  it("labels homepage feature-preview selector buttons", () => {
    const source = readClientSource("components/FeatureShowcase.tsx");
    expect(source).toContain('aria-label={`Show ${showcaseScreen.label} preview (${i + 1} of ${screens.length})`}');
    expect(source).toContain('aria-current={i === active ? "true" : undefined}');
  });

  it("labels the install prompt dismissal control", () => {
    const source = readClientSource("components/AppInstallPrompt.tsx");
    expect(source).toContain('aria-label="Dismiss install app prompt"');
  });

  it("provides a keyboard skip link to the homepage main landmark", () => {
    const header = readClientSource("components/PublicSiteHeader.tsx");
    const home = readClientSource("pages/Home.tsx");
    expect(header).toContain('href="#main-content"');
    expect(header).toContain("Skip to main content");
    expect(home).toContain('<main id="main-content" tabIndex={-1}');
  });
});
