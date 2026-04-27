/**
 * Refresh Rate Limiter
 * Prevents rapid consecutive refresh requests with a cooldown period
 */

const COOLDOWN_SECONDS = 8; // 8 second cooldown between refreshes

export interface RefreshRateLimiterState {
  lastRefreshTime: number | null;
  cooldownRemaining: number;
  isOnCooldown: boolean;
}

/**
 * Check if a refresh is allowed based on cooldown timer
 */
export function canRefresh(lastRefreshTime: number | null): boolean {
  if (lastRefreshTime === null) {
    return true;
  }

  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  const cooldownMs = COOLDOWN_SECONDS * 1000;

  return timeSinceLastRefresh >= cooldownMs;
}

/**
 * Get the remaining cooldown time in seconds
 */
export function getRemainingCooldown(lastRefreshTime: number | null): number {
  if (lastRefreshTime === null) {
    return 0;
  }

  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  const cooldownMs = COOLDOWN_SECONDS * 1000;
  const remaining = Math.max(0, cooldownMs - timeSinceLastRefresh);

  return Math.ceil(remaining / 1000);
}

/**
 * Get the current refresh rate limiter state
 */
export function getRefreshState(lastRefreshTime: number | null): RefreshRateLimiterState {
  const isOnCooldown = !canRefresh(lastRefreshTime);
  const cooldownRemaining = getRemainingCooldown(lastRefreshTime);

  return {
    lastRefreshTime,
    cooldownRemaining,
    isOnCooldown,
  };
}

/**
 * Get button label with cooldown countdown
 */
export function getRefreshButtonLabel(
  isRefreshing: boolean,
  isOnCooldown: boolean,
  cooldownRemaining: number
): string {
  if (isRefreshing) {
    return "Refreshing...";
  }

  if (isOnCooldown && cooldownRemaining > 0) {
    return `Refresh in ${cooldownRemaining}s`;
  }

  return "Refresh";
}

/**
 * Get button disabled state
 */
export function isRefreshButtonDisabled(
  isRefreshing: boolean,
  isOnCooldown: boolean
): boolean {
  return isRefreshing || isOnCooldown;
}
