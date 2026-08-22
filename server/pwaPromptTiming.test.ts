import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.resolve(import.meta.dirname, "..", "client", "src", "components", "AppInstallPrompt.tsx"),
  "utf8",
);

describe("PWA install prompt timing", () => {
  it("waits for voluntary engagement and a delay before showing", () => {
    expect(source).toContain("const PROMPT_DELAY_MS = 12_000");
    expect(source).toContain("const [hasEngaged, setHasEngaged] = useState(false)");
    expect(source).toContain("if (!deferredPrompt || !hasEngaged || location !== '/'");
    expect(source).toContain("window.setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS)");
  });
});
