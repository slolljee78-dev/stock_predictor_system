/**
 * Trading Simulator - Simulates 24 hours of trading with £100 initial capital
 * Uses simplified technical analysis for demonstration
 */

import { calculateAllIndicators, analyzeIndicators, PricePoint } from './indicators';

export interface TradeRecord {
  timestamp: Date;
  ticker: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  totalValue: number;
  signal: { type: 'buy' | 'sell'; confidence: number };
  portfolio: { cash: number; holdings: Record<string, number> };
}

export interface SimulationResult {
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  returnPercentage: number;
  trades: TradeRecord[];
  portfolio: Record<string, number>;
  bestTrade?: TradeRecord;
  worstTrade?: TradeRecord;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
}

/**
 * Generate realistic hourly price movements for a stock
 */
function generateHourlyPrices(basePrice: number, hours: number): PricePoint[] {
  const prices: PricePoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - (hours - i));

    // Realistic price movement (0.5-2% per hour)
    const changePercent = (Math.random() - 0.5) * 0.02;
    currentPrice = currentPrice * (1 + changePercent);

    const volatility = 0.005;
    const close = currentPrice * (1 + (Math.random() - 0.5) * volatility);
    const high = close * (1 + Math.random() * volatility);
    const low = close * (1 - Math.random() * volatility);
    const volume = Math.floor(Math.random() * 5000000) + 1000000;

    prices.push({
      date: timestamp,
      close: Math.round(close * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      volume,
    });
  }

  return prices.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Simulate 24 hours of trading with deterministic signals
 */
export async function simulate24HourTrading(): Promise<SimulationResult> {
  const initialCapital = 100;
  let cash = initialCapital;
  const holdings: Record<string, { quantity: number; buyPrice: number }> = {};
  const trades: TradeRecord[] = [];
  const tradeResults: { profit: number; action: 'buy' | 'sell' }[] = [];

  // Stocks to trade
  const stocks = [
    { ticker: 'AAPL', basePrice: 180 },
    { ticker: 'MSFT', basePrice: 380 },
    { ticker: 'NVDA', basePrice: 875 },
    { ticker: 'TSLA', basePrice: 245 },
    { ticker: 'AMZN', basePrice: 175 },
  ];

  // Simulate 24 hours with multiple check points
  for (let hour = 0; hour < 24; hour += 4) {
    for (const stock of stocks) {
      // Generate price history
      const priceHistory = generateHourlyPrices(stock.basePrice, 24);
      const recentPrices = priceHistory.slice(-8); // Last 8 hours
      const currentPrice = recentPrices[recentPrices.length - 1].close;

      // Calculate indicators
      const indicators = calculateAllIndicators(recentPrices);
      const analysis = analyzeIndicators(indicators);

      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - (24 - hour));

      // Simplified trading logic
      const hasHolding = holdings[stock.ticker];
      const priceMovement = recentPrices.length > 1 
        ? ((currentPrice - recentPrices[0].close) / recentPrices[0].close) * 100 
        : 0;

      // BUY signal: RSI oversold or price dropped
      if (!hasHolding && analysis.signal === 'buy' && cash > 50) {
        const allocation = Math.min(cash * 0.25, cash - 10); // Use up to 25% of cash
        const quantity = Math.floor(allocation / currentPrice);

        if (quantity > 0) {
          const totalValue = quantity * currentPrice;
          cash -= totalValue;
          holdings[stock.ticker] = { quantity, buyPrice: currentPrice };

          trades.push({
            timestamp,
            ticker: stock.ticker,
            action: 'buy',
            price: currentPrice,
            quantity,
            totalValue,
            signal: { type: 'buy', confidence: analysis.confidence },
            portfolio: { cash, holdings: Object.fromEntries(
              Object.entries(holdings).map(([k, v]) => [k, v.quantity])
            ) },
          });
        }
      }

      // SELL signal: RSI overbought or price surged
      if (hasHolding && analysis.signal === 'sell') {
        const quantity = hasHolding.quantity;
        const totalValue = quantity * currentPrice;
        const profit = totalValue - (hasHolding.buyPrice * quantity);

        cash += totalValue;
        tradeResults.push({ profit, action: 'sell' });
        delete holdings[stock.ticker];

        trades.push({
          timestamp,
          ticker: stock.ticker,
          action: 'sell',
          price: currentPrice,
          quantity,
          totalValue,
          signal: { type: 'sell', confidence: analysis.confidence },
          portfolio: { cash, holdings: Object.fromEntries(
            Object.entries(holdings).map(([k, v]) => [k, v.quantity])
          ) },
        });
      }

      // Stop-loss: sell if price dropped 5% from buy price
      if (hasHolding && priceMovement < -5) {
        const quantity = hasHolding.quantity;
        const totalValue = quantity * currentPrice;
        const profit = totalValue - (hasHolding.buyPrice * quantity);

        cash += totalValue;
        tradeResults.push({ profit, action: 'sell' });
        delete holdings[stock.ticker];

        trades.push({
          timestamp,
          ticker: stock.ticker,
          action: 'sell',
          price: currentPrice,
          quantity,
          totalValue,
          signal: { type: 'sell', confidence: 80 },
          portfolio: { cash, holdings: Object.fromEntries(
            Object.entries(holdings).map(([k, v]) => [k, v.quantity])
          ) },
        });
      }

      // Take-profit: sell if price surged 3% from buy price
      if (hasHolding && priceMovement > 3) {
        const quantity = hasHolding.quantity;
        const totalValue = quantity * currentPrice;
        const profit = totalValue - (hasHolding.buyPrice * quantity);

        cash += totalValue;
        tradeResults.push({ profit, action: 'sell' });
        delete holdings[stock.ticker];

        trades.push({
          timestamp,
          ticker: stock.ticker,
          action: 'sell',
          price: currentPrice,
          quantity,
          totalValue,
          signal: { type: 'sell', confidence: 75 },
          portfolio: { cash, holdings: Object.fromEntries(
            Object.entries(holdings).map(([k, v]) => [k, v.quantity])
          ) },
        });
      }
    }
  }

  // Close all remaining positions at market price
  for (const [ticker, holding] of Object.entries(holdings)) {
    const stock = stocks.find(s => s.ticker === ticker);
    if (stock && holding) {
      const priceHistory = generateHourlyPrices(stock.basePrice, 24);
      const finalPrice = priceHistory[priceHistory.length - 1].close;
      const totalValue = holding.quantity * finalPrice;
      const profit = totalValue - (holding.buyPrice * holding.quantity);

      cash += totalValue;
      tradeResults.push({ profit, action: 'sell' });

      trades.push({
        timestamp: new Date(),
        ticker,
        action: 'sell',
        price: finalPrice,
        quantity: holding.quantity,
        totalValue,
        signal: { type: 'sell', confidence: 50 },
        portfolio: { cash, holdings: {} },
      });
    }
  }

  // Calculate statistics
  const totalReturn = cash - initialCapital;
  const returnPercentage = (totalReturn / initialCapital) * 100;
  const sellTrades = trades.filter(t => t.action === 'sell');
  const winningTrades = tradeResults.filter(t => t.profit > 0).length;
  const losingTrades = tradeResults.filter(t => t.profit < 0).length;
  const winRate = tradeResults.length > 0 ? (winningTrades / tradeResults.length) * 100 : 0;

  const bestTrade = trades.length > 0 ? trades.reduce((best, current) =>
    current.totalValue > (best?.totalValue || 0) ? current : best
  ) : undefined;

  const worstTrade = trades.length > 0 ? trades.reduce((worst, current) =>
    current.totalValue < (worst?.totalValue || Infinity) ? current : worst
  ) : undefined;

  return {
    initialCapital,
    finalCapital: Math.round(cash * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    returnPercentage: Math.round(returnPercentage * 100) / 100,
    trades: trades.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    portfolio: Object.fromEntries(
      Object.entries(holdings).map(([k, v]) => [k, v.quantity])
    ),
    bestTrade,
    worstTrade,
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate: Math.round(winRate * 100) / 100,
  };
}
