import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const indexHtml = fs.readFileSync(path.join(projectRoot, "client", "index.html"), "utf8");
const sitemap = fs.readFileSync(path.join(projectRoot, "client", "public", "sitemap.xml"), "utf8");

describe("public metadata and crawl targets", () => {
  it("does not advertise unsupported real-time pricing, social accounts, support email, or active offers", () => {
    expect(indexHtml).not.toContain("Real-time stock analysis");
    expect(indexHtml).not.toContain("support@vortextrade.manus.space");
    expect(indexHtml).not.toContain('twitter:site');
    expect(indexHtml).not.toContain('"@type": "Offer"');
    expect(indexHtml).not.toContain('"@type": "BreadcrumbList"');
  });

  it("keeps public policy pages indexed and protected accuracy pages out of the sitemap", () => {
    expect(sitemap).toContain("https://vortextrade.manus.space/data-and-access");
    expect(sitemap).not.toContain("https://vortextrade.manus.space/signal-accuracy");
  });
});
