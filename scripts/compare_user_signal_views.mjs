import { getActiveSignalsForUser } from '../server/db.ts';
import { getWatchlistStatuses } from '../server/watchlistStatuses.ts';

const userId = 1;

const storedSignals = await getActiveSignalsForUser(userId);
const liveStatuses = await getWatchlistStatuses(userId);

const latestByTicker = new Map();
for (const signal of storedSignals) {
  const existing = latestByTicker.get(signal.ticker);
  const signalTime = new Date(signal.createdAt).getTime();
  const existingTime = existing ? new Date(existing.createdAt).getTime() : -Infinity;
  if (!existing || signalTime > existingTime) {
    latestByTicker.set(signal.ticker, signal);
  }
}

console.log('=== Latest stored signals ===');
for (const [ticker, signal] of Array.from(latestByTicker.entries()).sort()) {
  console.log(`${ticker} | ${signal.type} | confidence=${signal.confidenceScore} | createdAt=${new Date(signal.createdAt).toISOString()}`);
}

console.log('\n=== Live watchlist statuses ===');
for (const status of liveStatuses.sort((a, b) => a.ticker.localeCompare(b.ticker))) {
  console.log(`${status.ticker} | ${status.state} | badge=${status.badge} | confidence=${status.confidence} | detail=${status.detail}`);
}

console.log('\n=== Comparison ===');
for (const status of liveStatuses.sort((a, b) => a.ticker.localeCompare(b.ticker))) {
  const signal = latestByTicker.get(status.ticker);
  console.log(`${status.ticker} | stored=${signal ? signal.type : 'none'} | live=${status.state} | storedAt=${signal ? new Date(signal.createdAt).toISOString() : 'n/a'}`);
}
