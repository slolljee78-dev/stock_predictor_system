import { describe, expect, it } from 'vitest';
import { getCuratedStockMatches } from './db';

describe('db curated stock fallback', () => {
  it('returns a curated match for an exact quick-add ticker', () => {
    const matches = getCuratedStockMatches('GOOGL');

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toMatchObject({
      ticker: 'GOOGL',
      name: 'Alphabet Inc. Class A',
      exchange: 'NASDAQ',
      type: 'equity',
      currency: 'USD',
    });
    expect(matches[0].id).toBeLessThan(0);
  });

  it('matches by company name as well as ticker', () => {
    const matches = getCuratedStockMatches('Alphabet');

    expect(matches.some((stock) => stock.ticker === 'GOOGL')).toBe(true);
  });

  it('returns an empty array for blank searches', () => {
    expect(getCuratedStockMatches('   ')).toEqual([]);
  });
});
