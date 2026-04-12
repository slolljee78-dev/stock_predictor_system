/**
 * Subscription tier management and feature gating
 * Handles trial expiration, feature limits, and upgrade logic
 */

import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export type SubscriptionTier = 'TRIAL' | 'FREEMIUM' | 'STARTER' | 'PRO' | 'ELITE';

export interface SubscriptionLimits {
  maxStocks: number;
  maxWatchlists: number;
  maxAlerts: number;
  hasAdvancedSignals: boolean;
  hasRealTimeAlerts: boolean;
  hasLiveData: boolean;
  hasAPIAccess: boolean;
  hasAutomatedTrading: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  TRIAL: {
    maxStocks: 212,
    maxWatchlists: 10,
    maxAlerts: 100,
    hasAdvancedSignals: true,
    hasRealTimeAlerts: true,
    hasLiveData: true,
    hasAPIAccess: false,
    hasAutomatedTrading: false,
    reportFrequency: 'daily',
  },
  FREEMIUM: {
    maxStocks: 20,
    maxWatchlists: 3,
    maxAlerts: 10,
    hasAdvancedSignals: false,
    hasRealTimeAlerts: false,
    hasLiveData: false,
    hasAPIAccess: false,
    hasAutomatedTrading: false,
    reportFrequency: 'weekly',
  },
  STARTER: {
    maxStocks: 50,
    maxWatchlists: 5,
    maxAlerts: 25,
    hasAdvancedSignals: false,
    hasRealTimeAlerts: false,
    hasLiveData: false,
    hasAPIAccess: false,
    hasAutomatedTrading: false,
    reportFrequency: 'weekly',
  },
  PRO: {
    maxStocks: 212,
    maxWatchlists: 20,
    maxAlerts: 100,
    hasAdvancedSignals: true,
    hasRealTimeAlerts: true,
    hasLiveData: true,
    hasAPIAccess: false,
    hasAutomatedTrading: false,
    reportFrequency: 'daily',
  },
  ELITE: {
    maxStocks: 212,
    maxWatchlists: 100,
    maxAlerts: 500,
    hasAdvancedSignals: true,
    hasRealTimeAlerts: true,
    hasLiveData: true,
    hasAPIAccess: true,
    hasAutomatedTrading: true,
    reportFrequency: 'daily',
  },
};

/**
 * Get current subscription tier for a user (sync version for routers)
 */
export function getSubscriptionTierSync(user: any): SubscriptionTier {
  // Check if user is in trial period
  if (user.trialStartedAt) {
    const trialEndDate = new Date(user.trialStartedAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    if (new Date() < trialEndDate) {
      return 'TRIAL';
    }
  }

  // Check subscription status
  if (user.subscriptionTier && user.subscriptionStatus === 'active') {
    return user.subscriptionTier as SubscriptionTier;
  }

  return 'FREEMIUM';
}

/**
 * Get feature limits for a tier (sync version)
 */
export function getLimitsSync(tier: SubscriptionTier): SubscriptionLimits {
  return TIER_LIMITS[tier];
}

/**
 * Get current subscription tier for a user
 */
export async function getUserSubscriptionTier(userId: number): Promise<SubscriptionTier> {
  const db = await getDb();
  if (!db) return 'FREEMIUM';

  try {
    const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userList[0];

    if (!user) {
      return 'FREEMIUM';
    }

    return getSubscriptionTierSync(user);
  } catch (error) {
    console.error('[SubscriptionManager] Error getting subscription tier:', error);
    return 'FREEMIUM';
  }
}

/**
 * Get feature limits for a user
 */
export async function getUserLimits(userId: number): Promise<SubscriptionLimits> {
  const tier = await getUserSubscriptionTier(userId);
  return TIER_LIMITS[tier];
}

/**
 * Start trial for new user
 */
export async function startTrial(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(users)
      .set({
        trialStartedAt: new Date(),
        subscriptionTier: 'TRIAL',
        subscriptionStatus: 'active',
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('[SubscriptionManager] Error starting trial:', error);
  }
}

/**
 * Downgrade user to freemium after trial expires
 */
export async function downgradeToFreemium(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(users)
      .set({
        subscriptionTier: 'FREEMIUM',
        subscriptionStatus: 'active',
        trialStartedAt: null,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('[SubscriptionManager] Error downgrading to freemium:', error);
  }
}

/**
 * Upgrade user to paid tier
 */
export async function upgradeTier(userId: number, tier: SubscriptionTier, stripeSubscriptionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(users)
      .set({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        stripeSubscriptionId,
        trialStartedAt: null,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('[SubscriptionManager] Error upgrading tier:', error);
  }
}

/**
 * Check if user has reached stock limit
 */
export async function hasReachedStockLimit(userId: number, currentStockCount: number): Promise<boolean> {
  const limits = await getUserLimits(userId);
  return currentStockCount >= limits.maxStocks;
}

/**
 * Get trial days remaining
 */
export async function getTrialDaysRemaining(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userList[0];

    if (!user || !user.trialStartedAt) {
      return 0;
    }

    const trialEndDate = new Date(user.trialStartedAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const daysRemaining = Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  } catch (error) {
    console.error('[SubscriptionManager] Error getting trial days remaining:', error);
    return 0;
  }
}

/**
 * Get upgrade recommendation based on current usage
 */
export async function getUpgradeRecommendation(userId: number): Promise<SubscriptionTier | null> {
  try {
    const tier = await getUserSubscriptionTier(userId);
    const limits = await getUserLimits(userId);

    // If on trial, recommend based on usage
    if (tier === 'TRIAL') {
      return 'PRO'; // Default recommendation for trial users
    }

    // If on freemium and approaching limits, recommend upgrade
    if (tier === 'FREEMIUM') {
      // Check stock count usage
      const db = await getDb();
      if (!db) return null;

      try {
        const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const user = userList[0];

        if (user && user.watchlistCount && user.watchlistCount > limits.maxStocks * 0.8) {
          return 'STARTER';
        }
      } catch (error) {
        console.error('[SubscriptionManager] Error checking watchlist count:', error);
      }
    }

    // If on starter and approaching limits, recommend PRO
    if (tier === 'STARTER') {
      return 'PRO';
    }

    return null;
  } catch (error) {
    console.error('[SubscriptionManager] Error getting upgrade recommendation:', error);
    return null;
  }
}
