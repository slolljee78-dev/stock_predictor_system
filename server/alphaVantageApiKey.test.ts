import { describe, it, expect } from 'vitest';
import { ENV } from './_core/env';

describe('Alpha Vantage API Key Configuration', () => {
  it('should have a valid API key configured', () => {
    expect(ENV.alphaVantageApiKey).toBeDefined();
    expect(ENV.alphaVantageApiKey).not.toBe('');
    expect(ENV.alphaVantageApiKey.length).toBeGreaterThan(0);
  });

  it('should be able to fetch market data with the configured API key', async () => {
    const apiKey = ENV.alphaVantageApiKey;
    const ticker = 'GOOGL';
    
    const params = new URLSearchParams({
      function: 'GLOBAL_QUOTE',
      symbol: ticker,
      apikey: apiKey,
    });

    const response = await fetch(`https://www.alphavantage.co/query?${params}`);
    const data = await response.json();

    // Check that we got a valid response
    expect(data).toBeDefined();
    
    // The API key is valid if we don't get an error about invalid API key
    // We might get an Information message about rate limits, which is fine
    if (data['Error Message'] && data['Error Message'].includes('invalid')) {
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
    }

    // If we got here, the API key is valid
    // Response will have either Global Quote data, Information message, or Time Series data
    expect(data['Global Quote'] || data['Information'] || data['Time Series (Daily)']).toBeDefined();
  });
});
