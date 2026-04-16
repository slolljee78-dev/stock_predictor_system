# Stock Predictor API Documentation

## Overview

The Stock Predictor system provides a comprehensive tRPC API for stock analysis, trading signals, portfolio management, and paper trading validation.

## Base URL

```
https://manuspredictor-knj3qkdj.manus.space/api/trpc
```

## Authentication

All API endpoints require authentication via Manus OAuth. The session is maintained via HTTP-only cookies.

## API Endpoints

### Stock Analysis

#### Get Stock Details
```
stocks.getDetails(ticker: string)
```
Returns detailed information about a stock including price, technical indicators, and signals.

**Response:**
```json
{
  "id": 1,
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "price": 15050,
  "priceChange": 150,
  "priceChangePercent": 1.0,
  "volume": 50000000,
  "marketCap": 2800000000000,
  "sector": "Technology",
  "exchange": "NASDAQ"
}
```

#### Search Stocks
```
stocks.search(query: string)
```
Search for stocks by ticker or name.

**Response:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ"
  }
]
```

### Trading Signals

#### Get Signals for Stock
```
signals.getByTicker(ticker: string)
```
Get all active trading signals for a specific stock.

**Response:**
```json
{
  "buySignals": 2,
  "sellSignals": 0,
  "signals": [
    {
      "id": 1,
      "type": "buy",
      "confidenceScore": 85,
      "priceAtSignal": 15000,
      "indicators": {
        "rsi": 65,
        "macd": "bullish",
        "bbands": "oversold"
      },
      "createdAt": "2026-04-16T10:30:00Z"
    }
  ]
}
```

### Watchlist Management

#### Add Stock to Watchlist
```
watchlist.add(stockId: number)
```
Add a stock to the user's watchlist.

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "stockId": 1,
  "createdAt": "2026-04-16T10:30:00Z"
}
```

#### Get Watchlist
```
watchlist.get()
```
Get all stocks in the user's watchlist.

**Response:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "price": 15050,
    "buySignals": 2,
    "sellSignals": 0
  }
]
```

#### Remove from Watchlist
```
watchlist.remove(watchlistId: number)
```
Remove a stock from the user's watchlist.

#### Update Preferences
```
watchlist.updatePreferences(watchlistId: number, preferences: {
  alertOnBuy?: boolean,
  alertOnSell?: boolean,
  minConfidenceThreshold?: number,
  emailNotifications?: boolean,
  inAppNotifications?: boolean
})
```
Update notification preferences for a specific watchlist entry.

### Trading Simulator

#### Create New Portfolio
```
simulator.createPortfolio(config: {
  name: string,
  startingCapital: number,
  maxPositions?: number,
  maxDailyLoss?: number
})
```
Create a new paper trading portfolio.

#### Execute Trade
```
simulator.executeTrade(portfolioId: number, trade: {
  ticker: string,
  type: "BUY" | "SELL",
  quantity: number,
  price: number
})
```
Execute a trade in the paper trading simulator.

**Response:**
```json
{
  "id": 1,
  "portfolioId": 1,
  "ticker": "AAPL",
  "type": "BUY",
  "quantity": 10,
  "price": 15050,
  "executedAt": "2026-04-16T10:30:00Z",
  "pnl": 150,
  "pnlPercent": 1.0
}
```

#### Get Portfolio Performance
```
simulator.getPortfolioStats(portfolioId: number)
```
Get performance metrics for a portfolio.

**Response:**
```json
{
  "portfolioId": 1,
  "currentCapital": 11247,
  "totalReturn": 1247,
  "totalTrades": 12,
  "winRate": 0.65,
  "sharpeRatio": 1.2,
  "maxDrawdown": 0.035,
  "profitFactor": 1.8
}
```

### Validation & Paper Trading

#### Create Validation Session
```
validation.createSession(config: {
  startingCapital: number,
  targetMonthlyReturn: number,
  dailyLossLimit: number,
  validationDays: number
})
```
Start a 3-month paper trading validation session.

#### Get Session Metrics
```
validation.getMetrics(sessionId: string)
```
Get performance metrics for a validation session.

**Response:**
```json
{
  "sessionId": "session-123",
  "currentCapital": 112470,
  "dailyPnL": 500,
  "monthlyReturn": 12.47,
  "winRate": 0.65,
  "sharpeRatio": 1.2,
  "maxDrawdown": 0.035,
  "totalTrades": 12
}
```

#### Get Validation Report
```
validation.getValidationReport(sessionId: string)
```
Get comprehensive validation report with pass/fail criteria.

### Live Market Data

#### Get Live Prices
```
liveMarket.getPrices(tickers: string[])
```
Get current market prices for specified stocks.

**Response:**
```json
{
  "AAPL": {
    "price": 15050,
    "change": 150,
    "changePercent": 1.0,
    "timestamp": "2026-04-16T10:30:00Z"
  }
}
```

### Notifications

#### Get Notifications
```
notifications.getList(limit?: number)
```
Get user's notifications.

**Response:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "title": "Buy Signal",
    "message": "Strong buy signal detected for AAPL",
    "isRead": false,
    "createdAt": "2026-04-16T10:30:00Z"
  }
]
```

#### Mark as Read
```
notifications.markAsRead(notificationId: number)
```
Mark a notification as read.

#### Clear Notifications
```
notifications.clear()
```
Clear all notifications for the user.

## Error Handling

All API errors follow this format:

```json
{
  "code": "UNAUTHORIZED",
  "message": "User not authenticated"
}
```

Common error codes:
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request parameters
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

API requests are rate-limited to 100 requests per minute per user.

## Pagination

List endpoints support pagination:

```
endpoint(limit: number, offset: number)
```

## WebSocket Support

Real-time price updates are available via WebSocket:

```
wss://manuspredictor-knj3qkdj.manus.space/ws
```

Subscribe to price updates:
```json
{
  "type": "subscribe",
  "channel": "prices",
  "tickers": ["AAPL", "MSFT"]
}
```

## Examples

### Get Buy Signals for AAPL
```typescript
const signals = await trpc.signals.getByTicker.query({ ticker: "AAPL" });
console.log(`Buy signals: ${signals.buySignals}`);
```

### Execute a Trade
```typescript
const trade = await trpc.simulator.executeTrade.mutate({
  portfolioId: 1,
  ticker: "AAPL",
  type: "BUY",
  quantity: 10,
  price: 15050
});
console.log(`Trade executed: ${trade.pnl} P&L`);
```

### Monitor Validation Session
```typescript
const metrics = await trpc.validation.getMetrics.query({ 
  sessionId: "session-123" 
});
console.log(`Win rate: ${metrics.winRate * 100}%`);
```

## Support

For API support, contact: support@manuspredictor.com

## Version

API Version: 1.0.0
Last Updated: April 16, 2026
