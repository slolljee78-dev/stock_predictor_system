import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function readClientSource(relativePath: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, "..", "client", "src", relativePath), "utf8");
}

describe("public funnel instrumentation", () => {
  it("keeps analytics optional and tracks the main conversion events", () => {
    const analytics = readClientSource("lib/analytics.ts");
    const home = readClientSource("pages/Home.tsx");
    const pricing = readClientSource("pages/Pricing.tsx");

    expect(analytics).toContain('window.gtag?.("event", eventName, parameters)');
    expect(home).toContain('trackProductEvent("login_cta_clicked"');
    expect(home).toContain('trackProductEvent("signal_engine_cta_clicked"');
    expect(pricing).toContain('trackProductEvent("plan_preview_selected"');
  });
});
