import { describe, expect, it } from "vitest";
import { formatRunCountdown, getScheduledRunTimer } from "./scheduledRunTimer";

describe("scheduled Signal Engine run timer", () => {
  it("formats short and multi-day countdowns without reporting negative time", () => {
    expect(formatRunCountdown(3_661_000)).toBe("1h 1m 1s");
    expect(formatRunCountdown(24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 5 * 60 * 1000)).toBe("1d 2h 5m");
    expect(formatRunCountdown(-1)).toBe("0h 0m 0s");
  });

  it("derives progress, time remaining, and next-scan countdown from server timestamps", () => {
    const startedAt = "2026-08-13T08:00:00.000Z";
    const endsAt = "2026-08-14T08:00:00.000Z";
    const nextRunAt = "2026-08-13T15:00:00.000Z";

    expect(getScheduledRunTimer({
      startedAt,
      endsAt,
      nextRunAt,
      now: Date.parse("2026-08-13T14:00:00.000Z"),
    })).toEqual({
      timeRemaining: "18h 0m 0s",
      progressPercent: 25,
      nextRoundIn: "1h 0m 0s",
      isAwaitingCompletion: false,
    });
  });

  it("shows completion waiting state only after the scheduled end time", () => {
    expect(getScheduledRunTimer({
      startedAt: "2026-08-13T08:00:00.000Z",
      endsAt: "2026-08-13T09:00:00.000Z",
      nextRunAt: null,
      now: Date.parse("2026-08-13T09:00:01.000Z"),
    })).toMatchObject({
      timeRemaining: "0h 0m 0s",
      progressPercent: 100,
      nextRoundIn: null,
      isAwaitingCompletion: true,
    });
  });

  it("does not create a timer when server timing data is incomplete or invalid", () => {
    expect(getScheduledRunTimer({ startedAt: null, endsAt: null, nextRunAt: null })).toBeNull();
    expect(getScheduledRunTimer({
      startedAt: "2026-08-13T09:00:00.000Z",
      endsAt: "2026-08-13T08:00:00.000Z",
      nextRunAt: null,
    })).toBeNull();
  });
});
