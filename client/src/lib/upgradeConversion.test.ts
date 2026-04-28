import { describe, expect, it } from "vitest";

import {
  getBlurredPreviewText,
  getPreviewUsage,
  LOCKED_FEATURE_PLAN_ROWS,
} from "./upgradeConversion";

describe("upgradeConversion", () => {
  it("calculates preview usage safely", () => {
    expect(getPreviewUsage(8, 3)).toEqual({
      previewed: 3,
      total: 8,
      percent: 38,
      remainingLocked: 5,
      label: "3 of 8 premium items previewed",
    });
  });

  it("handles empty totals without errors", () => {
    expect(getPreviewUsage(0, 3)).toEqual({
      previewed: 0,
      total: 0,
      percent: 0,
      remainingLocked: 0,
      label: "No premium preview in use yet",
    });
  });

  it("exposes the locked feature comparison rows", () => {
    expect(LOCKED_FEATURE_PLAN_ROWS).toHaveLength(3);
    expect(LOCKED_FEATURE_PLAN_ROWS[0]?.label).toBe("Signal detail");
  });

  it("falls back when preview text is empty", () => {
    expect(getBlurredPreviewText("", "Fallback")).toBe("Fallback");
    expect(getBlurredPreviewText("  Live explanation  ", "Fallback")).toBe("Live explanation");
  });
});
