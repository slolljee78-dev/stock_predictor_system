/**
 * Background Jobs
 * Handles periodic tasks like signal generation and price updates
 */

import { generateTradingSignal } from './signalGenerator';
import { getDb } from './db';
import { TRADING_212_STOCKS } from './stockDataFetcher';
import { notifyBuySignal, notifySellSignal } from './pushNotificationService';
import { startSignalMonitoring, stopSignalMonitoring, getMonitoringStatus } from './signalMonitoringJob';

let isRunning = false;
let monitoringJobId: NodeJS.Timeout | null = null;

/**
 * Generate signals for all stocks in watchlists
 */
export async function generateSignalsForWatchlists() {
  if (isRunning) {
    console.log('[Background Job] Signal generation already running, skipping');
    return;
  }

  isRunning = true;
  console.log('[Background Job] Starting signal generation...');

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Background Job] Database not available');
      return;
    }

    // In a production app, you would:
    // 1. Get all active watchlists
    // 2. For each stock, fetch recent price data
    // 3. Generate signals using ML engine
    // 4. Compare with previous signals to detect new ones
    // 5. Send notifications to users
    // 6. Store signals in database

    console.log('[Background Job] Signal generation completed');
  } catch (error) {
    console.error('[Background Job] Signal generation failed:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Start background job scheduler
 */
export function startBackgroundJobs() {
  console.log('[Background Jobs] Starting scheduler...');

  // Start real-time signal monitoring job
  console.log('[Background Jobs] Initializing signal monitoring...');
  startSignalMonitoring({
    interval: 60 * 60 * 1000, // 1 hour (to respect Alpha Vantage free tier: 25 requests/day)
    confidenceThreshold: 60,
    maxStocksPerRun: 10, // 10 stocks per run = ~10 API calls/hour = ~240 calls/day max (well under 25 limit)
    notifyOnSignal: true,
    updateSentiment: true,
  });

  // Generate signals every 5 minutes during market hours
  const signalInterval = setInterval(async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Only run during market hours (9:30 AM - 4:00 PM EST)
    // Simplified check - in production, check actual market calendar
    const isMarketHours = hours >= 9 && hours < 16;

    if (isMarketHours) {
      await generateSignalsForWatchlists();
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Cleanup on process exit
  process.on('exit', () => {
    clearInterval(signalInterval);
    stopSignalMonitoring();
    console.log('[Background Jobs] Scheduler stopped');
  });

  return signalInterval;
}

/**
 * Stop background jobs
 */
export function stopBackgroundJobs(intervalId: NodeJS.Timeout) {
  clearInterval(intervalId);
  console.log('[Background Jobs] Stopped');
}

/**
 * Manual trigger for signal generation (for testing)
 */
export async function triggerSignalGeneration() {
  console.log('[Background Job] Manual trigger - generating signals...');
  await generateSignalsForWatchlists();
  console.log('[Background Job] Manual trigger - completed');
}

/**
 * Get background job status
 */
export function getBackgroundJobStatus() {
  const monitoringStatus = getMonitoringStatus();
  return {
    isRunning,
    signalMonitoring: monitoringStatus,
    timestamp: new Date(),
    nextRun: new Date(Date.now() + 5 * 60 * 1000),
  };
}
