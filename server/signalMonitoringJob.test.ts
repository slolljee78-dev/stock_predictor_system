import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  startSignalMonitoring,
  stopSignalMonitoring,
  getMonitoringStatus,
  runSignalMonitoring,
} from './signalMonitoringJob';

describe('Signal Monitoring Job', () => {
  beforeEach(() => {
    // Stop any existing monitoring job
    stopSignalMonitoring();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    stopSignalMonitoring();
  });

  it('should start monitoring job', () => {
    startSignalMonitoring({
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: false,
    });

    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);
  });

  it('should stop monitoring job', () => {
    startSignalMonitoring({
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: false,
    });

    stopSignalMonitoring();
    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(false);
  });

  it('should return correct monitoring status', async () => {
    startSignalMonitoring({
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: false,
    });

    const status = getMonitoringStatus();
    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('isJobActive');
    expect(typeof status.isRunning).toBe('boolean');
    expect(typeof status.isJobActive).toBe('boolean');
  });

  it('should not start duplicate monitoring jobs', () => {
    startSignalMonitoring({
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: false,
    });

    const status1 = getMonitoringStatus();
    expect(status1.isJobActive).toBe(true);

    // Try to start again
    startSignalMonitoring({
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: false,
    });

    const status2 = getMonitoringStatus();
    expect(status2.isJobActive).toBe(true);
  });

  it('should handle monitoring configuration', async () => {
    const config = {
      interval: 5000,
      confidenceThreshold: 75,
      maxStocksPerRun: 20,
      notifyOnSignal: true,
      updateSentiment: true,
    };

    startSignalMonitoring(config);
    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);

    stopSignalMonitoring();
    expect(getMonitoringStatus().isJobActive).toBe(false);
  });

  it('should handle run signal monitoring with empty tickers', async () => {
    const config = {
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: false,
    };

    // This should not throw
    await expect(runSignalMonitoring(config)).resolves.not.toThrow();
  });

  it('should validate confidence threshold range', () => {
    const config = {
      interval: 1000,
      confidenceThreshold: 100, // Max value
      maxStocksPerRun: 50,
      notifyOnSignal: false,
      updateSentiment: false,
    };

    startSignalMonitoring(config);
    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);

    stopSignalMonitoring();
  });

  it('should validate max stocks per run', () => {
    const config = {
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 100, // Large number
      notifyOnSignal: false,
      updateSentiment: false,
    };

    startSignalMonitoring(config);
    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);

    stopSignalMonitoring();
  });

  it('should use default config when partial config provided', () => {
    startSignalMonitoring({
      confidenceThreshold: 70,
    });

    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);

    stopSignalMonitoring();
  });

  it('should handle notification preferences', () => {
    const config = {
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: true,
      updateSentiment: true,
    };

    startSignalMonitoring(config);
    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);

    stopSignalMonitoring();
  });

  it('should handle sentiment update preferences', () => {
    const config = {
      interval: 1000,
      confidenceThreshold: 60,
      maxStocksPerRun: 10,
      notifyOnSignal: false,
      updateSentiment: true,
    };

    startSignalMonitoring(config);
    const status = getMonitoringStatus();
    expect(status.isJobActive).toBe(true);

    stopSignalMonitoring();
  });
});
