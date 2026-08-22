import { describe, it, expect } from 'vitest';
import {
  getTrafficMetrics,
  getConversionFunnel,
  getUserSegments,
  getRevenueMetrics,
  getMarketingMetrics,
  getProductMetrics,
  getDashboardSummary,
  exportAnalyticsData,
} from './analyticsTracking';

describe('Analytics Tracking System', () => {
  describe('Traffic Metrics', () => {
    it('should get traffic metrics', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const metrics = await getTrafficMetrics(startDate, endDate);

      expect(metrics).toHaveProperty('totalVisitors');
      expect(metrics).toHaveProperty('uniqueUsers');
      expect(metrics).toHaveProperty('pageViews');
      expect(metrics).toHaveProperty('bounceRate');
      expect(metrics).toHaveProperty('avgSessionDuration');
      expect(metrics).toHaveProperty('conversionRate');
      expect(metrics).toHaveProperty('topPages');
      expect(metrics).toHaveProperty('trafficSources');
      expect(metrics).toHaveProperty('deviceBreakdown');
    });

    it('should have valid traffic metrics values', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const metrics = await getTrafficMetrics(startDate, endDate);

      expect(metrics.totalVisitors).toBeGreaterThan(0);
      expect(metrics.uniqueUsers).toBeGreaterThan(0);
      expect(metrics.pageViews).toBeGreaterThan(0);
      expect(metrics.bounceRate).toBeGreaterThanOrEqual(0);
      expect(metrics.bounceRate).toBeLessThanOrEqual(1);
      expect(metrics.avgSessionDuration).toBeGreaterThan(0);
      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeLessThanOrEqual(1);
    });

    it('should have top pages', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const metrics = await getTrafficMetrics(startDate, endDate);

      expect(metrics.topPages.length).toBeGreaterThan(0);
      expect(metrics.topPages[0]).toHaveProperty('page');
      expect(metrics.topPages[0]).toHaveProperty('views');
    });

    it('should have traffic sources', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const metrics = await getTrafficMetrics(startDate, endDate);

      expect(metrics.trafficSources.length).toBeGreaterThan(0);
      expect(metrics.trafficSources[0]).toHaveProperty('source');
      expect(metrics.trafficSources[0]).toHaveProperty('visitors');
    });

    it('should have device breakdown', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const metrics = await getTrafficMetrics(startDate, endDate);

      expect(metrics.deviceBreakdown.length).toBeGreaterThan(0);
      const totalPercentage = metrics.deviceBreakdown.reduce((sum, d) => sum + d.percentage, 0);
      expect(totalPercentage).toBeCloseTo(1.0, 1);
    });
  });

  describe('Conversion Funnel', () => {
    it('should get conversion funnel', async () => {
      const funnel = await getConversionFunnel();

      expect(funnel).toBeInstanceOf(Array);
      expect(funnel.length).toBeGreaterThan(0);
    });

    it('should have valid funnel steps', async () => {
      const funnel = await getConversionFunnel();

      funnel.forEach(step => {
        expect(step).toHaveProperty('step');
        expect(step).toHaveProperty('users');
        expect(step).toHaveProperty('conversionRate');
        expect(step.users).toBeGreaterThan(0);
        expect(step.conversionRate).toBeGreaterThanOrEqual(0);
        expect(step.conversionRate).toBeLessThanOrEqual(1);
      });
    });

    it('should have decreasing user count through funnel', async () => {
      const funnel = await getConversionFunnel();

      for (let i = 1; i < funnel.length; i++) {
        expect(funnel[i].users).toBeLessThanOrEqual(funnel[i - 1].users);
      }
    });
  });

  describe('User Segments', () => {
    it('should get user segments', async () => {
      const segments = await getUserSegments();

      expect(segments).toBeInstanceOf(Array);
      expect(segments.length).toBeGreaterThan(0);
    });

    it('should have valid segment properties', async () => {
      const segments = await getUserSegments();

      segments.forEach(segment => {
        expect(segment).toHaveProperty('name');
        expect(segment).toHaveProperty('criteria');
        expect(segment).toHaveProperty('userCount');
        expect(segment).toHaveProperty('avgLifetimeValue');
        expect(segment).toHaveProperty('churnRate');
        expect(segment.userCount).toBeGreaterThanOrEqual(0);
        expect(segment.churnRate).toBeGreaterThanOrEqual(0);
        expect(segment.churnRate).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Revenue Metrics', () => {
    it('should get revenue metrics', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const revenue = await getRevenueMetrics(startDate, endDate);

      expect(revenue).toHaveProperty('totalRevenue');
      expect(revenue).toHaveProperty('mrr');
      expect(revenue).toHaveProperty('arr');
      expect(revenue).toHaveProperty('premiumSubscribers');
      expect(revenue).toHaveProperty('churnRate');
      expect(revenue).toHaveProperty('ltv');
      expect(revenue).toHaveProperty('cac');
      expect(revenue).toHaveProperty('ltv_cac_ratio');
    });

    it('should have valid revenue metrics', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const revenue = await getRevenueMetrics(startDate, endDate);

      expect(revenue.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(revenue.mrr).toBeGreaterThanOrEqual(0);
      expect(revenue.arr).toBeGreaterThanOrEqual(0);
      expect(revenue.premiumSubscribers).toBeGreaterThanOrEqual(0);
      expect(revenue.churnRate).toBeGreaterThanOrEqual(0);
      expect(revenue.churnRate).toBeLessThanOrEqual(1);
      expect(revenue.ltv_cac_ratio).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Marketing Metrics', () => {
    it('should get marketing metrics', async () => {
      const marketing = await getMarketingMetrics();

      expect(marketing).toHaveProperty('emailMetrics');
      expect(marketing).toHaveProperty('socialMetrics');
      expect(marketing).toHaveProperty('seoMetrics');
      expect(marketing).toHaveProperty('paidMetrics');
    });

    it('should have valid email metrics', async () => {
      const marketing = await getMarketingMetrics();

      expect(marketing.emailMetrics.openRate).toBeGreaterThanOrEqual(0);
      expect(marketing.emailMetrics.openRate).toBeLessThanOrEqual(1);
      expect(marketing.emailMetrics.clickRate).toBeGreaterThanOrEqual(0);
      expect(marketing.emailMetrics.clickRate).toBeLessThanOrEqual(1);
    });

    it('should have valid paid metrics', async () => {
      const marketing = await getMarketingMetrics();

      expect(marketing.paidMetrics.ctr).toBeGreaterThanOrEqual(0);
      expect(marketing.paidMetrics.cpc).toBeGreaterThanOrEqual(0);
      expect(marketing.paidMetrics.roas).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Product Metrics', () => {
    it('should get product metrics', async () => {
      const product = await getProductMetrics();

      expect(product).toHaveProperty('signalAccuracy');
      expect(product).toHaveProperty('userSatisfaction');
      expect(product).toHaveProperty('technicalMetrics');
    });

    it('should have valid signal accuracy', async () => {
      const product = await getProductMetrics();

      expect(product.signalAccuracy.bullishWinRate).toBeGreaterThanOrEqual(0);
      expect(product.signalAccuracy.bullishWinRate).toBeLessThanOrEqual(1);
      expect(product.signalAccuracy.bearishWinRate).toBeGreaterThanOrEqual(0);
      expect(product.signalAccuracy.bearishWinRate).toBeLessThanOrEqual(1);
    });

    it('should have valid user satisfaction scores', async () => {
      const product = await getProductMetrics();

      expect(product.userSatisfaction.nps).toBeGreaterThanOrEqual(-100);
      expect(product.userSatisfaction.nps).toBeLessThanOrEqual(100);
      expect(product.userSatisfaction.csat).toBeGreaterThanOrEqual(0);
      expect(product.userSatisfaction.csat).toBeLessThanOrEqual(5);
    });

    it('should have valid technical metrics', async () => {
      const product = await getProductMetrics();

      expect(product.technicalMetrics.uptime).toBeGreaterThanOrEqual(0);
      expect(product.technicalMetrics.uptime).toBeLessThanOrEqual(1);
      expect(product.technicalMetrics.avgResponseTime).toBeGreaterThanOrEqual(0);
      expect(product.technicalMetrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(product.technicalMetrics.errorRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Dashboard Summary', () => {
    it('should get dashboard summary', async () => {
      const summary = await getDashboardSummary();

      expect(summary).toHaveProperty('traffic');
      expect(summary).toHaveProperty('conversion');
      expect(summary).toHaveProperty('revenue');
      expect(summary).toHaveProperty('product');
      expect(summary).toHaveProperty('marketing');
      expect(summary).toHaveProperty('timestamp');
    });
  });

  describe('Analytics Export', () => {
    it('should export analytics data as JSON', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const jsonData = await exportAnalyticsData('json', { start: startDate, end: endDate });

      expect(typeof jsonData).toBe('string');
      const parsed = JSON.parse(jsonData);
      expect(parsed).toHaveProperty('totalVisitors');
    });

    it('should export analytics data as CSV', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const csvData = await exportAnalyticsData('csv', { start: startDate, end: endDate });

      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Metric');
      expect(csvData).toContain('Value');
    });
  });
});
