import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const simulatorPage = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/TradingSimulator.tsx"),
  "utf8"
);

const recentPagesMenu = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/components/RecentPagesMenu.tsx"),
  "utf8"
);

describe("Signal Engine naming", () => {
  it("names the simulator route Signal Engine in the workspace and recent-page navigation", () => {
    expect(simulatorPage).toContain(">Signal Engine</h1>");
    expect(simulatorPage).not.toContain(">Trading Simulator</h1>");
    expect(recentPagesMenu).toContain('"/simulator": { label: "Signal Engine"');
  });
});
