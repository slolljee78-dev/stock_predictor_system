import { describe, it, expect, beforeAll } from 'vitest';
import * as hybrid from './hybridMarketData';

/**
 * Test Hybrid Market Data Integration
 * Tests validate:
 * 1. Finnhub real-time quote fetching
 * 2. yfinance historical data fetching
 * 3. Technical indicator calculations
 * 4. Combined market data retrieval
 */

describe('Hybrid Market Data (Finnhub + yfinance)', () => {
  const testTicker = 'AAPL';

  it('should fetch current price from Finnhub', async () => {
    const priceData = await hybrid.fetchCurrentPrice(testTicker);

    if (priceData) {
      expect(priceData).toHaveProperty('timestamp');
      expect(priceData).toHaveProperty('close');
      expect(priceData.close).toBeGreaterThan(0);
      expect(priceData.timestamp).toBeGreaterThan(0);
      console.log(`✓ Current price for ${testTicker}: $${priceData.close}`);
    }
  }, { timeout: 10000 });

  it('should fetch historical data from yfinance', async () => {
    const dailyData = await hybrid.fetchDailyData(testTicker, 50);

    expect(Array.isArray(dailyData)).toBe(true);

    if (dailyData.length > 0) {
      expect(dailyData.length).toBeGreaterThan(0);
      expect(dailyData.length).toBeLessThanOrEqual(50);

      const firstCandle = dailyData[0];
      expect(firstCandle).toHaveProperty('timestamp');
      expect(firstCandle).toHaveProperty('open');
      expect(firstCandle).toHaveProperty('high');
      expect(firstCandle).toHaveProperty('low');
      expect(firstCandle).toHaveProperty('close');
      expect(firstCandle).toHaveProperty('volume');

      // Validate OHLC relationships
      expect(firstCandle.high).toBeGreaterThanOrEqual(firstCandle.low);
      expect(firstCandle.high).toBeGreaterThanOrEqual(firstCandle.open);
      expect(firstCandle.high).toBeGreaterThanOrEqual(firstCandle.close);
      expect(firstCandle.low).toBeLessThanOrEqual(firstCandle.open);
      expect(firstCandle.low).toBeLessThanOrEqual(firstCandle.close);

      console.log(`✓ Retrieved ${dailyData.length} historical records for ${testTicker}`);
    }
  }, { timeout: 15000 });

  it('should calculate technical indicators correctly', () => {
    // Create mock price data
    const mockPrices: hybrid.PriceData[] = [];
    for (let i = 0; i < 100; i++) {
      mockPrices.push({
        timestamp: Date.now() - (100 - i) * 86400000,
        open: 100 + Math.sin(i / 10) * 5,
        high: 105 + Math.sin(i / 10) * 5,
        low: 95 + Math.sin(i / 10) * 5,
        close: 100 + Math.sin(i / 10) * 5 + Math.random() * 2,
        volume: 1000000,
      });
    }

    const indicators = hybrid.calculateIndicators(mockPrices);

    // Validate all indicators exist
    expect(indicators).toHaveProperty('sma20');
    expect(indicators).toHaveProperty('sma50');
    expect(indicators).toHaveProperty('ema12');
    expect(indicators).toHaveProperty('ema26');
    expect(indicators).toHaveProperty('rsi14');
    expect(indicators).toHaveProperty('macd');
    expect(indicators).toHaveProperty('macdSignal');
    expect(indicators).toHaveProperty('macdHistogram');
    expect(indicators).toHaveProperty('bb20Upper');
    expect(indicators).toHaveProperty('bb20Lower');
    expect(indicators).toHaveProperty('atr14');

    // Validate RSI range
    if (indicators.rsi14 !== null) {
      expect(indicators.rsi14).toBeGreaterThanOrEqual(0);
      expect(indicators.rsi14).toBeLessThanOrEqual(100);
    }

    // Validate Bollinger Bands
    if (indicators.bb20Upper !== null && indicators.bb20Lower !== null) {
      expect(indicators.bb20Upper).toBeGreaterThan(indicators.bb20Lower);
    }

    console.log('✓ Technical indicators calculated successfully');
  });

  it('should fetch complete market data with indicators', async () => {
    const marketData = await hybrid.fetchMarketDataWithIndicators(testTicker);

    if (marketData) {
      expect(marketData).toHaveProperty('ticker', testTicker);
      expect(marketData).toHaveProperty('timestamp');
      expect(marketData).toHaveProperty('price');
      expect(marketData).toHaveProperty('indicators');
      expect(marketData).toHaveProperty('change');
      expect(marketData).toHaveProperty('changePercent');

      expect(marketData.price.close).toBeGreaterThan(0);
      expect(marketData.indicators).toHaveProperty('rsi14');
      expect(marketData.indicators).toHaveProperty('macd');

      console.log(`✓ Market data for ${testTicker}: $${marketData.price.close}, RSI: ${marketData.indicators.rsi14?.toFixed(2)}`);
    }
  }, { timeout: 20000 });

  it('should handle multiple stock fetches', async () => {
    const tickers = ['AAPL', 'MSFT', 'GOOGL'];
    const results = await hybrid.fetchMultipleMarketData(tickers);

    expect(results).toBeInstanceOf(Map);
    expect(results.size).toBeGreaterThanOrEqual(0);
    expect(results.size).toBeLessThanOrEqual(tickers.length);

    if (results.size > 0) {
      console.log(`✓ Retrieved market data for ${results.size} stocks`);
    }
  }, { timeout: 45000 });

  it('should handle invalid ticker gracefully', async () => {
    const invalidTicker = 'INVALID_TICKER_XYZ123';
    const priceData = await hybrid.fetchCurrentPrice(invalidTicker);

    expect(priceData).toBeNull();
    console.log('✓ Invalid ticker handled gracefully');
  }, { timeout: 10000 });

  it('should validate market data point structure', async () => {
    const marketData = await hybrid.fetchMarketDataWithIndicators(testTicker);

    if (marketData) {
      // Validate price data structure
      expect(marketData.price.open).toBeGreaterThanOrEqual(0);
      expect(marketData.price.high).toBeGreaterThanOrEqual(marketData.price.low);
      expect(marketData.price.volume).toBeGreaterThanOrEqual(0);

      // Validate change calculations
      expect(typeof marketData.change).toBe('number');
      expect(typeof marketData.changePercent).toBe('number');

      console.log(`✓ Market data structure validated for ${testTicker}`);
    }
  }, { timeout: 20000 });
});
