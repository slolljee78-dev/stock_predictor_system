import { searchStocks, addToWatchlist, getUserWatchlist } from '../server/db.ts';

async function main() {
  const userId = 1;
  const matches = await searchStocks('GOOGL');
  console.log('MATCHES', JSON.stringify(matches, null, 2));

  if (!matches.length) {
    throw new Error('No matches returned for GOOGL');
  }

  const stock = matches[0];
  try {
    await addToWatchlist(userId, {
      stockId: stock.id > 0 ? stock.id : undefined,
      ticker: stock.ticker,
      name: stock.name,
      exchange: stock.exchange,
      type: stock.type,
      currency: stock.currency,
    });
    console.log('ADD_RESULT', 'added');
  } catch (error) {
    console.log('ADD_RESULT', error instanceof Error ? error.message : String(error));
  }

  const watchlist = await getUserWatchlist(userId);
  console.log('WATCHLIST_COUNT', watchlist.length);
  console.log('WATCHLIST_LAST', JSON.stringify(watchlist.at(-1) ?? null, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
