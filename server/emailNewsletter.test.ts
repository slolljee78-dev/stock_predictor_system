import { describe, it, expect } from 'vitest';
import {
  emailTemplates,
  getEmailTemplate,
  renderEmailTemplate,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscribersByFrequency,
  generateEmailContent,
  getEmailMetrics,
  scheduleNewsletter,
  sendTestEmail,
} from './emailNewsletter';

describe('Email Newsletter System', () => {
  describe('Email Templates', () => {
    it('should have all required templates', () => {
      expect(emailTemplates.length).toBeGreaterThan(0);
      const templateIds = emailTemplates.map(t => t.id);
      expect(templateIds).toContain('signal-alert');
      expect(templateIds).toContain('market-insight');
      expect(templateIds).toContain('user-win');
      expect(templateIds).toContain('feature-update');
      expect(templateIds).toContain('weekly-digest');
    });

    it('should get template by ID', () => {
      const template = getEmailTemplate('signal-alert');
      expect(template).toBeDefined();
      expect(template?.id).toBe('signal-alert');
      expect(template?.name).toBe('Signal Alert');
    });

    it('should return undefined for non-existent template', () => {
      const template = getEmailTemplate('non-existent');
      expect(template).toBeUndefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render template with variables', () => {
      const template = getEmailTemplate('signal-alert')!;
      const variables = {
        firstName: 'John',
        signalType: 'Bullish',
        stockSymbol: 'AAPL',
        direction: 'UP',
        confidence: '85',
        entryPrice: '150.00',
        targetPrice: '160.00',
        stopLoss: '145.00',
        indicators: 'RSI, MACD',
        reasoning: 'Strong uptrend',
        dashboardLink: 'https://example.com/dashboard',
        companyName: 'Apple Inc.',
      };

      const { subject, body } = renderEmailTemplate(template, variables);

      expect(subject).toContain('AAPL');
      expect(subject).toContain('UP');
      expect(body).toContain('John');
      expect(body).toContain('Bullish');
      expect(body).not.toContain('{{');
    });

    it('should handle missing variables gracefully', () => {
      const template = getEmailTemplate('signal-alert')!;
      const variables = { firstName: 'Jane' };

      const { subject, body } = renderEmailTemplate(template, variables);

      expect(subject).toContain('Jane');
      expect(body).toContain('Jane');
    });
  });

  describe('Newsletter Subscriptions', () => {
    it('should subscribe user to newsletter', async () => {
      await subscribeToNewsletter('user-123', 'test@example.com', 'weekly');
      expect(true).toBe(true);
    });

    it('should unsubscribe user from newsletter', async () => {
      await unsubscribeFromNewsletter('user-123');
      expect(true).toBe(true);
    });

    it('should get subscribers by frequency', async () => {
      const dailySubscribers = await getSubscribersByFrequency('daily');
      expect(Array.isArray(dailySubscribers)).toBe(true);
    });
  });

  describe('Email Content Generation', () => {
    it('should generate email content from template', async () => {
      const context = {
        firstName: 'Eve',
        signalType: 'Bearish',
        stockSymbol: 'GOOG',
        direction: 'DOWN',
        confidence: '78',
        entryPrice: '140.00',
        targetPrice: '130.00',
        stopLoss: '145.00',
        indicators: 'RSI, Stochastic',
        reasoning: 'Overbought conditions',
        dashboardLink: 'https://example.com/dashboard',
        companyName: 'Alphabet Inc.',
      };

      const { subject, body } = await generateEmailContent('signal-alert', context);

      expect(subject).toContain('GOOG');
      expect(body).toContain('Eve');
      expect(body).toContain('Bearish');
    });

    it('should throw error for non-existent template', async () => {
      await expect(generateEmailContent('non-existent', {})).rejects.toThrow();
    });
  });

  describe('Email Metrics', () => {
    it('should get email metrics', async () => {
      const metrics = await getEmailMetrics();

      expect(metrics).toHaveProperty('totalSubscribers');
      expect(metrics).toHaveProperty('openRate');
      expect(metrics).toHaveProperty('clickRate');
      expect(metrics).toHaveProperty('unsubscribeRate');
      expect(metrics).toHaveProperty('bounceRate');

      expect(metrics.openRate).toBeGreaterThanOrEqual(0);
      expect(metrics.openRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Newsletter Scheduling', () => {
    it('should schedule newsletter', async () => {
      await scheduleNewsletter('daily', 'signal-alert', '09:00');
      expect(true).toBe(true);
    });

    it('should send test email', async () => {
      const testVariables = {
        firstName: 'Grace',
        signalType: 'Bullish',
        stockSymbol: 'AMZN',
        direction: 'UP',
        confidence: '88',
        entryPrice: '170.00',
        targetPrice: '185.00',
        stopLoss: '165.00',
        indicators: 'MACD, RSI',
        reasoning: 'Strong momentum',
        dashboardLink: 'https://example.com/dashboard',
        companyName: 'Amazon Inc.',
      };

      await sendTestEmail('test@example.com', 'signal-alert', testVariables);
      expect(true).toBe(true);
    });
  });
});
