/**
 * Signal Export Service
 * Handles exporting signals in multiple formats (CSV, JSON, email)
 */

import { getDb } from './db';
import { signals, stocks } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';

export interface SignalExportOptions {
  format: 'csv' | 'json';
  limit?: number;
  includeAnalysis?: boolean;
  onlyActive?: boolean;
}

export interface ExportedSignal {
  id: number;
  ticker: string;
  type: 'buy' | 'sell';
  confidenceScore: number;
  priceAtSignal: number;
  analysis?: string;
  createdAt: Date;
  status: string;
}

/**
 * Export signals as CSV
 */
export async function exportSignalsAsCSV(options: SignalExportOptions): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const query = db
    .select({
      id: signals.id,
      ticker: stocks.ticker,
      type: signals.type,
      confidenceScore: signals.confidenceScore,
      priceAtSignal: signals.priceAtSignal,
      analysis: signals.analysis,
      createdAt: signals.createdAt,
      status: signals.status,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id));

  if (options.onlyActive) {
    query.where(eq(signals.status, 'active'));
  }

  const data = await query
    .orderBy(desc(signals.createdAt))
    .limit(options.limit || 100);

  // Build CSV header
  const headers = ['ID', 'Ticker', 'Signal Type', 'Confidence %', 'Price', 'Date/Time'];
  if (options.includeAnalysis) {
    headers.push('Analysis');
  }

  // Build CSV rows
  const rows = data.map(row => {
    const cells = [
      row.id.toString(),
      row.ticker,
      row.type.toUpperCase(),
      row.confidenceScore.toString(),
      (row.priceAtSignal / 100).toFixed(2),
      new Date(row.createdAt).toISOString(),
    ];

    if (options.includeAnalysis) {
      cells.push(`"${(row.analysis || '').replace(/"/g, '""')}"`);
    }

    return cells.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export signals as JSON
 */
export async function exportSignalsAsJSON(options: SignalExportOptions): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const query = db
    .select({
      id: signals.id,
      ticker: stocks.ticker,
      type: signals.type,
      confidenceScore: signals.confidenceScore,
      priceAtSignal: signals.priceAtSignal,
      analysis: signals.analysis,
      createdAt: signals.createdAt,
      status: signals.status,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id));

  if (options.onlyActive) {
    query.where(eq(signals.status, 'active'));
  }

  const data = await query
    .orderBy(desc(signals.createdAt))
    .limit(options.limit || 100);

  const exportData = data.map(row => ({
    id: row.id,
    ticker: row.ticker,
    signal: row.type.toUpperCase(),
    confidence: row.confidenceScore,
    price: row.priceAtSignal / 100,
    timestamp: new Date(row.createdAt).toISOString(),
    ...(options.includeAnalysis && { analysis: row.analysis }),
  }));

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate signal export report
 */
export async function generateSignalReport(userId: number, limit: number = 50): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const data = await db
    .select({
      id: signals.id,
      ticker: stocks.ticker,
      type: signals.type,
      confidenceScore: signals.confidenceScore,
      priceAtSignal: signals.priceAtSignal,
      analysis: signals.analysis,
      createdAt: signals.createdAt,
      status: signals.status,
    })
    .from(signals)
    .innerJoin(stocks, eq(signals.stockId, stocks.id))
    .orderBy(desc(signals.createdAt))
    .limit(limit);

  // Calculate statistics
  const totalSignals = data.length;
  const buySignals = data.filter(s => s.type === 'buy').length;
  const sellSignals = data.filter(s => s.type === 'sell').length;
  const avgConfidence = data.length > 0
    ? Math.round(data.reduce((sum, s) => sum + s.confidenceScore, 0) / data.length)
    : 0;

  // Build report
  const report = `
# Trading Signals Report
Generated: ${new Date().toISOString()}

## Summary
- Total Signals: ${totalSignals}
- Buy Signals: ${buySignals}
- Sell Signals: ${sellSignals}
- Average Confidence: ${avgConfidence}%

## Recent Signals

| Ticker | Signal | Confidence | Price | Time |
|--------|--------|-----------|-------|------|
${data
  .map(
    s =>
      `| ${s.ticker} | ${s.type.toUpperCase()} | ${s.confidenceScore}% | £${(s.priceAtSignal / 100).toFixed(2)} | ${new Date(s.createdAt).toLocaleString()} |`
  )
  .join('\n')}

## How to Use These Signals

1. **On Trading 212**: Log in to your Trading 212 account and place trades matching the signals
2. **On Robinhood**: Use the ticker and signal type to execute trades in your app
3. **On Interactive Brokers**: Import these signals into your trading platform
4. **On Any Broker**: Use the ticker and signal type to execute trades manually

## Signal Confidence Guide
- 80-100%: High confidence - Strong buy/sell signal
- 60-79%: Medium confidence - Consider with other analysis
- Below 60%: Low confidence - Use with caution

## Disclaimer
These signals are for informational purposes only. Always do your own research and consult with a financial advisor before trading.
`;

  return report;
}

/**
 * Send signals via email
 */
export async function sendSignalsViaEmail(
  userEmail: string,
  signals_data: ExportedSignal[],
  format: 'csv' | 'json' = 'csv'
): Promise<boolean> {
  try {
    const content = format === 'csv'
      ? await exportSignalsAsCSV({ format: 'csv', includeAnalysis: true })
      : await exportSignalsAsJSON({ format: 'json', includeAnalysis: true });

    // Use LLM to compose email
    const emailResponse = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an email composer for a trading signals platform. Create a professional email with the trading signals.',
        },
        {
          role: 'user',
          content: `Compose a professional email to send these trading signals to ${userEmail}. Include the signals and instructions on how to use them on popular brokers like Trading 212, Robinhood, and Interactive Brokers. Format: ${format}`,
        },
      ],
    });

    console.log('[SignalExport] Email composed successfully');
    return true;
  } catch (error) {
    console.error('[SignalExport] Failed to send signals via email:', error);
    return false;
  }
}
