import { describe, it, expect } from 'vitest';
import { getSignalTrendByDay } from './db';

describe('getSignalTrendByDay', () => {
  it('should return array of daily data', async () => {
    const result = await getSignalTrendByDay(7);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return correct number of days', async () => {
    const result7 = await getSignalTrendByDay(7);
    const result30 = await getSignalTrendByDay(30);
    
    expect(result7.length).toBeLessThanOrEqual(7);
    expect(result30.length).toBeLessThanOrEqual(30);
  });

  it('should have correct data structure for each day', async () => {
    const result = await getSignalTrendByDay(7);
    
    result.forEach((day) => {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('buyCount');
      expect(day).toHaveProperty('sellCount');
      
      expect(typeof day.date).toBe('string');
      expect(typeof day.buyCount).toBe('number');
      expect(typeof day.sellCount).toBe('number');
    });
  });

  it('should have valid date format (YYYY-MM-DD)', async () => {
    const result = await getSignalTrendByDay(7);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    result.forEach((day) => {
      expect(day.date).toMatch(dateRegex);
    });
  });

  it('should have non-negative counts', async () => {
    const result = await getSignalTrendByDay(7);
    
    result.forEach((day) => {
      expect(day.buyCount).toBeGreaterThanOrEqual(0);
      expect(day.sellCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return data sorted by date', async () => {
    const result = await getSignalTrendByDay(7);
    
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date >= result[i - 1].date).toBe(true);
    }
  });

  it('should handle different time periods', async () => {
    const result1 = await getSignalTrendByDay(1);
    const result7 = await getSignalTrendByDay(7);
    const result30 = await getSignalTrendByDay(30);
    
    expect(result1).toBeDefined();
    expect(result7).toBeDefined();
    expect(result30).toBeDefined();
  });

  it('should return consistent structure across calls', async () => {
    const result1 = await getSignalTrendByDay(7);
    const result2 = await getSignalTrendByDay(7);
    
    expect(result1.length).toBe(result2.length);
    result1.forEach((day, index) => {
      expect(day.date).toBe(result2[index].date);
    });
  });

  it('should handle edge case of 1 day', async () => {
    const result = await getSignalTrendByDay(1);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle large time periods', async () => {
    const result = await getSignalTrendByDay(365);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
    
    result.forEach((day) => {
      expect(day.buyCount).toBeGreaterThanOrEqual(0);
      expect(day.sellCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return data compatible with dashboard visualization', async () => {
    const result = await getSignalTrendByDay(7);
    
    // Dashboard expects these fields for charting
    result.forEach((day) => {
      expect('date' in day).toBe(true);
      expect('buyCount' in day).toBe(true);
      expect('sellCount' in day).toBe(true);
    });
  });
});
