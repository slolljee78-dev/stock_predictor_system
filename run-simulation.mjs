#!/usr/bin/env node

/**
 * 24-Hour Trading Simulation
 * Runs a fictional £100 trading simulation using the ML signal engine
 */

import { simulate24HourTrading } from './server/tradingSimulator.ts';

async function main() {
  console.log('🚀 Starting 24-Hour Trading Simulation...\n');
  console.log('Initial Capital: £100');
  console.log('Trading Stocks: AAPL, MSFT, NVDA, TSLA, AMZN');
  console.log('Signal Threshold: 60% confidence\n');
  console.log('-------------------------------------------\n');

  try {
    const result = await simulate24HourTrading();

    console.log('📊 SIMULATION RESULTS\n');
    console.log(`Initial Capital:    £${result.initialCapital.toFixed(2)}`);
    console.log(`Final Capital:      £${result.finalCapital.toFixed(2)}`);
    console.log(`Total Return:       £${result.totalReturn.toFixed(2)}`);
    console.log(`Return %:           ${result.returnPercentage.toFixed(2)}%\n`);

    console.log('📈 TRADING STATISTICS\n');
    console.log(`Total Trades:       ${result.totalTrades}`);
    console.log(`Buy Orders:         ${result.trades.filter(t => t.action === 'buy').length}`);
    console.log(`Sell Orders:        ${result.trades.filter(t => t.action === 'sell').length}`);
    console.log(`Winning Trades:     ${result.winningTrades}`);
    console.log(`Losing Trades:      ${result.losingTrades}`);
    console.log(`Win Rate:           ${result.winRate.toFixed(2)}%\n`);

    if (result.bestTrade) {
      console.log('🏆 BEST TRADE\n');
      console.log(`Stock:              ${result.bestTrade.ticker}`);
      console.log(`Action:             ${result.bestTrade.action.toUpperCase()}`);
      console.log(`Price:              £${result.bestTrade.price.toFixed(2)}`);
      console.log(`Quantity:           ${result.bestTrade.quantity}`);
      console.log(`Value:              £${result.bestTrade.totalValue.toFixed(2)}`);
      console.log(`Signal Confidence:  ${result.bestTrade.signal.confidence}%\n`);
    }

    if (result.worstTrade) {
      console.log('📉 WORST TRADE\n');
      console.log(`Stock:              ${result.worstTrade.ticker}`);
      console.log(`Action:             ${result.worstTrade.action.toUpperCase()}`);
      console.log(`Price:              £${result.worstTrade.price.toFixed(2)}`);
      console.log(`Quantity:           ${result.worstTrade.quantity}`);
      console.log(`Value:              £${result.worstTrade.totalValue.toFixed(2)}`);
      console.log(`Signal Confidence:  ${result.worstTrade.signal.confidence}%\n`);
    }

    console.log('💼 FINAL PORTFOLIO\n');
    if (Object.keys(result.portfolio).length === 0) {
      console.log('Cash:               £' + result.finalCapital.toFixed(2));
      console.log('Holdings:           None');
    } else {
      console.log('Holdings:');
      for (const [ticker, quantity] of Object.entries(result.portfolio)) {
        console.log(`  ${ticker}:            ${quantity} shares`);
      }
      console.log(`\nCash:               £${result.trades[result.trades.length - 1]?.portfolio.cash.toFixed(2) || result.finalCapital.toFixed(2)}`);
    }

    console.log('\n-------------------------------------------\n');

    if (result.returnPercentage > 0) {
      console.log(`✅ SIMULATION PROFITABLE: +${result.returnPercentage.toFixed(2)}%\n`);
    } else if (result.returnPercentage < 0) {
      console.log(`❌ SIMULATION LOSS: ${result.returnPercentage.toFixed(2)}%\n`);
    } else {
      console.log('➡️  SIMULATION BREAK-EVEN\n');
    }

    console.log('Trade Log:');
    console.log('-------------------------------------------');
    result.trades.forEach((trade, index) => {
      const time = trade.timestamp.toLocaleTimeString();
      const action = trade.action === 'buy' ? '🔵 BUY' : '🔴 SELL';
      console.log(
        `${index + 1}. [${time}] ${action} ${trade.ticker} @ £${trade.price.toFixed(2)} (${trade.quantity} shares, £${trade.totalValue.toFixed(2)}) - Confidence: ${trade.signal.confidence}%`
      );
    });

  } catch (error) {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  }
}

main();
