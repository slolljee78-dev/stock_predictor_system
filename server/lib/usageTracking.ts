/**
 * Usage tracking and analytics for free tier users
 * Tracks signals used, stocks monitored, and quota enforcement
 */

export const FREE_TIER_LIMITS = {
  maxStocks: 3,
  maxSignalsPerDay: 5,
  maxWatchlists: 1,
  maxAlerts: 2,
};

export const PAID_TIER_LIMITS = {
  starter: {
    maxStocks: 20,
    maxSignalsPerDay: 50,
    maxWatchlists: 3,
    maxAlerts: 10,
  },
  pro: {
    maxStocks: 100,
    maxSignalsPerDay: 200,
    maxWatchlists: 10,
    maxAlerts: 50,
  },
  elite: {
    maxStocks: 500,
    maxSignalsPerDay: 1000,
    maxWatchlists: 50,
    maxAlerts: 500,
  },
};

export interface UsageQuota {
  tier: string;
  signalsUsedToday: number;
  signalsLimit: number;
  signalsRemaining: number;
  stocksMonitored: number;
  stocksLimit: number;
  stocksRemaining: number;
  watchlistsCount: number;
  watchlistsLimit: number;
  watchlistsRemaining: number;
  alertsCount: number;
  alertsLimit: number;
  alertsRemaining: number;
  isAtLimit: boolean;
  quotaPercentage: number;
}

/**
 * Get usage quota for a user based on subscription tier
 */
export function getUserQuota(user: any, currentUsage: any): UsageQuota {
  const tier = user?.subscriptionTier || 'free';
  
  let limits = FREE_TIER_LIMITS;
  if (tier === 'starter') limits = PAID_TIER_LIMITS.starter;
  else if (tier === 'pro') limits = PAID_TIER_LIMITS.pro;
  else if (tier === 'elite') limits = PAID_TIER_LIMITS.elite;

  const signalsUsedToday = currentUsage?.signalsUsedToday || 0;
  const stocksMonitored = currentUsage?.stocksMonitored || 0;
  const watchlistsCount = currentUsage?.watchlistsCount || 0;
  const alertsCount = currentUsage?.alertsCount || 0;

  const signalsRemaining = Math.max(0, limits.maxSignalsPerDay - signalsUsedToday);
  const stocksRemaining = Math.max(0, limits.maxStocks - stocksMonitored);
  const watchlistsRemaining = Math.max(0, limits.maxWatchlists - watchlistsCount);
  const alertsRemaining = Math.max(0, limits.maxAlerts - alertsCount);

  const isAtLimit =
    signalsRemaining === 0 ||
    stocksRemaining === 0 ||
    watchlistsRemaining === 0 ||
    alertsRemaining === 0;

  // Calculate overall quota percentage (average of all quotas)
  const quotaPercentage =
    ((signalsUsedToday + stocksMonitored + watchlistsCount + alertsCount) /
      (limits.maxSignalsPerDay +
        limits.maxStocks +
        limits.maxWatchlists +
        limits.maxAlerts)) *
    100;

  return {
    tier,
    signalsUsedToday,
    signalsLimit: limits.maxSignalsPerDay,
    signalsRemaining,
    stocksMonitored,
    stocksLimit: limits.maxStocks,
    stocksRemaining,
    watchlistsCount,
    watchlistsLimit: limits.maxWatchlists,
    watchlistsRemaining,
    alertsCount,
    alertsLimit: limits.maxAlerts,
    alertsRemaining,
    isAtLimit,
    quotaPercentage: Math.round(quotaPercentage),
  };
}

/**
 * Check if user has reached signal limit for the day
 */
export function hasReachedSignalLimit(user: any, signalsUsedToday: number): boolean {
  const tier = user?.subscriptionTier || 'free';
  const limits = tier === 'free' ? FREE_TIER_LIMITS : PAID_TIER_LIMITS[tier as keyof typeof PAID_TIER_LIMITS] || FREE_TIER_LIMITS;
  return signalsUsedToday >= limits.maxSignalsPerDay;
}

/**
 * Check if user has reached stock monitoring limit
 */
export function hasReachedStockLimit(user: any, stocksMonitored: number): boolean {
  const tier = user?.subscriptionTier || 'free';
  const limits = tier === 'free' ? FREE_TIER_LIMITS : PAID_TIER_LIMITS[tier as keyof typeof PAID_TIER_LIMITS] || FREE_TIER_LIMITS;
  return stocksMonitored >= limits.maxStocks;
}

/**
 * Get upgrade recommendation message based on current usage
 */
export function getUpgradeRecommendation(quota: UsageQuota): string | null {
  if (quota.tier !== 'free') return null;

  if (quota.signalsRemaining === 0) {
    return `You've reached your daily signal limit (${quota.signalsLimit}). Upgrade to see unlimited signals.`;
  }

  if (quota.stocksRemaining === 0) {
    return `You're monitoring the maximum ${quota.stocksLimit} stocks. Upgrade to monitor more stocks.`;
  }

  if (quota.quotaPercentage >= 80) {
    return `You're using ${quota.quotaPercentage}% of your free tier quota. Upgrade for unlimited access.`;
  }

  return null;
}
