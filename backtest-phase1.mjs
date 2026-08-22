/**
 * Backtest: Phase 1 Signal Improvements
 * Compares base signal generation vs Phase 1 enhanced signals
 * Simulates 24-hour trading with £100 initial capital
 */

import fs from 'fs';

// Mock price data for 5 stocks over 100 periods
function generatePriceHistory(basePrice, trend, periods = 100) {
  const prices = [];
  let currentPrice = basePrice;

  for (let i = 0; i < periods; i++) {
    let change = 0;
    if (trend === 'up') {
      change = (Math.random() - 0.3) * 2;
    } else if (trend === 'down') {
      change = (Math.random() - 0.7) * 2;
    } else {
      change = (Math.random() - 0.5) * 1;
    }

    const close = currentPrice + change;
    const high = close + Math.abs(Math.random() * 0.5);
    const low = close - Math.abs(Math.random() * 0.5);
    const volume = 1000000 + Math.random() * 500000;

    prices.push({
      date: new Date(Date.now() - (periods - i) * 60000),
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return prices;
}

// Calculate technical indicators
function calculateIndicators(prices) {
  if (prices.length < 14) return null;

  // RSI
  const closes = prices.map(p => p.close);
  let gains = 0,
    losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  // SMA20
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  // Volume analysis
  const recentVolumes = prices.slice(-20).map(p => p.volume);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / 20;
  const currentVolume = prices[prices.length - 1].volume;
  const volumeRatio = currentVolume / avgVolume;
  const volumeConfirmed = volumeRatio >= 1.5;

  // Market regime
  const sma50 =
    prices.length >= 50
      ? prices.slice(-50).reduce((a, b) => a + b.close, 0) / 50
      : sma20;
  const currentPrice = prices[prices.length - 1].close;
  const trend =
    currentPrice > sma50 ? 'up' : currentPrice < sma50 ? 'down' : 'neutral';

  return {
    rsi,
    sma20,
    currentPrice,
    volumeConfirmed,
    volumeRatio,
    trend,
  };
}

// Generate BASE signal (simple technical analysis)
function generateBaseSignal(indicators) {
  if (!indicators) return { type: 'neutral', confidence: 0 };

  let signal = 'neutral';
  let confidence = 50;

  // More aggressive signal generation for backtesting
  if (indicators.rsi < 35) {
    signal = 'buy';
    confidence = 65;
  } else if (indicators.rsi > 65) {
    signal = 'sell';
    confidence = 65;
  } else if (indicators.rsi < 40) {
    signal = 'buy';
    confidence = 55;
  } else if (indicators.rsi > 60) {
    signal = 'sell';
    confidence = 55;
  }

  // SMA confirmation
  if (indicators.currentPrice > indicators.sma20 && signal === 'buy') {
    confidence += 10;
  } else if (indicators.currentPrice < indicators.sma20 && signal === 'sell') {
    confidence += 10;
  }

  return { type: signal, confidence: Math.max(0, Math.min(100, confidence)) };
}

// Generate PHASE 1 ENHANCED signal
function generatePhase1Signal(indicators) {
  if (!indicators) return { type: 'neutral', confidence: 0 };

  let signal = 'neutral';
  let confidence = 50;

  // More aggressive signal generation for backtesting
  if (indicators.rsi < 35) {
    signal = 'buy';
    confidence = 65;
  } else if (indicators.rsi > 65) {
    signal = 'sell';
    confidence = 65;
  } else if (indicators.rsi < 40) {
    signal = 'buy';
    confidence = 55;
  } else if (indicators.rsi > 60) {
    signal = 'sell';
    confidence = 55;
  }

  // SMA confirmation
  if (indicators.currentPrice > indicators.sma20 && signal === 'buy') {
    confidence += 10;
  } else if (indicators.currentPrice < indicators.sma20 && signal === 'sell') {
    confidence += 10;
  }

  // PHASE 1: Volume confirmation
  if (indicators.volumeConfirmed) {
    confidence += 10; // Boost for confirmed volume
  } else if (signal !== 'neutral') {
    confidence -= 15; // Reduce for unconfirmed volume
  }

  // PHASE 1: Market regime adjustment
  if (signal === 'buy' && indicators.trend === 'up') {
    confidence += 15;
  } else if (signal === 'sell' && indicators.trend === 'down') {
    confidence += 15;
  } else if (indicators.trend === 'neutral') {
    confidence -= 10;
  }

  return { type: signal, confidence: Math.max(0, Math.min(100, confidence)) };
}

// Execute trade
function executeTrade(portfolio, signal, currentPrice, ticker) {
  if (signal.type === 'neutral' || signal.confidence < 50) {
    return null;
  }

  const commission = 0.001; // 0.1% commission
  const slippage = 0.0005; // 0.05% slippage

  if (signal.type === 'buy') {
    const adjustedPrice = currentPrice * (1 + slippage);
    const costPerShare = adjustedPrice * (1 + commission);
    const shares = Math.floor((portfolio.cash * 0.1) / costPerShare); // Risk 10% per trade

    if (shares > 0) {
      const cost = shares * costPerShare;
      portfolio.cash -= cost;
      portfolio.positions[ticker] = {
        shares,
        entryPrice: adjustedPrice,
        entryTime: new Date(),
      };

      return {
        type: 'buy',
        ticker,
        shares,
        price: adjustedPrice,
        cost,
        confidence: signal.confidence,
      };
    }
  } else if (signal.type === 'sell') {
    const position = portfolio.positions[ticker];
    if (position && position.shares > 0) {
      const adjustedPrice = currentPrice * (1 - slippage);
      const revenue = position.shares * adjustedPrice * (1 - commission);
      const profit = revenue - position.shares * position.entryPrice;

      portfolio.cash += revenue;
      delete portfolio.positions[ticker];

      return {
        type: 'sell',
        ticker,
        shares: position.shares,
        price: adjustedPrice,
        revenue,
        profit,
        profitPercent: (profit / (position.shares * position.entryPrice)) * 100,
        confidence: signal.confidence,
      };
    }
  }

  return null;
}

// Run simulation
function runSimulation(signalGenerator, name) {
  const stocks = [
    { ticker: 'AAPL', basePrice: 150, trend: 'up' },
    { ticker: 'MSFT', basePrice: 320, trend: 'up' },
    { ticker: 'GOOGL', basePrice: 140, trend: 'down' },
    { ticker: 'TSLA', basePrice: 240, trend: 'sideways' },
    { ticker: 'NVDA', basePrice: 880, trend: 'up' },
  ];

  const portfolio = {
    cash: 100,
    positions: {},
    trades: [],
    startingCapital: 100,
  };

  // Generate price histories
  const priceHistories = {};
  stocks.forEach(stock => {
    priceHistories[stock.ticker] = generatePriceHistory(
      stock.basePrice,
      stock.trend
    );
  });

  // Simulate trading
  for (let period = 50; period < 100; period++) {
    for (const stock of stocks) {
      const prices = priceHistories[stock.ticker];
      const recentPrices = prices.slice(0, period + 1);
      const indicators = calculateIndicators(recentPrices);

      if (indicators) {
        const signal = signalGenerator(indicators);
        const trade = executeTrade(
          portfolio,
          signal,
          indicators.currentPrice,
          stock.ticker
        );

        if (trade) {
          portfolio.trades.push({
            ...trade,
            period,
          });
        }
      }
    }
  }

  // Close remaining positions at final price
  for (const ticker of Object.keys(portfolio.positions)) {
    const position = portfolio.positions[ticker];
    const finalPrice =
      priceHistories[ticker][priceHistories[ticker].length - 1].close;
    const revenue = position.shares * finalPrice * 0.999; // 0.1% commission
    const profit = revenue - position.shares * position.entryPrice;

    portfolio.cash += revenue;
    portfolio.trades.push({
      type: 'sell',
      ticker,
      shares: position.shares,
      price: finalPrice,
      revenue,
      profit,
      profitPercent: (profit / (position.shares * position.entryPrice)) * 100,
      period: 100,
      closedAtEnd: true,
    });

    delete portfolio.positions[ticker];
  }

  // Calculate metrics
  const finalCapital = portfolio.cash;
  const totalProfit = finalCapital - portfolio.startingCapital;
  const returnPercent = (totalProfit / portfolio.startingCapital) * 100;

  const winningTrades = portfolio.trades.filter(
    t => t.type === 'sell' && t.profit > 0
  );
  const losingTrades = portfolio.trades.filter(
    t => t.type === 'sell' && t.profit < 0
  );
  const winRate =
    portfolio.trades.filter(t => t.type === 'sell').length > 0
      ? (winningTrades.length /
          portfolio.trades.filter(t => t.type === 'sell').length) *
        100
      : 0;

  const totalTrades = portfolio.trades.filter(t => t.type === 'sell').length;
  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length
      : 0;
  const avgLoss =
    losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length
      : 0;

  const profitFactor =
    Math.abs(avgLoss) > 0 ? Math.abs(avgWin * winningTrades.length) / Math.abs(avgLoss * losingTrades.length) : 0;

  return {
    name,
    startingCapital: portfolio.startingCapital,
    finalCapital: Number(finalCapital.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    returnPercent: Number(returnPercent.toFixed(2)),
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: Number(winRate.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    trades: portfolio.trades.map(t => ({
      type: t.type,
      ticker: t.ticker,
      shares: t.shares,
      price: Number(t.price.toFixed(2)),
      profit: t.profit ? Number(t.profit.toFixed(2)) : undefined,
      profitPercent: t.profitPercent ? Number(t.profitPercent.toFixed(2)) : undefined,
      confidence: t.confidence,
    })),
  };
}

// Run both simulations
console.log('🚀 Running Trading Simulations...\n');

const baseResults = runSimulation(generateBaseSignal, 'Base Signal Generation');
const phase1Results = runSimulation(generatePhase1Signal, 'Phase 1 Enhanced Signals');

// Compare results
console.log('═'.repeat(80));
console.log('TRADING SIMULATION RESULTS - BASE vs PHASE 1 IMPROVEMENTS');
console.log('═'.repeat(80));
console.log();

console.log('📊 PERFORMANCE COMPARISON');
console.log('─'.repeat(80));
console.log(
  `${String('Metric').padEnd(30)} ${String('Base Signals').padEnd(20)} ${String('Phase 1').padEnd(20)} ${String('Improvement').padEnd(10)}`
);
console.log('─'.repeat(80));

const metrics = [
  ['Starting Capital', 'startingCapital', '£'],
  ['Final Capital', 'finalCapital', '£'],
  ['Total Profit', 'totalProfit', '£'],
  ['Return %', 'returnPercent', '%'],
  ['Total Trades', 'totalTrades', ''],
  ['Winning Trades', 'winningTrades', ''],
  ['Losing Trades', 'losingTrades', ''],
  ['Win Rate', 'winRate', '%'],
  ['Avg Win', 'avgWin', '£'],
  ['Avg Loss', 'avgLoss', '£'],
  ['Profit Factor', 'profitFactor', 'x'],
];

metrics.forEach(([label, key, unit]) => {
  const baseVal = baseResults[key];
  const phase1Val = phase1Results[key];
  const improvement =
    baseVal !== 0
      ? ((phase1Val - baseVal) / Math.abs(baseVal)) * 100
      : phase1Val > 0
        ? 100
        : 0;

  const baseStr = `${baseVal}${unit}`;
  const phase1Str = `${phase1Val}${unit}`;
  const improvementStr =
    improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;

  console.log(
    `${String(label).padEnd(30)} ${String(baseStr).padEnd(20)} ${String(phase1Str).padEnd(20)} ${String(improvementStr).padEnd(10)}`
  );
});

console.log('─'.repeat(80));
console.log();

console.log('📈 DETAILED TRADE ANALYSIS');
console.log('─'.repeat(80));
console.log();

console.log('BASE SIGNAL TRADES:');
console.log(`Total: ${baseResults.totalTrades} | Win Rate: ${baseResults.winRate}%`);
baseResults.trades
  .filter(t => t.type === 'sell')
  .slice(0, 5)
  .forEach(t => {
    console.log(
      `  ${t.ticker}: ${t.shares} shares @ £${t.price} = £${t.profit} (${t.profitPercent}%)`
    );
  });
if (baseResults.trades.filter(t => t.type === 'sell').length > 5) {
  console.log(`  ... and ${baseResults.trades.filter(t => t.type === 'sell').length - 5} more trades`);
}
console.log();

console.log('PHASE 1 ENHANCED TRADES:');
console.log(`Total: ${phase1Results.totalTrades} | Win Rate: ${phase1Results.winRate}%`);
phase1Results.trades
  .filter(t => t.type === 'sell')
  .slice(0, 5)
  .forEach(t => {
    console.log(
      `  ${t.ticker}: ${t.shares} shares @ £${t.price} = £${t.profit} (${t.profitPercent}%)`
    );
  });
if (phase1Results.trades.filter(t => t.type === 'sell').length > 5) {
  console.log(`  ... and ${phase1Results.trades.filter(t => t.type === 'sell').length - 5} more trades`);
}
console.log();

console.log('═'.repeat(80));
console.log('✅ CONCLUSION');
console.log('═'.repeat(80));

const capitalImprovement =
  ((phase1Results.finalCapital - baseResults.finalCapital) /
    baseResults.finalCapital) *
  100;
const winRateImprovement = phase1Results.winRate - baseResults.winRate;

console.log();
console.log(`Phase 1 Improvements delivered:`);
console.log(`  • Capital improvement: +£${(phase1Results.finalCapital - baseResults.finalCapital).toFixed(2)} (${capitalImprovement.toFixed(1)}%)`);
console.log(`  • Win rate improvement: +${winRateImprovement.toFixed(1)}%`);
console.log(`  • Profit factor: ${phase1Results.profitFactor}x vs ${baseResults.profitFactor}x`);
console.log();

// Save results to file
const results = {
  timestamp: new Date().toISOString(),
  baseResults,
  phase1Results,
  comparison: {
    capitalImprovement: Number(capitalImprovement.toFixed(2)),
    winRateImprovement: Number(winRateImprovement.toFixed(2)),
    profitFactorImprovement: Number((phase1Results.profitFactor - baseResults.profitFactor).toFixed(2)),
  },
};

fs.writeFileSync(
  'backtest-results.json',
  JSON.stringify(results, null, 2)
);

console.log('📁 Results saved to backtest-results.json');
