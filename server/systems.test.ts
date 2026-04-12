import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateMetrics,
  calculateRiskMetrics,
  analyzeTrades,
  generateAnalyticsReport,
} from './analyticsDashboard';
import { ErrorLogger, ERROR_CODES, AppError } from './errorHandler';
import { getFAQItems, getHelpArticles, searchHelp, markFAQHelpful } from './helpCenter';
import { getCacheStrategy, getMobileOptimizationSettings, estimatePerformanceMetrics } from './mobileOptimization';

describe('Analytics Dashboard', () => {
  it('should calculate metrics correctly', () => {
    const returns = [0.01, 0.02, -0.01, 0.03, 0.015];
    const metrics = calculateMetrics(returns);

    expect(metrics.totalReturn).toBeGreaterThan(0);
    expect(metrics.sharpeRatio).toBeGreaterThan(0);
    expect(metrics.winRate).toBeGreaterThan(0);
  });

  it('should handle empty returns', () => {
    const metrics = calculateMetrics([]);

    expect(metrics.totalReturn).toBe(0);
    expect(metrics.sharpeRatio).toBe(0);
    expect(metrics.maxDrawdown).toBe(0);
  });

  it('should calculate risk metrics', () => {
    const returns = [0.01, 0.02, -0.01, 0.03, 0.015];
    const benchmarkReturns = [0.005, 0.015, -0.005, 0.02, 0.01];
    const riskMetrics = calculateRiskMetrics(returns, benchmarkReturns);

    expect(riskMetrics.volatility).toBeGreaterThan(0);
    expect(riskMetrics.beta).toBeDefined();
    expect(riskMetrics.correlation).toBeDefined();
  });

  it('should analyze trades correctly', () => {
    const trades = [
      { type: 'buy' as const, price: 100, quantity: 10, pnl: 50 },
      { type: 'sell' as const, price: 110, quantity: 10, pnl: -20 },
      { type: 'buy' as const, price: 105, quantity: 10, pnl: 100 },
    ];

    const analysis = analyzeTrades(trades);

    expect(analysis.totalTrades).toBe(3);
    expect(analysis.winningTrades).toBe(2);
    expect(analysis.losingTrades).toBe(1);
    expect(analysis.winRate).toBe(66.66666666666666);
  });

  it('should generate analytics report', () => {
    const returns = [0.01, 0.02, -0.01, 0.03, 0.015];
    const metrics = calculateMetrics(returns);
    const riskMetrics = calculateRiskMetrics(returns, returns);

    const summary = {
      metrics,
      riskMetrics,
      tradeAnalysis: {
        totalTrades: 100,
        winningTrades: 65,
        losingTrades: 35,
        winRate: 65,
        averageWin: 150,
        averageLoss: 100,
        largestWin: 500,
        largestLoss: 300,
        consecutiveWins: 5,
        consecutiveLosses: 3,
        profitFactor: 1.5,
        expectancy: 47.5,
      },
      monthlyReturns: [],
      sectorAllocation: [],
      topPerformers: [],
      worstPerformers: [],
      recentTrades: [],
    };

    const report = generateAnalyticsReport(summary);

    expect(report).toContain('Advanced Analytics Report');
    expect(report).toContain('Performance Metrics');
    expect(report).toContain('Risk Metrics');
  });
});

describe('Error Handler', () => {
  let errorLogger: ErrorLogger;

  beforeEach(() => {
    errorLogger = new ErrorLogger();
  });

  it('should log errors', () => {
    const error = new Error('Test error');
    const log = errorLogger.logError(error);

    expect(log).toBeDefined();
    expect(log.message).toBe('Test error');
    expect(log.resolved).toBe(false);
  });

  it('should log app errors with severity', () => {
    const appError = new AppError('Invalid input', 'VAL_001', 400, 'validation', 'high');
    const log = errorLogger.logError(appError);

    expect(log.severity).toBe('high');
    expect(log.category).toBe('validation');
    expect(log.code).toBe('VAL_001');
  });

  it('should get error metrics', () => {
    errorLogger.logError(new Error('Error 1'));
    errorLogger.logError(new Error('Error 2'));

    const metrics = errorLogger.getMetrics();

    expect(metrics.totalErrors).toBe(2);
    expect(metrics.unresolvedErrors).toBe(2);
  });

  it('should resolve errors', () => {
    const log = errorLogger.logError(new Error('Test error'));
    errorLogger.resolveError(log.id, 'Fixed');

    const metrics = errorLogger.getMetrics();
    expect(metrics.unresolvedErrors).toBe(0);
  });

  it('should generate error report', () => {
    errorLogger.logError(new Error('Test error'));
    const report = errorLogger.generateReport();

    expect(report).toContain('Error Report');
    expect(report).toContain('Total Errors');
  });
});

describe('Help Center', () => {
  it('should get FAQ items', () => {
    const faqs = getFAQItems();

    expect(faqs.length).toBeGreaterThan(0);
    expect(faqs[0]).toHaveProperty('question');
    expect(faqs[0]).toHaveProperty('answer');
  });

  it('should filter FAQ by category', () => {
    const faqs = getFAQItems('getting-started');

    expect(faqs.length).toBeGreaterThan(0);
    expect(faqs.every((faq) => faq.category === 'getting-started')).toBe(true);
  });

  it('should get help articles', () => {
    const articles = getHelpArticles();

    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0]).toHaveProperty('title');
    expect(articles[0]).toHaveProperty('content');
  });

  it('should search help content', () => {
    const results = searchHelp('trading');

    expect(results.articles.length + results.faqs.length).toBeGreaterThan(0);
  });

  it('should mark FAQ as helpful', () => {
    const faqs = getFAQItems();
    const faqId = faqs[0].id;
    const initialHelpful = faqs[0].helpful;

    markFAQHelpful(faqId, true);

    expect(faqs[0].helpful).toBe(initialHelpful + 1);
  });
});

describe('Mobile Optimization', () => {
  it('should get cache strategy', () => {
    const strategy = getCacheStrategy('/api/trpc/stocks');

    expect(strategy).toBeDefined();
    expect(strategy.type).toBe('stale-while-revalidate');
  });

  it('should get mobile optimization settings', () => {
    const settings = getMobileOptimizationSettings();

    expect(settings.enableCompression).toBe(true);
    expect(settings.enableServiceWorker).toBe(true);
    expect(settings.enableOfflineMode).toBe(true);
  });

  it('should estimate performance metrics', () => {
    const metrics = estimatePerformanceMetrics();

    expect(metrics.pageLoadTime).toBeGreaterThan(0);
    expect(metrics.firstContentfulPaint).toBeGreaterThan(0);
    expect(metrics.cumulativeLayoutShift).toBeLessThan(1);
  });
});

describe('Subscription Manager', () => {
  it('should validate subscription tiers', () => {
    const tiers = ['TRIAL', 'FREEMIUM', 'STARTER', 'PRO', 'ELITE'];

    expect(tiers).toContain('TRIAL');
    expect(tiers).toContain('FREEMIUM');
    expect(tiers).toContain('PRO');
  });

  it('should calculate trial expiration', () => {
    const trialStartDate = new Date();
    const expirationDate = new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    expect(expirationDate.getTime() - trialStartDate.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
