/**
 * Price Alert Service
 * Manages price alerts and browser notifications
 */

import { getDb } from "./db";
import { priceAlerts, priceAlertHistory, stocks } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface CreatePriceAlertInput {
  userId: number;
  stockId: number;
  targetPrice: number;
  alertType: "above" | "below";
  enableBrowserNotification?: boolean;
  enableEmailNotification?: boolean;
}

export interface UpdatePriceAlertInput {
  targetPrice?: number;
  alertType?: "above" | "below";
  status?: "active" | "triggered" | "dismissed" | "deleted";
  enableBrowserNotification?: boolean;
  enableEmailNotification?: boolean;
}

export interface PriceAlertWithStock {
  id: number;
  userId: number;
  stockId: number;
  ticker: string;
  stockName: string;
  targetPrice: string;
  alertType: "above" | "below";
  status: "active" | "triggered" | "dismissed" | "deleted";
  enableBrowserNotification: number;
  enableEmailNotification: number;
  triggerCount: number;
  lastTriggeredPrice: string | null;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new price alert
 */
export async function createPriceAlert(input: CreatePriceAlertInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(priceAlerts).values({
      userId: input.userId,
      stockId: input.stockId,
      targetPrice: input.targetPrice.toString(),
      alertType: input.alertType,
      enableBrowserNotification: input.enableBrowserNotification ? 1 : 0,
      enableEmailNotification: input.enableEmailNotification ? 1 : 0,
    });

    return {
      success: true,
      
      message: `Price alert created for target price ${input.targetPrice}`,
    };
  } catch (error) {
    console.error("[createPriceAlert] Error:", error);
    throw error;
  }
}

/**
 * Get all active price alerts for a user
 */
export async function getUserPriceAlerts(userId: number): Promise<PriceAlertWithStock[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const alerts = await db
      .select({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        stockId: priceAlerts.stockId,
        ticker: stocks.ticker,
        stockName: stocks.name,
        targetPrice: priceAlerts.targetPrice,
        alertType: priceAlerts.alertType,
        status: priceAlerts.status,
        enableBrowserNotification: priceAlerts.enableBrowserNotification,
        enableEmailNotification: priceAlerts.enableEmailNotification,
        triggerCount: priceAlerts.triggerCount,
        lastTriggeredPrice: priceAlerts.lastTriggeredPrice,
        lastTriggeredAt: priceAlerts.lastTriggeredAt,
        createdAt: priceAlerts.createdAt,
        updatedAt: priceAlerts.updatedAt,
      })
      .from(priceAlerts)
      .innerJoin(stocks, eq(priceAlerts.stockId, stocks.id))
      .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.status, "active")));

    return alerts as PriceAlertWithStock[];
  } catch (error) {
    console.error("[getUserPriceAlerts] Error:", error);
    throw error;
  }
}

/**
 * Get a specific price alert
 */
export async function getPriceAlert(alertId: number, userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const alert = await db
      .select({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        stockId: priceAlerts.stockId,
        ticker: stocks.ticker,
        stockName: stocks.name,
        targetPrice: priceAlerts.targetPrice,
        alertType: priceAlerts.alertType,
        status: priceAlerts.status,
        enableBrowserNotification: priceAlerts.enableBrowserNotification,
        enableEmailNotification: priceAlerts.enableEmailNotification,
        triggerCount: priceAlerts.triggerCount,
        lastTriggeredPrice: priceAlerts.lastTriggeredPrice,
        lastTriggeredAt: priceAlerts.lastTriggeredAt,
        createdAt: priceAlerts.createdAt,
        updatedAt: priceAlerts.updatedAt,
      })
      .from(priceAlerts)
      .innerJoin(stocks, eq(priceAlerts.stockId, stocks.id))
      .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)))
      .limit(1);

    return alert[0] || null;
  } catch (error) {
    console.error("[getPriceAlert] Error:", error);
    throw error;
  }
}

/**
 * Update a price alert
 */
export async function updatePriceAlert(alertId: number, userId: number, input: UpdatePriceAlertInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData: any = {};

    if (input.targetPrice !== undefined) {
      updateData.targetPrice = input.targetPrice.toString();
    }
    if (input.alertType !== undefined) {
      updateData.alertType = input.alertType;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.enableBrowserNotification !== undefined) {
      updateData.enableBrowserNotification = input.enableBrowserNotification ? 1 : 0;
    }
    if (input.enableEmailNotification !== undefined) {
      updateData.enableEmailNotification = input.enableEmailNotification ? 1 : 0;
    }

    await db
      .update(priceAlerts)
      .set(updateData)
      .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)));

    return { success: true, message: "Price alert updated" };
  } catch (error) {
    console.error("[updatePriceAlert] Error:", error);
    throw error;
  }
}

/**
 * Delete a price alert
 */
export async function deletePriceAlert(alertId: number, userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db
      .update(priceAlerts)
      .set({ status: "deleted" })
      .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)));

    return { success: true, message: "Price alert deleted" };
  } catch (error) {
    console.error("[deletePriceAlert] Error:", error);
    throw error;
  }
}

/**
 * Check if a price triggers any active alerts
 */
export async function checkPriceAlerts(stockId: number, currentPrice: number): Promise<number[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const alerts = await db
      .select()
      .from(priceAlerts)
      .where(
        and(
          eq(priceAlerts.stockId, stockId),
          eq(priceAlerts.status, "active")
        )
      );

    const triggeredAlerts: number[] = [];

    for (const alert of alerts) {
      const targetPrice = parseFloat(alert.targetPrice);

      if (alert.alertType === "above" && currentPrice >= targetPrice) {
        triggeredAlerts.push(alert.id);
      } else if (alert.alertType === "below" && currentPrice <= targetPrice) {
        triggeredAlerts.push(alert.id);
      }
    }

    return triggeredAlerts;
  } catch (error) {
    console.error("[checkPriceAlerts] Error:", error);
    throw error;
  }
}

/**
 * Trigger a price alert and record history
 */
export async function triggerPriceAlert(
  alertId: number,
  currentPrice: number,
  notificationChannels: string[] = ["browser"]
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Get the alert details
    const alert = await db.select().from(priceAlerts).where(eq(priceAlerts.id, alertId)).limit(1);

    if (!alert[0]) {
      throw new Error("Alert not found");
    }

    const alertData = alert[0];
    const targetPrice = parseFloat(alertData.targetPrice);

    // Record in history
    await db.insert(priceAlertHistory).values({
      priceAlertId: alertId,
      userId: alertData.userId,
      stockId: alertData.stockId,
      triggerPrice: currentPrice.toString(),
      targetPrice: alertData.targetPrice,
      alertType: alertData.alertType,
      notificationChannels: JSON.stringify(notificationChannels),
      notificationSent: notificationChannels.length > 0 ? 1 : 0,
    });

    // Update alert trigger count and last triggered info
    await db
      .update(priceAlerts)
      .set({
        triggerCount: alertData.triggerCount + 1,
        lastTriggeredPrice: currentPrice.toString(),
        lastTriggeredAt: new Date(),
      })
      .where(eq(priceAlerts.id, alertId));

    return {
      success: true,
      message: `Price alert triggered at ${currentPrice}`,
      alertId,
      currentPrice,
      targetPrice,
    };
  } catch (error) {
    console.error("[triggerPriceAlert] Error:", error);
    throw error;
  }
}

/**
 * Get price alert history for a user
 */
export async function getPriceAlertHistory(userId: number, limit: number = 50) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const history = await db
      .select({
        id: priceAlertHistory.id,
        priceAlertId: priceAlertHistory.priceAlertId,
        ticker: stocks.ticker,
        triggerPrice: priceAlertHistory.triggerPrice,
        targetPrice: priceAlertHistory.targetPrice,
        alertType: priceAlertHistory.alertType,
        notificationChannels: priceAlertHistory.notificationChannels,
        notificationSent: priceAlertHistory.notificationSent,
        createdAt: priceAlertHistory.createdAt,
      })
      .from(priceAlertHistory)
      .innerJoin(stocks, eq(priceAlertHistory.stockId, stocks.id))
      .where(eq(priceAlertHistory.userId, userId))
      .orderBy(priceAlertHistory.createdAt)
      .limit(limit);

    return history;
  } catch (error) {
    console.error("[getPriceAlertHistory] Error:", error);
    throw error;
  }
}

/**
 * Get alert statistics for a user
 */
export async function getAlertStatistics(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const activeAlerts = await db
      .select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.status, "active")));

    const triggeredAlerts = await db
      .select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.status, "triggered")));

    const totalTriggered = await db
      .select()
      .from(priceAlertHistory)
      .where(eq(priceAlertHistory.userId, userId));

    return {
      activeCount: activeAlerts.length,
      triggeredCount: triggeredAlerts.length,
      totalHistoryCount: totalTriggered.length,
      averageTriggersPerAlert:
        activeAlerts.length > 0
          ? (totalTriggered.length / activeAlerts.length).toFixed(2)
          : "0.00",
    };
  } catch (error) {
    console.error("[getAlertStatistics] Error:", error);
    throw error;
  }
}
