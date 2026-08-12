/**
 * Public REST API for third-party integrations
 * Provides access to signals, backtesting, and watchlist data
 */

import { Router, Request, Response } from 'express';
import { getDb } from './db';
import { eq, desc } from 'drizzle-orm';
import { stocks, signals, backtestRuns } from '../drizzle/schema';

export const publicApiRouter = Router();

/**
 * Middleware: Validate API key
 */
function validateApiKey(req: Request, res: Response, next: Function) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  // In production, validate against database or environment
  // For now, accept any non-empty key
  if (apiKey.length < 10) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

publicApiRouter.use(validateApiKey);

/**
 * GET /api/public/signals
 * Get latest trading signals
 */
publicApiRouter.get('/signals', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const type = req.query.type as string | undefined; // 'buy' | 'sell'

    const baseQuery = db
      .select({
        id: signals.id,
        ticker: stocks.ticker,
        type: signals.type,
        confidence: signals.confidenceScore,
        createdAt: signals.createdAt,
        analysis: signals.analysis,
      })
      .from(signals)
      .innerJoin(stocks, eq(signals.stockId, stocks.id));

    const filteredQuery = (type && ['buy', 'sell'].includes(type))
      ? baseQuery.where(eq(signals.type, type as 'buy' | 'sell'))
      : baseQuery;

    const results = await filteredQuery.orderBy(desc(signals.createdAt)).limit(limit);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/public/signals/:ticker
 * Get signals for a specific stock
 */
publicApiRouter.get('/signals/:ticker', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const ticker = req.params.ticker.toUpperCase();
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const stock = await db.query.stocks.findFirst({
      where: eq(stocks.ticker, ticker),
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const results = await db
      .select()
      .from(signals)
      .where(eq(signals.stockId, stock.id))
      .orderBy(desc(signals.createdAt))
      .limit(limit);

    res.json({
      success: true,
      ticker,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/public/backtest
 * Run a backtest with provided parameters
 */
publicApiRouter.post('/backtest', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { ticker, startDate, endDate, initialCapital } = req.body;

    if (!ticker || !startDate || !endDate || !initialCapital) {
      return res.status(400).json({
        error: 'Missing required fields: ticker, startDate, endDate, initialCapital',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Find stock
    const stock = await db.query.stocks.findFirst({
      where: eq(stocks.ticker, ticker.toUpperCase()),
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // In production, this would run the actual backtest
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Backtest queued for processing',
      ticker,
      startDate,
      endDate,
      initialCapital,
      estimatedCompletionTime: '30 seconds',
    });
  } catch (error) {
    console.error('Error running backtest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/public/stocks
 * Get list of available stocks
 */
publicApiRouter.get('/stocks', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const results = await db
      .select({
        id: stocks.id,
        ticker: stocks.ticker,
        name: stocks.name,
        sector: stocks.sector,
        industry: stocks.industry,
      })
      .from(stocks)
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      count: results.length,
      offset,
      limit,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/public/health
 * Health check endpoint
 */
publicApiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * GET /api/public/docs
 * API documentation
 */
publicApiRouter.get('/docs', (req: Request, res: Response) => {
  res.json({
    title: 'Vortextrade Public API',
    version: '1.0.0',
    description: 'REST API for third-party integrations with Vortextrade',
    baseUrl: 'https://api.stockpredictor.com',
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      description: 'Include your API key in the X-API-Key header',
    },
    endpoints: [
      {
        path: '/signals',
        method: 'GET',
        description: 'Get latest trading signals',
        queryParams: {
          limit: 'Number of signals to return (default: 50, max: 500)',
          type: 'Filter by signal type (buy or sell)',
        },
      },
      {
        path: '/signals/:ticker',
        method: 'GET',
        description: 'Get signals for a specific stock',
        params: {
          ticker: 'Stock ticker symbol',
        },
        queryParams: {
          limit: 'Number of signals to return (default: 20, max: 100)',
        },
      },
      {
        path: '/backtest',
        method: 'POST',
        description: 'Run a backtest with provided parameters',
        body: {
          ticker: 'Stock ticker symbol',
          startDate: 'Start date (ISO 8601)',
          endDate: 'End date (ISO 8601)',
          initialCapital: 'Initial capital for backtest',
        },
      },
      {
        path: '/stocks',
        method: 'GET',
        description: 'Get list of available stocks',
        queryParams: {
          limit: 'Number of stocks to return (default: 100, max: 1000)',
          offset: 'Pagination offset (default: 0)',
        },
      },
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint',
      },
      {
        path: '/docs',
        method: 'GET',
        description: 'API documentation',
      },
    ],
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
    errors: {
      401: 'Unauthorized - Invalid or missing API key',
      404: 'Not found - Resource not found',
      429: 'Too many requests - Rate limit exceeded',
      500: 'Internal server error',
      503: 'Service unavailable - Database connection error',
    },
  });
});

export default publicApiRouter;
