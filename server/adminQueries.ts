/**
 * Admin Dashboard Database Queries
 * Provides aggregated data for system monitoring and management
 */

import { getDb } from "./db";
import { users, payments, signals } from "../drizzle/schema";
import { eq, count, sum, avg, gte, lte, and } from "drizzle-orm";

/**
 * Get overall system statistics
 */
export async function getSystemStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalUsers = await db
    .select({ count: count() })
    .from(users);

  const activeSubscriptions = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.subscriptionStatus, "active"));

  const trialUsers = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.subscriptionTier, "TRIAL"));

  const totalRevenue = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, "succeeded"));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const monthlyRecurringRevenue = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(
      and(
        eq(payments.status, "succeeded"),
        gte(payments.createdAt, thirtyDaysAgo)
      )
    );

  return {
    totalUsers: totalUsers[0]?.count || 0,
    activeSubscriptions: activeSubscriptions[0]?.count || 0,
    trialUsers: trialUsers[0]?.count || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRecurringRevenue: monthlyRecurringRevenue[0]?.total || 0,
  };
}

/**
 * Get subscription tier breakdown
 */
export async function getSubscriptionStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tiers = await db
    .select({
      tier: users.subscriptionTier,
      count: count(),
    })
    .from(users)
    .groupBy(users.subscriptionTier);

  return tiers;
}

/**
 * Get user list with pagination
 */
export async function getUserList(
  page: number = 1,
  pageSize: number = 50
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;

  const userList = await db
    .select()
    .from(users)
    .orderBy(users.createdAt)
    .limit(pageSize)
    .offset(offset);

  const totalCount = await db
    .select({ count: count() })
    .from(users);

  return {
    users: userList,
    total: totalCount[0]?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize),
  };
}

/**
 * Get user details with related data
 */
export async function getUserDetails(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user[0]) {
    throw new Error("User not found");
  }

  // Get user's payments
  const userPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);

  // Get user's recent signals (signals table doesn't have userId field)
  const userSignals: any[] = [];

  return {
    user: user[0],
    payments: userPayments,
    recentSignals: userSignals,
  };
}

/**
 * Get payment analytics
 */
export async function getPaymentAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Total payments
  const totalPayments = await db
    .select({ count: count(), total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, "succeeded"));

  // Last 30 days
  const last30Days = await db
    .select({ count: count(), total: sum(payments.amount) })
    .from(payments)
    .where(
      and(
        eq(payments.status, "succeeded"),
        gte(payments.createdAt, thirtyDaysAgo)
      )
    );

  // Last 60 days
  const last60Days = await db
    .select({ count: count(), total: sum(payments.amount) })
    .from(payments)
    .where(
      and(
        eq(payments.status, "succeeded"),
        gte(payments.createdAt, sixtyDaysAgo)
      )
    );

  // Failed payments
  const failedPayments = await db
    .select({ count: count() })
    .from(payments)
    .where(eq(payments.status, "failed"));

  return {
    totalPayments: totalPayments[0] || { count: 0, total: 0 },
    last30Days: last30Days[0] || { count: 0, total: 0 },
    last60Days: last60Days[0] || { count: 0, total: 0 },
    failedPayments: failedPayments[0]?.count || 0,
  };
}

/**
 * Get signal accuracy metrics
 */
export async function getSignalMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalSignals = await db
    .select({ count: count() })
    .from(signals);

  // Signals by confidence level
  const signalsByConfidence = await db
    .select({
      confidenceRange: signals.confidenceScore,
      count: count(),
    })
    .from(signals)
    .groupBy(signals.confidenceScore);

  // Average confidence
  const avgConfidence = await db
    .select({ avg: avg(signals.confidenceScore) })
    .from(signals);

  // Signals by status
  const signalsByStatus = await db
    .select({
      status: signals.status,
      count: count(),
    })
    .from(signals)
    .groupBy(signals.status);

  return {
    totalSignals: totalSignals[0]?.count || 0,
    avgConfidence: avgConfidence[0]?.avg || 0,
    byConfidence: signalsByConfidence,
    byStatus: signalsByStatus,
  };
}

/**
 * Get user activity metrics
 */
export async function getUserActivityMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Active users (last 24 hours)
  const activeToday = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastSignedIn, twentyFourHoursAgo));

  // Active users (last 7 days)
  const activeWeek = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastSignedIn, sevenDaysAgo));

  // Active users (last 30 days)
  const activeMonth = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastSignedIn, thirtyDaysAgo));

  // New users (last 30 days)
  const newUsers = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.createdAt, thirtyDaysAgo));

  return {
    activeToday: activeToday[0]?.count || 0,
    activeWeek: activeWeek[0]?.count || 0,
    activeMonth: activeMonth[0]?.count || 0,
    newUsers: newUsers[0]?.count || 0,
  };
}

/**
 * Get churn analysis
 */
export async function getChurnAnalysis() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Users who cancelled in last 30 days
  const cancelledUsers = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.subscriptionStatus, "cancelled"),
        lte(users.subscriptionEndedAt, now),
        gte(users.subscriptionEndedAt, thirtyDaysAgo)
      )
    );

  // Trial users who didn't convert
  const expiredTrials = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.subscriptionTier, "TRIAL"),
        lte(users.trialExpiresAt, now)
      )
    );

  return {
    cancelledLastMonth: cancelledUsers[0]?.count || 0,
    expiredTrials: expiredTrials[0]?.count || 0,
  };
}

/**
 * Get audit log entry
 */
export interface AuditLogEntry {
  id: string;
  adminId: number;
  action: string;
  targetUserId?: number;
  details: Record<string, any>;
  createdAt: Date;
}

// In-memory audit log (in production, use database)
const auditLog: AuditLogEntry[] = [];

/**
 * Log admin action
 */
export function logAdminAction(
  adminId: number,
  action: string,
  targetUserId?: number,
  details?: Record<string, any>
): void {
  auditLog.push({
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    adminId,
    action,
    targetUserId,
    details: details || {},
    createdAt: new Date(),
  });

  // Keep only last 10000 entries
  if (auditLog.length > 10000) {
    auditLog.splice(0, auditLog.length - 10000);
  }
}

/**
 * Get audit log
 */
export function getAuditLog(limit: number = 100): AuditLogEntry[] {
  return auditLog.slice(-limit).reverse();
}

/**
 * Get audit log for specific admin
 */
export function getAdminAuditLog(adminId: number, limit: number = 100): AuditLogEntry[] {
  return auditLog
    .filter(entry => entry.adminId === adminId)
    .slice(-limit)
    .reverse();
}
