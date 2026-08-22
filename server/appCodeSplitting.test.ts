import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const appSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "..", "client", "src", "App.tsx"),
  "utf8",
);

describe("application route code splitting", () => {
  it("keeps the homepage eager while lazily loading dashboard and feature routes", () => {
    expect(appSource).toContain('import Home from "./pages/Home"');
    expect(appSource).toContain('const Dashboard = lazy(() => import("./pages/Dashboard"))');
    expect(appSource).toContain('const TradingSimulator = lazy(() => import("./pages/TradingSimulator"))');
    expect(appSource).toContain('const SignalsDashboard = lazy(() => import("./pages/SignalsDashboard"))');
    expect(appSource).toContain("<Suspense fallback=");
  });
});
