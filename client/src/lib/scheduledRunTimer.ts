const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export type ScheduledRunTimer = {
  timeRemaining: string;
  progressPercent: number;
  nextRoundIn: string | null;
  isAwaitingCompletion: boolean;
};

export function formatRunCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / SECOND_MS));
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function getScheduledRunTimer(input: {
  startedAt: string | null;
  endsAt: string | null;
  nextRunAt: string | null;
  now?: number;
}): ScheduledRunTimer | null {
  const startedAt = input.startedAt ? Date.parse(input.startedAt) : Number.NaN;
  const endsAt = input.endsAt ? Date.parse(input.endsAt) : Number.NaN;
  const now = input.now ?? Date.now();

  if (!Number.isFinite(startedAt) || !Number.isFinite(endsAt) || endsAt <= startedAt) {
    return null;
  }

  const totalDuration = endsAt - startedAt;
  const remaining = Math.max(0, endsAt - now);
  const progressPercent = Math.min(100, Math.max(0, ((now - startedAt) / totalDuration) * 100));
  const nextRunAt = input.nextRunAt ? Date.parse(input.nextRunAt) : Number.NaN;
  const nextRoundIn = Number.isFinite(nextRunAt)
    ? nextRunAt <= now
      ? "Due for scheduling"
      : formatRunCountdown(nextRunAt - now)
    : null;

  return {
    timeRemaining: formatRunCountdown(remaining),
    progressPercent,
    nextRoundIn,
    isAwaitingCompletion: remaining === 0,
  };
}
