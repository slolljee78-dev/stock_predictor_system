#!/usr/bin/env node

/**
 * Simple 24-Hour Trading Simulation
 * Demonstrates the trading system with realistic price movements and signals
 */

// Generate realistic hourly price data
function generateHourlyPrices(basePrice, hours) {
  const prices = [];
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

    prices.push({
      date: timestamp,
      close: Math.round(close * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
    });
  }

  return prices.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Calculate RSI
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;

  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100;
}

// Calculate SMA
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

// Simple signal generation
function generateSignal(prices) {
  if (prices.length < 20) return { signal: null, confidence: 0 };

  const rsi = calculateRSI(prices, 14);
  const sma20 = calculateSMA(prices, 20);
  const currentPrice = prices[prices.length - 1];
  const priceChange = ((currentPrice - prices[0]) / prices[0]) * 100;

  let buySignals = 0;
  let sellSignals = 0;

  // RSI signals
  if (rsi && rsi < 30) buySignals++;
  if (rsi && rsi > 70) sellSignals++;

  // Price trend signals
  if (sma20 && currentPrice > sma20) buySignals++;
  if (sma20 && currentPrice < sma20) sellSignals++;

  // Momentum signals
  if (priceChange > 2) buySignals++;
  if (priceChange < -2) sellSignals++;

  const buyConfidence = (buySignals / 3) * 100;
  const sellConfidence = (sellSignals / 3) * 100;

  if (buyConfidence > sellConfidence && buyConfidence >= 40) {
    return { signal: 'buy', confidence: Math.round(buyConfidence) };
  } else if (sellConfidence > buyConfidence && sellConfidence >= 40) {
    return { signal: 'sell', confidence: Math.round(sellConfidence) };
  }

  return { signal: null, confidence: 0 };
}

// Run simulation
async function simulate() {
  console.log('🚀 Starting 24-Hour Trading Simulation...\n');
  console.log('Initial Capital: £100');
  console.log('Trading Stocks: AAPL, MSFT, NVDA, TSLA, AMZN');
  console.log('Strategy: RSI + SMA + Momentum\n');
  console.log('-------------------------------------------\n');

  const initialCapital = 100;
  let cash = initialCapital;
  const holdings = {};
  const trades = [];
  const tradeResults = [];

  const stocks = [
    { ticker: 'AAPL', basePrice: 180 },
    { ticker: 'MSFT', basePrice: 380 },
    { ticker: 'NVDA', basePrice: 875 },
    { ticker: 'TSLA', basePrice: 245 },
    { ticker: 'AMZN', basePrice: 175 },
  ];

  // Simulate 24 hours with 6 check points (every 4 hours)
  for (let hour = 0; hour < 24; hour += 4) {
    for (const stock of stocks) {
      // Generate price history
      const priceHistory = generateHourlyPrices(stock.basePrice, 24);
      const recentPrices = priceHistory.slice(-8).map(p => p.close);
      const currentPrice = recentPrices[recentPrices.length - 1];

      // Generate signal
      const { signal, confidence } = generateSignal(recentPrices);

      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - (24 - hour));

      const hasHolding = holdings[stock.ticker];

      // BUY logic
      if (!hasHolding && signal === 'buy' && cash > 50) {
        const allocation = Math.min(cash * 0.25, cash - 10);
        const quantity = Math.floor(allocation / currentPrice);

        if (quantity > 0) {
          const totalValue = quantity * currentPrice;
          cash -= totalValue;
          holdings[stock.ticker] = { quantity, buyPrice: currentPrice };

          trades.push({
            time: timestamp.toLocaleTimeString(),
            action: '🔵 BUY',
            ticker: stock.ticker,
            price: currentPrice,
            quantity,
            value: totalValue,
            confidence,
          });

          console.log(`[${timestamp.toLocaleTimeString()}] 🔵 BUY ${stock.ticker} @ £${currentPrice.toFixed(2)} (${quantity} shares, £${totalValue.toFixed(2)}) - Confidence: ${confidence}%`);
        }
      }

      // SELL logic - signal or stop-loss/take-profit
      if (hasHolding) {
        const priceMovement = ((currentPrice - hasHolding.buyPrice) / hasHolding.buyPrice) * 100;
        const shouldSell = signal === 'sell' || priceMovement < -5 || priceMovement > 3;

        if (shouldSell) {
          const quantity = hasHolding.quantity;
          const totalValue = quantity * currentPrice;
          const profit = totalValue - (hasHolding.buyPrice * quantity);

          cash += totalValue;
          tradeResults.push({ profit, ticker: stock.ticker });
          delete holdings[stock.ticker];

          const profitStr = profit > 0 ? `+£${profit.toFixed(2)}` : `-£${Math.abs(profit).toFixed(2)}`;
          const reason = signal === 'sell' ? 'Signal' : priceMovement < -5 ? 'Stop-Loss' : 'Take-Profit';

          trades.push({
            time: timestamp.toLocaleTimeString(),
            action: '🔴 SELL',
            ticker: stock.ticker,
            price: currentPrice,
            quantity,
            value: totalValue,
            profit: profitStr,
            reason,
            confidence,
          });

          console.log(`[${timestamp.toLocaleTimeString()}] 🔴 SELL ${stock.ticker} @ £${currentPrice.toFixed(2)} (${quantity} shares, £${totalValue.toFixed(2)}) - Profit: ${profitStr} (${reason})`);
        }
      }
    }
  }

  // Close remaining positions
  for (const [ticker, holding] of Object.entries(holdings)) {
    const stock = stocks.find(s => s.ticker === ticker);
    if (stock && holding) {
      const priceHistory = generateHourlyPrices(stock.basePrice, 24);
      const finalPrice = priceHistory[priceHistory.length - 1].close;
      const totalValue = holding.quantity * finalPrice;
      const profit = totalValue - (holding.buyPrice * holding.quantity);

      cash += totalValue;
      tradeResults.push({ profit, ticker });

      const profitStr = profit > 0 ? `+£${profit.toFixed(2)}` : `-£${Math.abs(profit).toFixed(2)}`;
      console.log(`[CLOSE] 🔴 SELL ${ticker} @ £${finalPrice.toFixed(2)} - Profit: ${profitStr}`);
    }
  }

  // Calculate results
  const totalReturn = cash - initialCapital;
  const returnPercentage = (totalReturn / initialCapital) * 100;
  const winningTrades = tradeResults.filter(t => t.profit > 0).length;
  const losingTrades = tradeResults.filter(t => t.profit < 0).length;
  const winRate = tradeResults.length > 0 ? (winningTrades / tradeResults.length) * 100 : 0;

  console.log('\n-------------------------------------------\n');
  console.log('📊 SIMULATION RESULTS\n');
  console.log(`Initial Capital:    £${initialCapital.toFixed(2)}`);
  console.log(`Final Capital:      £${cash.toFixed(2)}`);
  console.log(`Total Return:       £${totalReturn.toFixed(2)}`);
  console.log(`Return %:           ${returnPercentage.toFixed(2)}%\n`);

  console.log('📈 TRADING STATISTICS\n');
  console.log(`Total Trades:       ${trades.length}`);
  console.log(`Buy Orders:         ${trades.filter(t => t.action === '🔵 BUY').length}`);
  console.log(`Sell Orders:        ${trades.filter(t => t.action === '🔴 SELL').length}`);
  console.log(`Winning Trades:     ${winningTrades}`);
  console.log(`Losing Trades:      ${losingTrades}`);
  console.log(`Win Rate:           ${winRate.toFixed(2)}%\n`);

  if (tradeResults.length > 0) {
    const bestTrade = tradeResults.reduce((a, b) => a.profit > b.profit ? a : b);
    const worstTrade = tradeResults.reduce((a, b) => a.profit < b.profit ? a : b);

    console.log('🏆 BEST TRADE\n');
    console.log(`Stock:              ${bestTrade.ticker}`);
    console.log(`Profit:             +£${bestTrade.profit.toFixed(2)}\n`);

    console.log('📉 WORST TRADE\n');
    console.log(`Stock:              ${worstTrade.ticker}`);
    console.log(`Loss:               -£${Math.abs(worstTrade.profit).toFixed(2)}\n`);
  }

  console.log('-------------------------------------------\n');

  if (returnPercentage > 0) {
    console.log(`✅ SIMULATION PROFITABLE: +${returnPercentage.toFixed(2)}%\n`);
  } else if (returnPercentage < 0) {
    console.log(`❌ SIMULATION LOSS: ${returnPercentage.toFixed(2)}%\n`);
  } else {
    console.log('➡️  SIMULATION BREAK-EVEN\n');
  }
}

simulate().catch(console.error);
