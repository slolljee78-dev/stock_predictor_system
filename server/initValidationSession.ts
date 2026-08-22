/**
 * Initialize 3-Month Validation Session
 * Sets up the validation tracking for £100 capital over 3 months
 */

import { initializePaperTradingSession, DEFAULT_VALIDATION_CONFIG } from "./paperTradingValidator";

export interface ValidationSessionConfig {
  startDate: string;
  startingCapital: number;
  targetMonthlyReturn: number;
  dailyLossLimit: number;
  tradesPerDay: number;
  stockCount: number;
  ownerEmail: string;
}

export function initializeValidationSession(config: ValidationSessionConfig) {
  const validationConfig = {
    ...DEFAULT_VALIDATION_CONFIG,
    startingCapital: config.startingCapital,
    monthlyTarget: config.targetMonthlyReturn,
    dailyLossLimit: config.dailyLossLimit,
  };

  const session = initializePaperTradingSession(validationConfig);

  const milestones = [
    {
      month: 1,
      target: config.startingCapital * 1.1,
      description: `£${config.startingCapital} → £${(config.startingCapital * 1.1).toFixed(2)}`,
    },
    {
      month: 2,
      target: config.startingCapital * 1.21,
      description: `£${(config.startingCapital * 1.1).toFixed(2)} → £${(config.startingCapital * 1.21).toFixed(2)}`,
    },
    {
      month: 3,
      target: config.startingCapital * 1.331,
      description: `£${(config.startingCapital * 1.21).toFixed(2)} → £${(config.startingCapital * 1.331).toFixed(2)}`,
    },
  ];

  const validationPlan = {
    sessionId: session.sessionId,
    startDate: config.startDate,
    startingCapital: config.startingCapital,
    targetFinalCapital: config.startingCapital * 1.331,
    dailyLossLimit: config.dailyLossLimit,
    tradesPerDay: config.tradesPerDay,
    stockCount: config.stockCount,
    ownerEmail: config.ownerEmail,
    milestones,
    successCriteria: {
      monthlyReturn: "10% per month (30% total)",
      winRate: "60%+",
      sharpeRatio: ">1.0",
      maxDrawdown: "<5%",
      riskCompliance: "0 days exceeding 2% daily loss limit",
    },
    expectedDuration: "90 days (3 months)",
    reportingSchedule: "Weekly reports every Sunday",
    finalAssessment: "After 90 days",
  };

  return validationPlan;
}

export function generateValidationStartReport(config: ValidationSessionConfig): string {
  const report = `
═══════════════════════════════════════════════════════════════
  3-MONTH PAPER TRADING VALIDATION - SESSION STARTED
═══════════════════════════════════════════════════════════════

📅 VALIDATION PERIOD
  Start Date: ${config.startDate}
  Duration: 90 days (3 months)
  End Date: ${new Date(new Date(config.startDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}

💰 CAPITAL & RISK
  Starting Capital: £${config.startingCapital}
  Daily Loss Limit: £${config.startingCapital * config.dailyLossLimit} (${config.dailyLossLimit * 100}%)
  Expected Trades/Day: ${config.tradesPerDay}
  Stocks to Trade: ${config.stockCount}

🎯 MONTHLY TARGETS
  Month 1: £${config.startingCapital} → £${(config.startingCapital * 1.1).toFixed(2)} (+10%)
  Month 2: £${(config.startingCapital * 1.1).toFixed(2)} → £${(config.startingCapital * 1.21).toFixed(2)} (+10%)
  Month 3: £${(config.startingCapital * 1.21).toFixed(2)} → £${(config.startingCapital * 1.331).toFixed(2)} (+10%)
  
  Total Target: +30% (£${(config.startingCapital * 1.331 - config.startingCapital).toFixed(2)})

✅ SUCCESS CRITERIA (ALL MUST BE MET)
  ✓ 3-month return: ≥30% (£${(config.startingCapital * 1.331).toFixed(2)})
  ✓ Win rate: ≥60%
  ✓ Sharpe ratio: >1.0
  ✓ Max drawdown: <5%
  ✓ Risk compliance: 0 days exceeding daily loss limit

📊 PERFORMANCE TRACKING
  Dashboard: Real-time metrics updated after each trade
  Weekly Reports: Sent every Sunday to ${config.ownerEmail}
  Monthly Assessment: After each 30-day period
  Final Report: After 90 days

🚀 NEXT STEPS
  1. Monitor dashboard daily at: https://manuspredictor-knj3qkdj.manus.space
  2. Review weekly reports (Sundays)
  3. Track progress toward monthly targets
  4. If any day hits 2% loss limit, trading stops automatically
  5. After 90 days, receive final validation assessment

⚠️  IMPORTANT NOTES
  • This is PAPER TRADING (no real money)
  • System will auto-stop if daily loss limit is hit
  • All trades use realistic slippage (0.05%) and commissions (0.1%)
  • Weekly reports include recommendations for improvements
  • If validation PASSES: Ready for real capital trading
  • If validation FAILS: Strategy improvements recommended

═══════════════════════════════════════════════════════════════
  Validation Session ID: [SESSION_ID]
  Started: ${new Date().toISOString()}
═══════════════════════════════════════════════════════════════
  `;

  return report;
}
