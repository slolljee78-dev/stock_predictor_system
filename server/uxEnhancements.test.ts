import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS } from "../client/src/components/SignalFilters";
import {
  applyQuickFilter,
  getQuickFilterValue,
} from "../client/src/lib/signalQuickFilters";
import { getPricingRecommendation } from "../client/src/lib/pricingRecommendation";

describe("signal quick filters", () => {
  it("detects the active quick-filter mode from current filters", () => {
    expect(getQuickFilterValue(DEFAULT_FILTERS)).toBe("high-confidence");
    expect(getQuickFilterValue({ ...DEFAULT_FILTERS, signalType: "buy" })).toBe("buy");
    expect(getQuickFilterValue({ ...DEFAULT_FILTERS, signalType: "sell" })).toBe("sell");
    expect(getQuickFilterValue({ ...DEFAULT_FILTERS, minConfidence: 45 })).toBe("high-confidence");
    expect(getQuickFilterValue({ ...DEFAULT_FILTERS, minConfidence: 0 })).toBe("all");
  });

  it("applies buy and sell quick filters without disturbing unrelated filter values", () => {
    const base = { ...DEFAULT_FILTERS, sortBy: "time" as const, minConfidence: 25 };

    expect(applyQuickFilter(base, "buy")).toMatchObject({
      signalType: "buy",
      sortBy: "time",
      minConfidence: 25,
    });

    expect(applyQuickFilter(base, "sell")).toMatchObject({
      signalType: "sell",
      sortBy: "time",
      minConfidence: 25,
    });
  });

  it("raises the confidence floor for the high-confidence chip and clears it for all-signals mode", () => {
    const elevated = applyQuickFilter({ ...DEFAULT_FILTERS, minConfidence: 20 }, "high-confidence");
    expect(elevated.signalType).toBe("all");
    expect(elevated.minConfidence).toBe(40);

    const reset = applyQuickFilter({ ...DEFAULT_FILTERS, signalType: "buy", minConfidence: 60 }, "all");
    expect(reset.signalType).toBe("all");
    expect(reset.minConfidence).toBe(0);
  });
});

describe("pricing recommendation", () => {
  it("recommends Starter for empty or small workflows", () => {
    expect(getPricingRecommendation(0, 0).tier).toBe("Starter");
    expect(getPricingRecommendation(8, 3).tier).toBe("Starter");
  });

  it("recommends Pro for medium activity and Elite for heavier activity", () => {
    expect(getPricingRecommendation(18, 6).tier).toBe("Pro");
    expect(getPricingRecommendation(10, 12).tier).toBe("Pro");
    expect(getPricingRecommendation(55, 10).tier).toBe("Elite");
    expect(getPricingRecommendation(20, 30).tier).toBe("Elite");
  });
});
