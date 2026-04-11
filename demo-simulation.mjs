#!/usr/bin/env node

/**
 * Demonstration Trading Simulation
 * Shows realistic trading results with the ML signal system
 */

// Generate realistic hourly price data with controlled volatility
function generateHourlyPrices(basePrice, hours, volatilityFactor = 1) {
  const prices = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Create a trend for more realistic data
  const trend = (Math.random() - 0.5) * 0.01; // Small overall trend

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - (hours - i));

    // Combination of trend and random walk
    const changePercent = trend + (Math.random() - 0.5) * 0.015 * volatilityFactor;
    currentPrice = currentPrice * (1 + changePercent);

    prices.push({
      date: timestamp,
      close: Math.round(currentPrice * 100) / 100,
    });
  }

  return prices.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Calculate RSI
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;

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
  if (prices.length < period) return prices[prices.length - 1];
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

// Generate signal with confidence
function generateSignal(prices) {
  if (prices.length < 20) return { signal: null, confidence: 0 };

  const rsi = calculateRSI(prices, 14);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, Math.min(50, prices.length));
  const currentPrice = prices[prices.length - 1];
  const priceChange = ((currentPrice - prices[0]) / prices[0]) * 100;

  let buyScore = 0;
  let sellScore = 0;
  const maxScore = 5;

  // RSI signals (0-1)
  if (rsi < 30) buyScore += 1;
  if (rsi > 70) sellScore += 1;

  // Price vs SMA20 (0-1)
  if (currentPrice > sma20) buyScore += 1;
  if (currentPrice < sma20) sellScore += 1;

  // SMA trend (0-1)
  if (sma20 > sma50) buyScore += 1;
  if (sma20 < sma50) sellScore += 1;

  // Momentum (0-1)
  if (priceChange > 1) buyScore += 1;
  if (priceChange < -1) sellScore += 1;

  // Volatility consideration (0-1)
  const volatility = Math.abs(priceChange);
  if (volatility > 2 && buyScore > sellScore) buyScore += 0.5;
  if (volatility > 2 && sellScore > buyScore) sellScore += 0.5;

  const buyConfidence = (buyScore / maxScore) * 100;
  const sellConfidence = (sellScore / maxScore) * 100;

  if (buyConfidence > sellConfidence && buyConfidence >= 45) {
    return { signal: 'buy', confidence: Math.round(buyConfidence) };
  } else if (sellConfidence > buyConfidence && sellConfidence >= 45) {
    return { signal: 'sell', confidence: Math.round(sellConfidence) };
  }

  return { signal: null, confidence: 0 };
}

// Run simulation
async function simulate() {
  console.log('🚀 Starting 24-Hour Trading Simulation...\n');
  console.log('Initial Capital: £100');
  console.log('Trading Stocks: AAPL, MSFT, NVDA, TSLA, AMZN');
  console.log('Strategy: RSI + SMA Crossover + Momentum\n');
  console.log('-------------------------------------------\n');

  const initialCapital = 100;
  let cash = initialCapital;
  const holdings = {};
  const trades = [];
  const tradeResults = [];

  const stocks = [
    { ticker: 'AAPL', basePrice: 180, volatility: 1 },
    { ticker: 'MSFT', basePrice: 380, volatility: 0.9 },
    { ticker: 'NVDA', basePrice: 875, volatility: 1.2 },
    { ticker: 'TSLA', basePrice: 245, volatility: 1.3 },
    { ticker: 'AMZN', basePrice: 175, volatility: 1.1 },
  ];

  // Simulate 24 hours with 6 check points (every 4 hours)
  for (let hour = 0; hour < 24; hour += 4) {
    for (const stock of stocks) {
      // Generate price history with controlled volatility
      const priceHistory = generateHourlyPrices(stock.basePrice, 24, stock.volatility);
      const recentPrices = priceHistory.slice(-12).map(p => p.close);
      const currentPrice = recentPrices[recentPrices.length - 1];

      // Generate signal
      const { signal, confidence } = generateSignal(recentPrices);

      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - (24 - hour));

      const hasHolding = holdings[stock.ticker];

      // BUY logic
      if (!hasHolding && signal === 'buy' && cash > 30 && confidence >= 50) {
        const allocation = Math.min(cash * 0.3, cash - 10);
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

      // SELL logic
      if (hasHolding && confidence >= 50) {
        const priceMovement = ((currentPrice - hasHolding.buyPrice) / hasHolding.buyPrice) * 100;
        const shouldSell = signal === 'sell' || priceMovement < -4 || priceMovement > 2.5;

        if (shouldSell) {
          const quantity = hasHolding.quantity;
          const totalValue = quantity * currentPrice;
          const profit = totalValue - (hasHolding.buyPrice * quantity);

          cash += totalValue;
          tradeResults.push({ profit, ticker: stock.ticker });
          delete holdings[stock.ticker];

          const profitStr = profit > 0 ? `+£${profit.toFixed(2)}` : `-£${Math.abs(profit).toFixed(2)}`;
          const reason = signal === 'sell' ? 'Signal' : priceMovement < -4 ? 'Stop-Loss' : 'Take-Profit';

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
      const priceHistory = generateHourlyPrices(stock.basePrice, 24, stock.volatility);
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
    const totalProfit = tradeResults.reduce((sum, t) => sum + t.profit, 0);

    console.log('🏆 BEST TRADE\n');
    console.log(`Stock:              ${bestTrade.ticker}`);
    console.log(`Profit:             +£${bestTrade.profit.toFixed(2)}\n`);

    console.log('📉 WORST TRADE\n');
    console.log(`Stock:              ${worstTrade.ticker}`);
    console.log(`Loss:               -£${Math.abs(worstTrade.profit).toFixed(2)}\n`);

    console.log('💰 TOTAL PROFIT FROM TRADES\n');
    console.log(`Total:              £${totalProfit.toFixed(2)}\n`);
  }

  console.log('-------------------------------------------\n');

  if (returnPercentage > 0) {
    console.log(`✅ SIMULATION PROFITABLE: +${returnPercentage.toFixed(2)}%\n`);
  } else if (returnPercentage < 0) {
    console.log(`❌ SIMULATION LOSS: ${returnPercentage.toFixed(2)}%\n`);
  } else {
    console.log('➡️  SIMULATION BREAK-EVEN\n');
  }

  console.log('📝 TRADE SUMMARY\n');
  trades.forEach((trade, index) => {
    if (trade.action === '🔵 BUY') {
      console.log(`${index + 1}. ${trade.action} ${trade.ticker} @ £${trade.price.toFixed(2)} (${trade.quantity} shares) - Confidence: ${trade.confidence}%`);
    } else {
      console.log(`${index + 1}. ${trade.action} ${trade.ticker} @ £${trade.price.toFixed(2)} (${trade.quantity} shares) - Profit: ${trade.profit} (${trade.reason})`);
    }
  });
}

simulate().catch(console.error);
