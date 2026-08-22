/**
 * Signal Monitoring Job
 * Scheduled background job that monitors stocks and generates real-time signals
 */

import { fetchMarketDataWithIndicators, fetchMultipleMarketData, checkEventFilter } from './hybridMarketData';
import { generateRealtimeSignal, validateSignalStrength } from './realtimeSignalGenerator';
import {
  sendBuySignalNotification,
  sendSellSignalNotification,
  updateAndNotifySentiment,
} from './notificationDelivery';
import { getDb, createSignal } from './db';
import { watchlists, stocks, users } from '../drizzle/schema';
import { eq, sql, inArray } from 'drizzle-orm';

export interface MonitoringConfig {
  interval: number; // milliseconds
  confidenceThreshold: number; // 0-100
  maxStocksPerRun: number;
  notifyOnSignal: boolean;
  updateSentiment: boolean;
}

const DEFAULT_CONFIG: MonitoringConfig = {
  interval: 3600000, // 1 hour (reduced from 5 minutes for cost optimization)
  confidenceThreshold: 60,
  maxStocksPerRun: 50,
  notifyOnSignal: true,
  updateSentiment: true,
};

let monitoringJob: NodeJS.Timeout | null = null;
let isRunning = false;

// Watchlist cache (cost optimization: reduce DB queries)
const watchlistCache = new Map<number, string[]>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes (increased from 30 for cost optimization)
let lastCacheRefresh = 0;

/**
 * Start the signal monitoring job
 */
export function startSignalMonitoring(config: Partial<MonitoringConfig> = {}): void {
  if (monitoringJob) {
    console.log('[Signal Monitor] Job already running');
    return;
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('[Signal Monitor] Starting with config:', finalConfig);

  // Run immediately on start
  runSignalMonitoring(finalConfig);

  // Then schedule periodic runs
  monitoringJob = setInterval(() => {
    runSignalMonitoring(finalConfig);
  }, finalConfig.interval);
}

/**
 * Stop the signal monitoring job
 */
export function stopSignalMonitoring(): void {
  if (monitoringJob) {
    clearInterval(monitoringJob);
    monitoringJob = null;
    console.log('[Signal Monitor] Job stopped');
  }
}

/**
 * Run signal monitoring once
 */
export async function runSignalMonitoring(config: MonitoringConfig): Promise<void> {
  if (isRunning) {
    console.log('[Signal Monitor] Job already running, skipping this cycle');
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    // Cost optimization: Only enable sentiment updates during market hours (9:30 AM - 4:00 PM EST)
    const now = new Date();
    const estHours = now.getHours() - 5; // Convert to EST
    const isMarketHours = estHours >= 9 && estHours < 16;
    const shouldUpdateSentiment = config.updateSentiment && isMarketHours;
    
    if (!isMarketHours && config.updateSentiment) {
      console.log('[Signal Monitor] Sentiment updates disabled outside market hours');
    }

    console.log('[Signal Monitor] Starting monitoring cycle');

    // Get database connection
    const db = await getDb();
    if (!db) {
      console.warn('[Signal Monitor] Database not available, skipping cycle');
      return;
    }

    // Get all users with watchlists
    const usersWithWatchlists = await db
      .selectDistinct({ userId: watchlists.userId })
      .from(watchlists);

    let totalSignalsGenerated = 0;
    let totalNotificationsSent = 0;

    for (const userRecord of usersWithWatchlists) {
      try {
        // Cost optimization: Lazy-load user details - only fetch when needed
        const userId = userRecord.userId;

        // Get user's watchlist from database
        const watchlistRecords = await db
          .select({ ticker: stocks.ticker })
          .from(watchlists)
          .innerJoin(stocks, eq(watchlists.stockId, stocks.id))
          .where(eq(watchlists.userId, userRecord.userId))
          .limit(config.maxStocksPerRun);

        const watchlist = watchlistRecords;

        if (watchlist.length === 0) continue;

        // Extract tickers
        const tickers = watchlist.map((item: any) => item.ticker);

        // Fetch market data for all stocks
        const marketDataMap = await fetchMultipleMarketData(tickers);
        console.log(`[Signal Monitor] Fetched market data for ${marketDataMap.size} stocks`);

        // Batch query all stock IDs for tickers (cost optimization: reduce DB queries)
        const stockRecordsMap = new Map<string, number>();
        if (tickers.length > 0) {
          const allStockRecords = await db
            .select({ id: stocks.id, ticker: stocks.ticker })
            .from(stocks)
            .where(inArray(stocks.ticker, tickers));
          
          for (const record of allStockRecords) {
            stockRecordsMap.set(record.ticker, record.id);
          }
        }

        // Generate signals and send notifications
        for (const [ticker, marketData] of Array.from(marketDataMap.entries())) {
          try {
            // Generate signal
            const signal = generateRealtimeSignal(marketData);
            console.log(`[Signal Monitor] Generated signal for ${ticker}: ${signal.signalType} (confidence: ${signal.confidence})`);

            // ── Earnings / news event filter ──────────────────────────────
            const eventFilter = await checkEventFilter(ticker);
            if (eventFilter.shouldSuppress) {
              console.log(`[Signal Monitor] Signal for ${ticker} SUPPRESSED: ${eventFilter.reason}`);
              continue;
            }

            // Check if signal is strong enough
            if (!validateSignalStrength(signal, config.confidenceThreshold)) {
              console.log(`[Signal Monitor] Signal for ${ticker} rejected: confidence ${signal.confidence} < threshold ${config.confidenceThreshold}`);
              continue;
            }

            totalSignalsGenerated++;

            // Get stock ID from pre-fetched map (cost optimization: no individual DB query)
            const stockId = stockRecordsMap.get(ticker);
            if (!stockId) {
              console.warn(`[Signal Monitor] Stock not found for ticker ${ticker}`);
              continue;
            }

            // Fetch user email once for both notifications and sentiment (cost optimization: lazy-load)
            const userDetails = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
            const userEmail = userDetails?.[0]?.email || '';

            // Persist signal to database
            try {
              await createSignal(
                stockId,
                signal.signalType as 'buy' | 'sell',
                signal.confidence,
                signal.price,
                signal.technicalData,
                `Signal generated at ${new Date().toISOString()}`
              );
              console.log(`[Signal Monitor] Signal persisted for ${ticker}: ${signal.signalType} (confidence: ${signal.confidence})`);
            } catch (dbError) {
              console.error(`[Signal Monitor] Failed to persist signal for ${ticker}:`, dbError);
            }

            // Send notifications if enabled
            if (config.notifyOnSignal) {
              const notificationResult =
                signal.signalType === 'buy'
                  ? await sendBuySignalNotification(
                      {
                        ticker,
                        signalType: 'buy',
                        confidence: signal.confidence,
                        price: signal.price,
                        technicalIndicators: signal.technicalData,
                      },
                      {
                        userId: userId.toString(),
                        userEmail: userEmail,
                        channels: {
                          email: true,
                          push: true,
                          inApp: true,
                        },
                      }
                    )
                  : await sendSellSignalNotification(
                      {
                        ticker,
                        signalType: 'sell',
                        confidence: signal.confidence,
                        price: signal.price,
                        technicalIndicators: signal.technicalData,
                      },
                      {
                        userId: userId.toString(),
                        userEmail: userEmail,
                        channels: {
                          email: true,
                          push: true,
                          inApp: true,
                        },
                      }
                    );

              if (notificationResult.success) {
                totalNotificationsSent++;
              }
            }

            // Update sentiment if enabled and during market hours (cost optimization)
            if (shouldUpdateSentiment) {
              try {
                await updateAndNotifySentiment(
                  ticker,
                  {
                    userId: userId.toString(),
                    userEmail: userEmail,
                    channels: {
                      email: true,
                      push: true,
                      inApp: true,
                    },
                  }
                );
              } catch (error) {
                console.error(`[Signal Monitor] Error updating sentiment for ${ticker}:`, error);
              }
            }
          } catch (error) {
            console.error(`[Signal Monitor] Error processing signal for ${ticker}:`, error);
          }
        }
      } catch (error) {
        console.error(`[Signal Monitor] Error processing user ${userRecord.userId}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Signal Monitor] Cycle complete: ${totalSignalsGenerated} signals generated, ${totalNotificationsSent} notifications sent (${duration}ms)`
    );
  } catch (error) {
    console.error('[Signal Monitor] Error in monitoring cycle:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Get monitoring status
 */
export function getMonitoringStatus(): {
  isRunning: boolean;
  isJobActive: boolean;
} {
  return {
    isRunning,
    isJobActive: monitoringJob !== null,
  };
}

/**
 * Manually trigger signal monitoring for specific stocks
 */
export async function monitorSpecificStocks(
  tickers: string[],
  userId: string,
  userEmail: string,
  config: Partial<MonitoringConfig> = {}
): Promise<Array<{ ticker: string; signal: string; confidence: number }>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const results = [];

  try {
    // Fetch market data
    const marketDataMap = await fetchMultipleMarketData(tickers);

    // Generate signals
    for (const [ticker, marketData] of Array.from(marketDataMap.entries())) {
      const signal = generateRealtimeSignal(marketData);

      if (validateSignalStrength(signal, finalConfig.confidenceThreshold)) {
        results.push({
          ticker,
          signal: signal.signalType,
          confidence: signal.confidence,
        });

        // Send notifications
        if (finalConfig.notifyOnSignal) {
          signal.signalType === 'buy'
            ? await sendBuySignalNotification(
                {
                  ticker,
                  signalType: 'buy',
                  confidence: signal.confidence,
                  price: signal.price,
                  technicalIndicators: signal.technicalData,
                },
                {
                  userId,
                  userEmail,
                  channels: {
                    email: true,
                    push: true,
                    inApp: true,
                  },
                }
              )
            : await sendSellSignalNotification(
                {
                  ticker,
                  signalType: 'sell',
                  confidence: signal.confidence,
                  price: signal.price,
                  technicalIndicators: signal.technicalData,
                },
                {
                  userId,
                  userEmail,
                  channels: {
                    email: true,
                    push: true,
                    inApp: true,
                  },
                }
              );
        }
      }
    }
  } catch (error) {
    console.error('[Signal Monitor] Error monitoring specific stocks:', error);
  }

  return results;
}
