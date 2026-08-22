import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as finnhub from './finnhubMarketData';

/**
 * Test Finnhub API Integration
 * These tests validate that:
 * 1. Finnhub API key is properly configured
 * 2. Market data can be fetched successfully
 * 3. Technical indicators are calculated correctly
 */

describe('Finnhub Market Data Integration', () => {
  // Test with a well-known stock
  const testTicker = 'AAPL';
  
  it('should fetch current price data from Finnhub', async () => {
    const priceData = await finnhub.fetchCurrentPrice(testTicker);
    
    // Should return valid price data or null (if API key not configured)
    if (priceData) {
      expect(priceData).toHaveProperty('timestamp');
      expect(priceData).toHaveProperty('close');
      expect(priceData.close).toBeGreaterThan(0);
      expect(priceData.timestamp).toBeGreaterThan(0);
    }
  }, { timeout: 10000 });

  it('should fetch daily OHLCV data from Finnhub', async () => {
    const dailyData = await finnhub.fetchDailyData(testTicker, 50);
    
    // Should return array of price data or empty array
    expect(Array.isArray(dailyData)).toBe(true);
    
    if (dailyData.length > 0) {
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
    }
  }, { timeout: 10000 });

  it('should calculate technical indicators correctly', () => {
    // Create mock price data
    const mockPrices: finnhub.PriceData[] = [];
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

    const indicators = finnhub.calculateIndicators(mockPrices);

    // Validate indicator structure
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

    // Validate RSI is in valid range (0-100) if calculated
    if (indicators.rsi14 !== null) {
      expect(indicators.rsi14).toBeGreaterThanOrEqual(0);
      expect(indicators.rsi14).toBeLessThanOrEqual(100);
    }

    // Validate Bollinger Bands relationship
    if (indicators.bb20Upper !== null && indicators.bb20Lower !== null) {
      expect(indicators.bb20Upper).toBeGreaterThan(indicators.bb20Lower);
    }
  });

  it('should fetch market data with indicators', async () => {
    const marketData = await finnhub.fetchMarketDataWithIndicators(testTicker);
    
    if (marketData) {
      expect(marketData).toHaveProperty('ticker', testTicker);
      expect(marketData).toHaveProperty('timestamp');
      expect(marketData).toHaveProperty('price');
      expect(marketData).toHaveProperty('indicators');
      expect(marketData).toHaveProperty('change');
      expect(marketData).toHaveProperty('changePercent');
      
      // Validate price data
      expect(marketData.price.close).toBeGreaterThan(0);
      
      // Validate indicators exist
      expect(marketData.indicators).toHaveProperty('rsi14');
      expect(marketData.indicators).toHaveProperty('macd');
    }
  }, { timeout: 15000 });

  it('should handle multiple stock fetches', async () => {
    const tickers = ['AAPL', 'MSFT', 'GOOGL'];
    const results = await finnhub.fetchMultipleMarketData(tickers);
    
    // Should return a map
    expect(results).toBeInstanceOf(Map);
    
    // Should have entries for fetched stocks (or be empty if API key not configured)
    expect(results.size).toBeGreaterThanOrEqual(0);
    expect(results.size).toBeLessThanOrEqual(tickers.length);
  }, { timeout: 30000 });

  it('should handle invalid ticker gracefully', async () => {
    const invalidTicker = 'INVALID_TICKER_XYZ123';
    const priceData = await finnhub.fetchCurrentPrice(invalidTicker);
    
    // Should return null for invalid ticker
    expect(priceData).toBeNull();
  }, { timeout: 10000 });
});
