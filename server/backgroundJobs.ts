/**
 * Background Jobs
 * Handles periodic tasks like signal generation and price updates
 */

import { generateTradingSignal } from './signalGenerator';
import { getDb } from './db';
import { stocks, signals, users, watchlists } from '../drizzle/schema';
import { notifyBuySignal, notifySellSignal, notifyWatchlistUsers } from './pushNotificationService';
import { fetchStockPrice, fetchMultipleStockPrices } from './liveMarketData';
import { eq, and } from 'drizzle-orm';

let isRunning = false;
let backgroundJobInterval: NodeJS.Timeout | null = null;

interface BackgroundJobConfig {
  enabled: boolean;
  frequency: '5min' | '15min' | 'hourly' | 'daily';
  marketHoursOnly: boolean;
  notifyUsers: boolean;
}

const defaultConfig: BackgroundJobConfig = {
  enabled: true,
  frequency: '15min',
  marketHoursOnly: true,
  notifyUsers: true,
};

/**
 * Check if current time is within market hours (9:30 AM - 4:00 PM EST)
 */
function isMarketHours(): boolean {
  const now = new Date();
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hours = estTime.getHours();
  const minutes = estTime.getMinutes();
  const dayOfWeek = estTime.getDay();

  // Market is open Monday-Friday, 9:30 AM - 4:00 PM EST
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWithinHours = (hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16;

  return isWeekday && isWithinHours;
}

/**
 * Generate signals for all stocks in watchlists
 */
export async function generateSignalsForWatchlists(config: BackgroundJobConfig = defaultConfig) {
  if (isRunning) {
    console.log('[Background Job] Signal generation already running, skipping');
    return;
  }

  // Skip if market hours check is enabled and market is closed
  if (config.marketHoursOnly && !isMarketHours()) {
    console.log('[Background Job] Market hours check enabled and market is closed, skipping');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  console.log(`[Background Job] Starting signal generation at ${new Date().toISOString()}`);

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Background Job] Database not available');
      return;
    }

    // Get all stocks
    const allStocks = await db.select().from(stocks).limit(100);

    if (allStocks.length === 0) {
      console.log('[Background Job] No stocks found');
      return;
    }

    console.log(`[Background Job] Processing ${allStocks.length} stocks...`);

    let signalsGenerated = 0;
    let notificationssent = 0;

    // Process each stock
    for (const stock of allStocks) {
      try {
        // Fetch current price
        const priceData = await fetchStockPrice(stock.ticker);
        if (!priceData) {
          console.warn(`[Background Job] Failed to fetch price for ${stock.ticker}`);
          continue;
        }

        // Generate signal
        const signal = await generateTradingSignal({
          ticker: stock.ticker,
          stockId: stock.id,
          currentPrice: priceData.price,
          priceHistory: [], // Would be fetched from historical data
        });

        if (!signal) {
          continue;
        }

        // Only process valid signals
        if (!signal.type) {
          continue;
        }

        // Only store signals with confidence >= 50
        if (signal.confidenceScore < 50) {
          continue;
        }

        // Store signal in database
        const storedSignal = await db.insert(signals).values({
          stockId: stock.id,
          type: signal.type,
          confidenceScore: signal.confidenceScore,
          priceAtSignal: Math.round(priceData.price * 100), // Store as cents
          analysis: signal.analysis,
          status: 'active',
          createdAt: new Date(),
        });

        signalsGenerated++;
        console.log(`[Background Job] Generated ${signal.type.toUpperCase()} signal for ${stock.ticker} (${signal.confidenceScore}% confidence)`);

        // Notify users if enabled
        if (config.notifyUsers) {
          try {
            const lastSignalId = (storedSignal as any).insertId || 0;
            const count = await notifyWatchlistUsers(
              lastSignalId,
              stock.ticker,
              signal.type,
              priceData.price,
              signal.confidenceScore
            );
            notificationssent += count;
          } catch (notifyError) {
            console.error(`[Background Job] Failed to notify users for ${stock.ticker}:`, notifyError);
          }
        }
      } catch (error) {
        console.error(`[Background Job] Error processing ${stock.ticker}:`, error);
        continue;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Background Job] Completed in ${duration}ms. Generated ${signalsGenerated} signals, sent ${notificationssent} notifications`);
  } catch (error) {
    console.error('[Background Job] Signal generation failed:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Get frequency in milliseconds
 */
function getFrequencyMs(frequency: string): number {
  switch (frequency) {
    case '5min':
      return 5 * 60 * 1000;
    case '15min':
      return 15 * 60 * 1000;
    case 'hourly':
      return 60 * 60 * 1000;
    case 'daily':
      return 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000; // Default 15 minutes
  }
}

/**
 * Start background job scheduler
 */
export function startBackgroundJobs(config: BackgroundJobConfig = defaultConfig) {
  if (!config.enabled) {
    console.log('[Background Jobs] Background jobs are disabled');
    return null;
  }

  console.log(`[Background Jobs] Starting scheduler with frequency: ${config.frequency}`);

  const frequencyMs = getFrequencyMs(config.frequency);

  // Generate signals at specified frequency
  backgroundJobInterval = setInterval(async () => {
    await generateSignalsForWatchlists(config);
  }, frequencyMs);

  // Run immediately on startup
  generateSignalsForWatchlists(config).catch(error => {
    console.error('[Background Jobs] Initial signal generation failed:', error);
  });

  // Cleanup on process exit
  process.on('exit', () => {
    if (backgroundJobInterval) {
      clearInterval(backgroundJobInterval);
      console.log('[Background Jobs] Scheduler stopped');
    }
  });

  return backgroundJobInterval;
}

/**
 * Stop background jobs
 */
export function stopBackgroundJobs() {
  if (backgroundJobInterval) {
    clearInterval(backgroundJobInterval);
    backgroundJobInterval = null;
    console.log('[Background Jobs] Stopped');
  }
}

/**
 * Manual trigger for signal generation (for testing)
 */
export async function triggerSignalGeneration(config?: BackgroundJobConfig) {
  console.log('[Background Job] Manual trigger - generating signals...');
  await generateSignalsForWatchlists(config || defaultConfig);
  console.log('[Background Job] Manual trigger - completed');
}

/**
 * Get background job status
 */
export function getBackgroundJobStatus() {
  return {
    isRunning,
    isActive: backgroundJobInterval !== null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Update background job configuration
 */
export function updateBackgroundJobConfig(newConfig: Partial<BackgroundJobConfig>) {
  console.log('[Background Jobs] Updating configuration:', newConfig);
  
  // Stop current job if running
  if (backgroundJobInterval) {
    stopBackgroundJobs();
  }

  // Merge with default config
  const updatedConfig = { ...defaultConfig, ...newConfig };

  // Restart with new config
  if (updatedConfig.enabled) {
    startBackgroundJobs(updatedConfig);
  }
}
