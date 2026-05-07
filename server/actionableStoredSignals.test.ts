import { describe, expect, it } from "vitest";

import {
  DEFAULT_STORED_SIGNAL_CONFIDENCE_THRESHOLD,
  isStoredSignalActionable,
} from "./actionableStoredSignals";

describe("isStoredSignalActionable", () => {
  it("rejects signals below an explicit watchlist confidence threshold", () => {
    expect(
      isStoredSignalActionable({
        type: "sell",
        confidenceScore: 33,
        minConfidenceThreshold: 35,
        alertOnSell: 1,
      }),
    ).toBe(false);
  });

  it("uses the calibrated default threshold when the watchlist does not override it", () => {
    expect(DEFAULT_STORED_SIGNAL_CONFIDENCE_THRESHOLD).toBe(25);

    expect(
      isStoredSignalActionable({
        type: "buy",
        confidenceScore: 30,
        alertOnBuy: 1,
      }),
    ).toBe(true);

    expect(
      isStoredSignalActionable({
        type: "buy",
        confidenceScore: 20,
        alertOnBuy: 1,
      }),
    ).toBe(false);
  });

  it("rejects disabled buy or sell alert types even when confidence is high enough", () => {
    expect(
      isStoredSignalActionable({
        type: "buy",
        confidenceScore: 82,
        minConfidenceThreshold: 25,
        alertOnBuy: 0,
      }),
    ).toBe(false);

    expect(
      isStoredSignalActionable({
        type: "sell",
        confidenceScore: 82,
        minConfidenceThreshold: 25,
        alertOnSell: 0,
      }),
    ).toBe(false);
  });

  it("accepts enabled buy and sell signals once they clear the calibrated threshold", () => {
    expect(
      isStoredSignalActionable({
        type: "buy",
        confidenceScore: 30,
        minConfidenceThreshold: 25,
        alertOnBuy: 1,
      }),
    ).toBe(true);

    expect(
      isStoredSignalActionable({
        type: "sell",
        confidenceScore: 33,
        minConfidenceThreshold: 25,
        alertOnSell: 1,
      }),
    ).toBe(true);
  });
});
