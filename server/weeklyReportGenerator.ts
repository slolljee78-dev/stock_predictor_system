/**
 * Weekly Performance Report Generator
 * Generates comprehensive weekly reports for validation tracking
 */

import { PaperTradingSession, TradeRecord } from "./paperTradingValidator";

export interface WeeklyReport {
  weekNumber: number;
  startDate: string;
  endDate: string;
  openingCapital: number;
  closingCapital: number;
  weeklyReturn: number;
  weeklyReturnPercent: number;
  targetReturn: number;
  targetMet: boolean;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWinSize: number;
  averageLossSize: number;
  profitFactor: number;
  bestTrade: TradeRecord | null;
  worstTrade: TradeRecord | null;
  sharpeRatio: number;
  maxDrawdown: number;
  daysRiskLimitHit: number;
  signalQuality: {
    highConfidenceWinRate: number;
    mediumConfidenceWinRate: number;
    lowConfidenceWinRate: number;
  };
  recommendations: string[];
  summary: string;
}

/**
 * Generate weekly report
 */
export function generateWeeklyReport(
  session: PaperTradingSession,
  weekNumber: number,
  startDate: string,
  endDate: string
): WeeklyReport {
  // Filter trades for the week
  const weekTrades = session.allTrades.filter((t) => t.date >= startDate && t.date <= endDate);

  // Calculate basic metrics
  const openingCapital = session.startingCapital;
  let closingCapital = openingCapital;
  for (const trade of weekTrades) {
    closingCapital += trade.pnl || 0;
  }

  const weeklyReturn = closingCapital - openingCapital;
  const weeklyReturnPercent = (weeklyReturn / openingCapital) * 100;

  // Calculate target (proportional to 10% monthly target)
  const targetReturn = openingCapital * session.config.monthlyTarget * (7 / 30); // Weekly proportional target
  const targetMet = weeklyReturn >= targetReturn;

  // Calculate win/loss metrics
  const winningTrades = weekTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = weekTrades.filter((t) => (t.pnl || 0) < 0);
  const totalTrades = weekTrades.length;
  const winRate = totalTrades > 0 ? winningTrades.length / totalTrades : 0;

  // Calculate average win/loss
  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const averageWinSize = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const averageLossSize = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

  // Calculate profit factor
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  // Find best and worst trades
  const bestTrade = weekTrades.reduce((best, trade) => {
    if (!best) return trade;
    return (trade.pnl || 0) > (best.pnl || 0) ? trade : best;
  }, null as TradeRecord | null);

  const worstTrade = weekTrades.reduce((worst, trade) => {
    if (!worst) return trade;
    return (trade.pnl || 0) < (worst.pnl || 0) ? trade : worst;
  }, null as TradeRecord | null);

  // Calculate Sharpe ratio
  const dailyReturns = session.dailyPerformance
    .filter((d) => d.date >= startDate && d.date <= endDate)
    .map((d) => d.dailyPnLPercent);
  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b) / dailyReturns.length : 0;
  const variance =
    dailyReturns.length > 0
      ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peakCapital = openingCapital;
  let runningCapital = openingCapital;
  for (const trade of weekTrades) {
    runningCapital += trade.pnl || 0;
    peakCapital = Math.max(peakCapital, runningCapital);
    const drawdown = (peakCapital - runningCapital) / peakCapital;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Count days risk limit was hit
  const daysRiskLimitHit = session.dailyPerformance
    .filter((d) => d.date >= startDate && d.date <= endDate && d.riskLimitHit).length;

  // Analyze signal quality by confidence
  const highConfidenceTrades = weekTrades.filter((t) => t.signal.confidence >= 80);
  const mediumConfidenceTrades = weekTrades.filter((t) => t.signal.confidence >= 60 && t.signal.confidence < 80);
  const lowConfidenceTrades = weekTrades.filter((t) => t.signal.confidence < 60);

  const highConfidenceWinRate =
    highConfidenceTrades.length > 0
      ? highConfidenceTrades.filter((t) => (t.pnl || 0) > 0).length / highConfidenceTrades.length
      : 0;
  const mediumConfidenceWinRate =
    mediumConfidenceTrades.length > 0
      ? mediumConfidenceTrades.filter((t) => (t.pnl || 0) > 0).length / mediumConfidenceTrades.length
      : 0;
  const lowConfidenceWinRate =
    lowConfidenceTrades.length > 0
      ? lowConfidenceTrades.filter((t) => (t.pnl || 0) > 0).length / lowConfidenceTrades.length
      : 0;

  // Generate recommendations
  const recommendations: string[] = [];

  if (weeklyReturnPercent < session.config.monthlyTarget * (7 / 30)) {
    recommendations.push(
      `Return below weekly target (${weeklyReturnPercent.toFixed(2)}% vs ${(session.config.monthlyTarget * (7 / 30) * 100).toFixed(2)}% target)`
    );
  }

  if (winRate < session.config.minWinRate) {
    recommendations.push(
      `Win rate below target (${(winRate * 100).toFixed(1)}% vs ${(session.config.minWinRate * 100).toFixed(1)}% target)`
    );
  }

  if (maxDrawdown > session.config.maxDrawdown) {
    recommendations.push(
      `Max drawdown exceeds limit (${(maxDrawdown * 100).toFixed(2)}% vs ${(session.config.maxDrawdown * 100).toFixed(2)}% limit)`
    );
  }

  if (daysRiskLimitHit > 0) {
    recommendations.push(`Daily loss limit hit on ${daysRiskLimitHit} day(s) - review risk management`);
  }

  if (highConfidenceWinRate > mediumConfidenceWinRate) {
    recommendations.push(
      `High confidence signals performing better (${(highConfidenceWinRate * 100).toFixed(1)}% vs ${(mediumConfidenceWinRate * 100).toFixed(1)}%) - focus on high confidence trades`
    );
  }

  if (profitFactor < 1.5) {
    recommendations.push(
      `Low profit factor (${profitFactor.toFixed(2)}) - consider tightening stop losses or improving signal quality`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Week performed well - maintain current strategy");
  }

  // Generate summary
  let summary = `Week ${weekNumber} (${startDate} to ${endDate}): `;
  summary += `Capital: £${openingCapital.toFixed(2)} → £${closingCapital.toFixed(2)} `;
  summary += `(+${weeklyReturnPercent.toFixed(2)}%). `;
  summary += `${totalTrades} trades with ${(winRate * 100).toFixed(1)}% win rate. `;
  summary += `Sharpe: ${sharpeRatio.toFixed(2)}, Drawdown: ${(maxDrawdown * 100).toFixed(2)}%. `;
  summary += targetMet ? "✓ Target met." : "✗ Target missed.";

  return {
    weekNumber,
    startDate,
    endDate,
    openingCapital,
    closingCapital,
    weeklyReturn,
    weeklyReturnPercent,
    targetReturn,
    targetMet,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    averageWinSize,
    averageLossSize,
    profitFactor,
    bestTrade,
    worstTrade,
    sharpeRatio,
    maxDrawdown,
    daysRiskLimitHit,
    signalQuality: {
      highConfidenceWinRate,
      mediumConfidenceWinRate,
      lowConfidenceWinRate,
    },
    recommendations,
    summary,
  };
}

/**
 * Generate multiple weekly reports for a month
 */
export function generateMonthlyWeeklyReports(
  session: PaperTradingSession,
  month: number,
  monthStartDate: string,
  monthEndDate: string
): WeeklyReport[] {
  const reports: WeeklyReport[] = [];

  // Calculate weeks in the month
  const start = new Date(monthStartDate);
  const end = new Date(monthEndDate);

  let weekNumber = (month - 1) * 4 + 1;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Don't go past month end
    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const report = generateWeeklyReport(session, weekNumber, weekStartStr, weekEndStr);
    reports.push(report);

    weekNumber++;
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return reports;
}

/**
 * Generate HTML report for email/download
 */
export function generateWeeklyReportHTML(report: WeeklyReport): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Weekly Report - Week ${report.weekNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-label { font-size: 12px; color: #7f8c8d; }
    .metric-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .positive { color: #27ae60; }
    .negative { color: #e74c3c; }
    .section { margin: 30px 0; padding: 15px; background: #ecf0f1; border-radius: 5px; }
    .section-title { font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #bdc3c7; }
    th { background: #34495e; color: white; }
    tr:nth-child(even) { background: #f8f9fa; }
    .recommendation { padding: 10px; margin: 5px 0; background: #fff3cd; border-left: 4px solid #ffc107; }
    .summary { padding: 15px; background: #d5f4e6; border-radius: 5px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Weekly Performance Report - Week ${report.weekNumber}</h1>
  <p>${report.startDate} to ${report.endDate}</p>

  <div class="section">
    <div class="section-title">Key Metrics</div>
    <div class="metric">
      <div class="metric-label">Opening Capital</div>
      <div class="metric-value">£${report.openingCapital.toFixed(2)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Closing Capital</div>
      <div class="metric-value ${report.weeklyReturn >= 0 ? "positive" : "negative"}">
        £${report.closingCapital.toFixed(2)}
      </div>
    </div>
    <div class="metric">
      <div class="metric-label">Weekly Return</div>
      <div class="metric-value ${report.weeklyReturn >= 0 ? "positive" : "negative"}">
        ${report.weeklyReturn >= 0 ? "+" : ""}${report.weeklyReturnPercent.toFixed(2)}%
      </div>
    </div>
    <div class="metric">
      <div class="metric-label">Win Rate</div>
      <div class="metric-value">${(report.winRate * 100).toFixed(1)}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Sharpe Ratio</div>
      <div class="metric-value">${report.sharpeRatio.toFixed(2)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Max Drawdown</div>
      <div class="metric-value">${(report.maxDrawdown * 100).toFixed(2)}%</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Trade Summary</div>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Total Trades</td>
        <td>${report.totalTrades}</td>
      </tr>
      <tr>
        <td>Winning Trades</td>
        <td class="positive">${report.winningTrades}</td>
      </tr>
      <tr>
        <td>Losing Trades</td>
        <td class="negative">${report.losingTrades}</td>
      </tr>
      <tr>
        <td>Average Win Size</td>
        <td class="positive">£${report.averageWinSize.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Average Loss Size</td>
        <td class="negative">£${report.averageLossSize.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Profit Factor</td>
        <td>${report.profitFactor.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Signal Quality Analysis</div>
    <table>
      <tr>
        <th>Confidence Level</th>
        <th>Win Rate</th>
      </tr>
      <tr>
        <td>High (≥80%)</td>
        <td>${(report.signalQuality.highConfidenceWinRate * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Medium (60-79%)</td>
        <td>${(report.signalQuality.mediumConfidenceWinRate * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Low (<60%)</td>
        <td>${(report.signalQuality.lowConfidenceWinRate * 100).toFixed(1)}%</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Best & Worst Trades</div>
    <table>
      <tr>
        <th>Trade</th>
        <th>Ticker</th>
        <th>Type</th>
        <th>P&L</th>
      </tr>
      ${
        report.bestTrade
          ? `<tr>
        <td>Best</td>
        <td>${report.bestTrade.ticker}</td>
        <td>${report.bestTrade.type}</td>
        <td class="positive">+£${(report.bestTrade.pnl || 0).toFixed(2)}</td>
      </tr>`
          : ""
      }
      ${
        report.worstTrade
          ? `<tr>
        <td>Worst</td>
        <td>${report.worstTrade.ticker}</td>
        <td>${report.worstTrade.type}</td>
        <td class="negative">-£${Math.abs(report.worstTrade.pnl || 0).toFixed(2)}</td>
      </tr>`
          : ""
      }
    </table>
  </div>

  <div class="section">
    <div class="section-title">Recommendations</div>
    ${report.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join("")}
  </div>

  <div class="summary">
    <strong>Summary:</strong> ${report.summary}
  </div>
</body>
</html>
  `;

  return html;
}
