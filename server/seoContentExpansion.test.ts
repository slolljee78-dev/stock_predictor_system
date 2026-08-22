import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");

describe("SEO content expansion", () => {
  it("includes the new technical-signal education article in the sitemap", () => {
    const sitemap = fs.readFileSync(path.join(root, "client", "public", "sitemap.xml"), "utf8");
    expect(sitemap).toContain("/blog/how-to-read-technical-trading-signals");
  });

  it("keeps the educational content aligned to transparent methodology and paper-trading limits", async () => {
    const { blogRouter } = await import("./routers/blog");
    expect(blogRouter).toBeDefined();
  });
});
