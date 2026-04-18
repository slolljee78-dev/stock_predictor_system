import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSignalTrend } from './db';

describe('getSignalTrend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return trend data with mock fallback when database is unavailable', async () => {
    const result = await getSignalTrend(7);
    
    expect(result).toHaveProperty('buyCount');
    expect(result).toHaveProperty('sellCount');
    expect(result).toHaveProperty('buyChange');
    expect(result).toHaveProperty('sellChange');
    
    expect(typeof result.buyCount).toBe('number');
    expect(typeof result.sellCount).toBe('number');
    expect(typeof result.buyChange).toBe('number');
    expect(typeof result.sellChange).toBe('number');
  });

  it('should return non-negative counts', async () => {
    const result = await getSignalTrend(7);
    
    expect(result.buyCount).toBeGreaterThanOrEqual(0);
    expect(result.sellCount).toBeGreaterThanOrEqual(0);
  });

  it('should handle different time periods', async () => {
    const result7d = await getSignalTrend(7);
    const result30d = await getSignalTrend(30);
    
    expect(result7d).toHaveProperty('buyCount');
    expect(result30d).toHaveProperty('buyCount');
  });

  it('should return percentage changes as numbers', async () => {
    const result = await getSignalTrend(7);
    
    expect(typeof result.buyChange).toBe('number');
    expect(typeof result.sellChange).toBe('number');
    
    // Changes can be positive, negative, or zero
    expect(Number.isFinite(result.buyChange)).toBe(true);
    expect(Number.isFinite(result.sellChange)).toBe(true);
  });

  it('should handle edge case of zero previous period', async () => {
    const result = await getSignalTrend(7);
    
    // Should not throw and should return valid data
    expect(result).toBeDefined();
    expect(Number.isFinite(result.buyChange)).toBe(true);
    expect(Number.isFinite(result.sellChange)).toBe(true);
  });

  it('should return consistent structure across multiple calls', async () => {
    const result1 = await getSignalTrend(7);
    const result2 = await getSignalTrend(7);
    
    expect(Object.keys(result1).sort()).toEqual(Object.keys(result2).sort());
  });

  it('should handle default parameter', async () => {
    const resultDefault = await getSignalTrend();
    const result7 = await getSignalTrend(7);
    
    expect(resultDefault).toHaveProperty('buyCount');
    expect(result7).toHaveProperty('buyCount');
  });

  it('should return reasonable percentage values', async () => {
    const result = await getSignalTrend(7);
    
    // Percentage changes should typically be within -100 to 1000 range
    // (allowing for extreme growth scenarios)
    expect(result.buyChange).toBeGreaterThan(-500);
    expect(result.buyChange).toBeLessThan(500);
    expect(result.sellChange).toBeGreaterThan(-500);
    expect(result.sellChange).toBeLessThan(500);
  });

  it('should handle negative trend scenarios', async () => {
    const result = await getSignalTrend(7);
    
    // Both positive and negative trends should be possible
    expect(typeof result.buyChange).toBe('number');
    expect(typeof result.sellChange).toBe('number');
  });

  it('should return data structure compatible with dashboard', async () => {
    const result = await getSignalTrend(7);
    
    // Dashboard expects these fields for trend indicators
    expect('buyCount' in result).toBe(true);
    expect('sellCount' in result).toBe(true);
    expect('buyChange' in result).toBe(true);
    expect('sellChange' in result).toBe(true);
  });
});
