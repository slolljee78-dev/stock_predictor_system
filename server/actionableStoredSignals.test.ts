import { describe, expect, it } from "vitest";

import { isStoredSignalActionable } from "./actionableStoredSignals";

describe("isStoredSignalActionable", () => {
  it("rejects signals below the watchlist confidence threshold", () => {
    expect(
      isStoredSignalActionable({
        type: "sell",
        confidenceScore: 33,
        minConfidenceThreshold: 60,
        alertOnSell: 1,
      }),
    ).toBe(false);
  });

  it("rejects disabled buy or sell alert types even when confidence is high", () => {
    expect(
      isStoredSignalActionable({
        type: "buy",
        confidenceScore: 82,
        minConfidenceThreshold: 60,
        alertOnBuy: 0,
      }),
    ).toBe(false);

    expect(
      isStoredSignalActionable({
        type: "sell",
        confidenceScore: 82,
        minConfidenceThreshold: 60,
        alertOnSell: 0,
      }),
    ).toBe(false);
  });

  it("accepts high-confidence enabled signals", () => {
    expect(
      isStoredSignalActionable({
        type: "buy",
        confidenceScore: 82,
        minConfidenceThreshold: 60,
        alertOnBuy: 1,
      }),
    ).toBe(true);

    expect(
      isStoredSignalActionable({
        type: "sell",
        confidenceScore: 82,
        minConfidenceThreshold: 60,
        alertOnSell: 1,
      }),
    ).toBe(true);
  });
});
