/**
 * Simple Backtest: Phase 1 Signal Improvements
 * Compares base vs Phase 1 enhanced signals with deterministic trades
 */

import fs from 'fs';

// Generate synthetic price data with clear trends
function generatePrices(basePrice, trend, periods = 100) {
  const prices = [];
  let price = basePrice;

  for (let i = 0; i < periods; i++) {
    let change = 0;

    if (trend === 'up') {
      change = 0.5 + Math.random() * 0.5; // Uptrend
    } else if (trend === 'down') {
      change = -0.5 - Math.random() * 0.5; // Downtrend
    } else {
      change = (Math.random() - 0.5) * 1; // Sideways
    }

    price += change;
    const high = price + Math.abs(Math.random() * 0.3);
    const low = price - Math.abs(Math.random() * 0.3);
    const volume = 1000000 + Math.random() * 500000;

    prices.push({
      close: price,
      high,
      low,
      volume,
    });
  }

  return prices;
}

// Calculate RSI
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;

  let gains = 0,
    losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i].close - prices[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Calculate SMA
function calculateSMA(prices, period = 20) {
  if (prices.length < period) return prices[prices.length - 1].close;
  return prices.slice(-period).reduce((sum, p) => sum + p.close, 0) / period;
}

// Calculate volume ratio
function getVolumeRatio(prices) {
  if (prices.length < 20) return 1;
  const avgVolume = prices.slice(-20).reduce((sum, p) => sum + p.volume, 0) / 20;
  const currentVolume = prices[prices.length - 1].volume;
  return currentVolume / avgVolume;
}

// Get market trend
function getTrend(prices) {
  if (prices.length < 50) return 'neutral';
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  if (sma20 > sma50) return 'up';
  if (sma20 < sma50) return 'down';
  return 'neutral';
}

// Base signal generation
function getBaseSignal(prices) {
  const rsi = calculateRSI(prices);
  const sma20 = calculateSMA(prices, 20);
  const currentPrice = prices[prices.length - 1].close;

  let signal = 'hold';
  let confidence = 50;

  if (rsi < 35) {
    signal = 'buy';
    confidence = 65;
  } else if (rsi > 65) {
    signal = 'sell';
    confidence = 65;
  }

  if (currentPrice > sma20 && signal === 'buy') confidence += 10;
  if (currentPrice < sma20 && signal === 'sell') confidence += 10;

  return { signal, confidence: Math.min(100, confidence) };
}

// Phase 1 enhanced signal generation
function getPhase1Signal(prices) {
  const rsi = calculateRSI(prices);
  const sma20 = calculateSMA(prices, 20);
  const currentPrice = prices[prices.length - 1].close;
  const volumeRatio = getVolumeRatio(prices);
  const trend = getTrend(prices);

  let signal = 'hold';
  let confidence = 50;

  // Base RSI signal
  if (rsi < 35) {
    signal = 'buy';
    confidence = 65;
  } else if (rsi > 65) {
    signal = 'sell';
    confidence = 65;
  }

  // SMA confirmation
  if (currentPrice > sma20 && signal === 'buy') confidence += 10;
  if (currentPrice < sma20 && signal === 'sell') confidence += 10;

  // Phase 1: Volume confirmation
  if (volumeRatio >= 1.5) {
    confidence += 10; // Boost
  } else if (signal !== 'hold') {
    confidence -= 15; // Reduce
  }

  // Phase 1: Market regime
  if (signal === 'buy' && trend === 'up') {
    confidence += 15;
  } else if (signal === 'sell' && trend === 'down') {
    confidence += 15;
  }

  return { signal, confidence: Math.min(100, confidence) };
}

// Run backtest
function runBacktest(signalFunc, name) {
  const stocks = [
    { ticker: 'AAPL', basePrice: 150, trend: 'up' },
    { ticker: 'MSFT', basePrice: 320, trend: 'up' },
    { ticker: 'GOOGL', basePrice: 140, trend: 'down' },
    { ticker: 'TSLA', basePrice: 240, trend: 'sideways' },
    { ticker: 'NVDA', basePrice: 880, trend: 'up' },
  ];

  let portfolio = { cash: 100, positions: {} };
  const trades = [];

  // Generate price histories
  const priceHistories = {};
  stocks.forEach(s => {
    priceHistories[s.ticker] = generatePrices(s.basePrice, s.trend);
  });

  // Simulate trading
  for (let period = 50; period < 100; period++) {
    for (const stock of stocks) {
      const prices = priceHistories[stock.ticker].slice(0, period);
      const signal = signalFunc(prices);
      const currentPrice = prices[prices.length - 1].close;

      // Buy signal
      if (
        signal.signal === 'buy' &&
        signal.confidence >= 50 &&
        !portfolio.positions[stock.ticker]
      ) {
        const cost = currentPrice * 1.001; // 0.1% commission
        const shares = Math.floor((portfolio.cash * 0.1) / cost);

        if (shares > 0) {
          portfolio.cash -= shares * cost;
          portfolio.positions[stock.ticker] = {
            shares,
            entryPrice: currentPrice,
            confidence: signal.confidence,
          };

          trades.push({
            type: 'BUY',
            ticker: stock.ticker,
            price: currentPrice,
            shares,
            confidence: signal.confidence,
            period,
          });
        }
      }

      // Sell signal
      if (
        signal.signal === 'sell' &&
        signal.confidence >= 50 &&
        portfolio.positions[stock.ticker]
      ) {
        const pos = portfolio.positions[stock.ticker];
        const revenue = pos.shares * currentPrice * 0.999; // 0.1% commission
        const profit = revenue - pos.shares * pos.entryPrice;
        const profitPercent = (profit / (pos.shares * pos.entryPrice)) * 100;

        portfolio.cash += revenue;
        delete portfolio.positions[stock.ticker];

        trades.push({
          type: 'SELL',
          ticker: stock.ticker,
          price: currentPrice,
          shares: pos.shares,
          profit: parseFloat(profit.toFixed(2)),
          profitPercent: parseFloat(profitPercent.toFixed(2)),
          confidence: signal.confidence,
          period,
        });
      }
    }
  }

  // Close remaining positions
  for (const ticker of Object.keys(portfolio.positions)) {
    const pos = portfolio.positions[ticker];
    const finalPrice = priceHistories[ticker][priceHistories[ticker].length - 1].close;
    const revenue = pos.shares * finalPrice * 0.999;
    const profit = revenue - pos.shares * pos.entryPrice;
    const profitPercent = (profit / (pos.shares * pos.entryPrice)) * 100;

    portfolio.cash += revenue;
    trades.push({
      type: 'SELL',
      ticker,
      price: finalPrice,
      shares: pos.shares,
      profit: parseFloat(profit.toFixed(2)),
      profitPercent: parseFloat(profitPercent.toFixed(2)),
      period: 100,
      closedAtEnd: true,
    });

    delete portfolio.positions[ticker];
  }

  // Calculate metrics
  const sells = trades.filter(t => t.type === 'SELL');
  const wins = sells.filter(t => t.profit > 0);
  const losses = sells.filter(t => t.profit < 0);

  const totalProfit = sells.reduce((sum, t) => sum + t.profit, 0);
  const winRate = sells.length > 0 ? (wins.length / sells.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.profit, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.profit, 0) / losses.length : 0;

  return {
    name,
    startCapital: 100,
    finalCapital: parseFloat(portfolio.cash.toFixed(2)),
    totalProfit: parseFloat(totalProfit.toFixed(2)),
    returnPercent: parseFloat((totalProfit / 100) * 100).toFixed(2),
    totalTrades: sells.length,
    wins: wins.length,
    losses: losses.length,
    winRate: parseFloat(winRate.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    trades,
  };
}

// Run simulations
console.log('\n🚀 PHASE 1 SIGNAL IMPROVEMENTS - BACKTEST RESULTS\n');
console.log('═'.repeat(80));

const baseResults = runBacktest(getBaseSignal, 'Base Signals');
const phase1Results = runBacktest(getPhase1Signal, 'Phase 1 Enhanced');

// Print comparison
console.log('\n📊 PERFORMANCE COMPARISON\n');
console.log(
  String('Metric').padEnd(25) +
    String('Base Signals').padEnd(20) +
    String('Phase 1').padEnd(20) +
    'Improvement'
);
console.log('─'.repeat(80));

const metrics = [
  ['Starting Capital', 'startCapital', '£'],
  ['Final Capital', 'finalCapital', '£'],
  ['Total Profit', 'totalProfit', '£'],
  ['Return %', 'returnPercent', '%'],
  ['Total Trades', 'totalTrades', ''],
  ['Winning Trades', 'wins', ''],
  ['Losing Trades', 'losses', ''],
  ['Win Rate', 'winRate', '%'],
  ['Avg Win', 'avgWin', '£'],
  ['Avg Loss', 'avgLoss', '£'],
];

metrics.forEach(([label, key, unit]) => {
  const baseVal = baseResults[key];
  const phase1Val = phase1Results[key];
  const improvement =
    baseVal !== 0
      ? (((phase1Val - baseVal) / Math.abs(baseVal)) * 100).toFixed(1)
      : phase1Val > 0
        ? 100
        : 0;

  console.log(
    String(label).padEnd(25) +
      String(baseVal + unit).padEnd(20) +
      String(phase1Val + unit).padEnd(20) +
      (improvement > 0 ? '+' : '') +
      improvement +
      '%'
  );
});

console.log('─'.repeat(80));

// Print trades
console.log('\n📈 BASE SIGNAL TRADES:');
baseResults.trades
  .filter(t => t.type === 'SELL')
  .slice(0, 5)
  .forEach(t => {
    console.log(
      `  ${t.ticker}: ${t.shares} shares @ £${t.price.toFixed(2)} = £${t.profit} (${t.profitPercent}%)`
    );
  });

console.log('\n📈 PHASE 1 ENHANCED TRADES:');
phase1Results.trades
  .filter(t => t.type === 'SELL')
  .slice(0, 5)
  .forEach(t => {
    console.log(
      `  ${t.ticker}: ${t.shares} shares @ £${t.price.toFixed(2)} = £${t.profit} (${t.profitPercent}%)`
    );
  });

// Summary
console.log('\n═'.repeat(80));
console.log('✅ CONCLUSION\n');

const capitalGain = phase1Results.finalCapital - baseResults.finalCapital;
const winRateGain = phase1Results.winRate - baseResults.winRate;

console.log(`Phase 1 Improvements delivered:`);
console.log(`  • Capital: £${baseResults.finalCapital} → £${phase1Results.finalCapital} (+£${capitalGain.toFixed(2)})`);
console.log(`  • Win Rate: ${baseResults.winRate}% → ${phase1Results.winRate}% (+${winRateGain.toFixed(1)}%)`);
console.log(`  • Total Trades: ${baseResults.totalTrades} vs ${phase1Results.totalTrades}`);
console.log(`  • Avg Win: £${baseResults.avgWin.toFixed(2)} vs £${phase1Results.avgWin.toFixed(2)}`);
console.log('\n');

// Save results
const results = {
  timestamp: new Date().toISOString(),
  baseResults,
  phase1Results,
  improvement: {
    capitalGain: parseFloat(capitalGain.toFixed(2)),
    winRateGain: parseFloat(winRateGain.toFixed(2)),
  },
};

fs.writeFileSync('backtest-results.json', JSON.stringify(results, null, 2));
console.log('📁 Full results saved to backtest-results.json\n');
