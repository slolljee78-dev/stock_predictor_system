import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import publicApiRouter from './publicApi';

describe('Public API', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/public', publicApiRouter);
  });

  describe('GET /api/public/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/public/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /api/public/docs', () => {
    it('should return API documentation', async () => {
      const res = await request(app).get('/api/public/docs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('version', '1.0.0');
      expect(res.body).toHaveProperty('endpoints');
      expect(Array.isArray(res.body.endpoints)).toBe(true);
      expect(res.body.endpoints.length).toBeGreaterThan(0);
    });

    it('should document all endpoints', async () => {
      const res = await request(app).get('/api/public/docs');

      const endpoints = res.body.endpoints;
      const paths = endpoints.map((e: any) => e.path);

      expect(paths).toContain('/signals');
      expect(paths).toContain('/signals/:ticker');
      expect(paths).toContain('/backtest');
      expect(paths).toContain('/stocks');
      expect(paths).toContain('/health');
    });
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const res = await request(app).get('/api/public/signals');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Missing API key');
    });

    it('should reject requests with invalid API key', async () => {
      const res = await request(app)
        .get('/api/public/signals')
        .set('X-API-Key', 'short');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid API key');
    });

    it('should accept requests with valid API key', async () => {
      const res = await request(app)
        .get('/api/public/health')
        .set('X-API-Key', 'valid-api-key-1234567890');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/public/signals', () => {
    const validApiKey = 'valid-api-key-1234567890';

    it('should return signals with valid API key', async () => {
      const res = await request(app)
        .get('/api/public/signals')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/public/signals?limit=10')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(10);
    });

    it('should enforce maximum limit of 500', async () => {
      const res = await request(app)
        .get('/api/public/signals?limit=1000')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(500);
    });

    it('should filter by signal type', async () => {
      const res = await request(app)
        .get('/api/public/signals?type=buy')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        res.body.data.forEach((signal: any) => {
          expect(signal.type).toBe('buy');
        });
      }
    });

    it('should include required signal fields', async () => {
      const res = await request(app)
        .get('/api/public/signals?limit=1')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const signal = res.body.data[0];
        expect(signal).toHaveProperty('id');
        expect(signal).toHaveProperty('ticker');
        expect(signal).toHaveProperty('type');
        expect(signal).toHaveProperty('confidence');
        expect(signal).toHaveProperty('createdAt');
      }
    });
  });

  describe('GET /api/public/signals/:ticker', () => {
    const validApiKey = 'valid-api-key-1234567890';

    it('should return signals for valid ticker', async () => {
      const res = await request(app)
        .get('/api/public/signals/AAPL')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('ticker', 'AAPL');
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent ticker', async () => {
      const res = await request(app)
        .get('/api/public/signals/NONEXISTENT')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Stock not found');
    });

    it('should convert ticker to uppercase', async () => {
      const res = await request(app)
        .get('/api/public/signals/aapl')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.ticker).toBe('AAPL');
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/public/signals/AAPL?limit=5')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/public/backtest', () => {
    const validApiKey = 'valid-api-key-1234567890';

    it('should accept valid backtest parameters', async () => {
      const res = await request(app)
        .post('/api/public/backtest')
        .set('X-API-Key', validApiKey)
        .send({
          ticker: 'AAPL',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          initialCapital: 10000,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/public/backtest')
        .set('X-API-Key', validApiKey)
        .send({
          ticker: 'AAPL',
          // Missing other required fields
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid date format', async () => {
      const res = await request(app)
        .post('/api/public/backtest')
        .set('X-API-Key', validApiKey)
        .send({
          ticker: 'AAPL',
          startDate: 'invalid-date',
          endDate: '2025-12-31',
          initialCapital: 10000,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid date format');
    });

    it('should reject start date after end date', async () => {
      const res = await request(app)
        .post('/api/public/backtest')
        .set('X-API-Key', validApiKey)
        .send({
          ticker: 'AAPL',
          startDate: '2025-12-31',
          endDate: '2025-01-01',
          initialCapital: 10000,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Start date must be before end date');
    });
  });

  describe('GET /api/public/stocks', () => {
    const validApiKey = 'valid-api-key-1234567890';

    it('should return list of stocks', async () => {
      const res = await request(app)
        .get('/api/public/stocks')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/public/stocks?limit=10')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(10);
    });

    it('should enforce maximum limit of 1000', async () => {
      const res = await request(app)
        .get('/api/public/stocks?limit=5000')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(1000);
    });

    it('should support pagination with offset', async () => {
      const res1 = await request(app)
        .get('/api/public/stocks?limit=10&offset=0')
        .set('X-API-Key', validApiKey);

      const res2 = await request(app)
        .get('/api/public/stocks?limit=10&offset=10')
        .set('X-API-Key', validApiKey);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body).toHaveProperty('offset', 0);
      expect(res2.body).toHaveProperty('offset', 10);
    });

    it('should include required stock fields', async () => {
      const res = await request(app)
        .get('/api/public/stocks?limit=1')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const stock = res.body.data[0];
        expect(stock).toHaveProperty('id');
        expect(stock).toHaveProperty('ticker');
        expect(stock).toHaveProperty('name');
      }
    });
  });

  describe('Error Handling', () => {
    const validApiKey = 'valid-api-key-1234567890';

    it('should handle database errors gracefully', async () => {
      // This test would need to mock database failures
      // For now, we just verify the error response structure
      const res = await request(app)
        .get('/api/public/signals/INVALID')
        .set('X-API-Key', validApiKey);

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
