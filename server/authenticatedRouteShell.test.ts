import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const simulatorSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "..", "client", "src", "pages", "TradingSimulator.tsx"),
  "utf8",
);

describe("authenticated route shell", () => {
  it("uses the shared dashboard layout for the Signal Engine page", () => {
    expect(simulatorSource).toContain('import DashboardLayout from "@/components/DashboardLayout"');
    expect(simulatorSource).toContain("<DashboardLayout>");
    expect(simulatorSource).toContain("</DashboardLayout>");
    expect(simulatorSource).not.toContain("Back to menu");
  });
});
