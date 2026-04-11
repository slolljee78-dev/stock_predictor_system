/**
 * 3-Month Validation Tracker
 * Monitors progress toward 3-month validation goals
 * Target: £100 → £110 → £121 → £133.10 with 2% daily loss limit
 */

import { PaperTradingSession } from "./paperTradingValidator";

export interface ValidationMilestone {
  month: number;
  targetCapital: number;
  actualCapital: number;
  targetReturn: number;
  actualReturn: number;
  returnPercent: number;
  targetMet: boolean;
  startDate: string;
  endDate: string;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  daysRiskLimitHit: number;
}

export interface ValidationAssessment {
  validationStatus: "IN_PROGRESS" | "PASSED" | "FAILED";
  overallProgress: number;
  milestones: ValidationMilestone[];
  passedCriteria: string[];
  failedCriteria: string[];
  riskAssessment: {
    daysExceededLimit: number;
    totalDays: number;
    riskCompliance: number;
  };
  recommendations: string[];
  nextSteps: string[];
  readyForRealTrading: boolean;
}

export function calculateMilestone(
  session: PaperTradingSession,
  month: number,
  monthStartDate: string,
  monthEndDate: string
): ValidationMilestone {
  const targetCapital = session.startingCapital * Math.pow(1 + session.config.monthlyTarget, month);
  const monthTrades = session.allTrades.filter((t) => t.date >= monthStartDate && t.date <= monthEndDate);

  let actualCapital = session.startingCapital * Math.pow(1 + session.config.monthlyTarget, month - 1);
  for (const trade of monthTrades) {
    actualCapital += trade.pnl || 0;
  }

  const openingCapital = session.startingCapital * Math.pow(1 + session.config.monthlyTarget, month - 1);
  const actualReturn = actualCapital - openingCapital;
  const targetReturn = targetCapital - openingCapital;
  const returnPercent = (actualReturn / openingCapital) * 100;
  const targetMet = actualReturn >= targetReturn;

  const winningTrades = monthTrades.filter((t) => (t.pnl || 0) > 0).length;
  const totalTrades = monthTrades.length;
  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  const dailyReturns = session.dailyPerformance
    .filter((d) => d.date >= monthStartDate && d.date <= monthEndDate)
    .map((d) => d.dailyPnLPercent);
  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b) / dailyReturns.length : 0;
  const variance =
    dailyReturns.length > 0
      ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  let maxDrawdown = 0;
  let peakCapital = openingCapital;
  let runningCapital = openingCapital;
  for (const trade of monthTrades) {
    runningCapital += trade.pnl || 0;
    peakCapital = Math.max(peakCapital, runningCapital);
    const drawdown = (peakCapital - runningCapital) / peakCapital;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  const daysRiskLimitHit = session.dailyPerformance
    .filter((d) => d.date >= monthStartDate && d.date <= monthEndDate && d.riskLimitHit).length;

  return {
    month,
    targetCapital,
    actualCapital,
    targetReturn,
    actualReturn,
    returnPercent,
    targetMet,
    startDate: monthStartDate,
    endDate: monthEndDate,
    totalTrades,
    winRate,
    sharpeRatio,
    maxDrawdown,
    daysRiskLimitHit,
  };
}

export function generateValidationAssessment(
  session: PaperTradingSession,
  month1Start: string,
  month1End: string,
  month2Start: string,
  month2End: string,
  month3Start: string,
  month3End: string
): ValidationAssessment {
  const milestone1 = calculateMilestone(session, 1, month1Start, month1End);
  const milestone2 = calculateMilestone(session, 2, month2Start, month2End);
  const milestone3 = calculateMilestone(session, 3, month3Start, month3End);

  const milestones = [milestone1, milestone2, milestone3];

  const targetFinal = session.startingCapital * Math.pow(1 + session.config.monthlyTarget, 3);
  const overallProgress = (milestone3.actualCapital / targetFinal) * 100;

  const passedCriteria: string[] = [];
  const failedCriteria: string[] = [];

  const totalReturn = milestone3.actualCapital - session.startingCapital;
  const totalReturnPercent = (totalReturn / session.startingCapital) * 100;
  const targetTotalReturn = session.config.monthlyTarget * 3 * 100;

  if (totalReturnPercent >= targetTotalReturn) {
    passedCriteria.push(`3-month return target: ${totalReturnPercent.toFixed(2)}% >= ${targetTotalReturn.toFixed(2)}%`);
  } else {
    failedCriteria.push(`3-month return target: ${totalReturnPercent.toFixed(2)}% < ${targetTotalReturn.toFixed(2)}%`);
  }

  const allTrades = session.allTrades;
  const winningTrades = allTrades.filter((t) => (t.pnl || 0) > 0).length;
  const totalTrades = allTrades.length;
  const overallWinRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  if (overallWinRate >= session.config.minWinRate) {
    passedCriteria.push(`Win rate: ${(overallWinRate * 100).toFixed(2)}% >= ${(session.config.minWinRate * 100).toFixed(2)}%`);
  } else {
    failedCriteria.push(`Win rate: ${(overallWinRate * 100).toFixed(2)}% < ${(session.config.minWinRate * 100).toFixed(2)}%`);
  }

  if (milestone3.sharpeRatio >= session.config.minSharpeRatio) {
    passedCriteria.push(`Sharpe ratio: ${milestone3.sharpeRatio.toFixed(2)} >= ${session.config.minSharpeRatio.toFixed(2)}`);
  } else {
    failedCriteria.push(`Sharpe ratio: ${milestone3.sharpeRatio.toFixed(2)} < ${session.config.minSharpeRatio.toFixed(2)}`);
  }

  if (milestone3.maxDrawdown <= session.config.maxDrawdown) {
    passedCriteria.push(`Max drawdown: ${(milestone3.maxDrawdown * 100).toFixed(2)}% <= ${(session.config.maxDrawdown * 100).toFixed(2)}%`);
  } else {
    failedCriteria.push(`Max drawdown: ${(milestone3.maxDrawdown * 100).toFixed(2)}% > ${(session.config.maxDrawdown * 100).toFixed(2)}%`);
  }

  const totalDays = 90;
  const totalRiskDays = milestone1.daysRiskLimitHit + milestone2.daysRiskLimitHit + milestone3.daysRiskLimitHit;
  const riskCompliance = Math.max(0, 100 - (totalRiskDays / totalDays) * 100);

  if (totalRiskDays === 0) {
    passedCriteria.push("Risk compliance: 100% - No days exceeded 2% daily loss limit");
  } else if (totalRiskDays <= 3) {
    passedCriteria.push(`Risk compliance: ${riskCompliance.toFixed(1)}% - Only ${totalRiskDays} days exceeded limit`);
  } else {
    failedCriteria.push(`Risk compliance: ${riskCompliance.toFixed(1)}% - ${totalRiskDays} days exceeded 2% daily loss limit`);
  }

  const monthlyTargetsMet = milestones.filter((m) => m.targetMet).length;
  if (monthlyTargetsMet === 3) {
    passedCriteria.push("All 3 monthly targets met (10% each month)");
  } else if (monthlyTargetsMet >= 2) {
    passedCriteria.push(`${monthlyTargetsMet}/3 monthly targets met`);
  } else {
    failedCriteria.push(`Only ${monthlyTargetsMet}/3 monthly targets met`);
  }

  const validationStatus = failedCriteria.length === 0 ? "PASSED" : "FAILED";

  const recommendations: string[] = [];

  if (validationStatus === "PASSED") {
    recommendations.push("System is ready for real capital trading");
    recommendations.push("All validation criteria have been met");
    recommendations.push("Risk management is effective");
    recommendations.push("Signal quality is consistent");
  } else {
    if (failedCriteria.some((c) => c.includes("return"))) {
      recommendations.push("Improve signal accuracy - returns are below target");
      recommendations.push("Review signal generation parameters and thresholds");
    }
    if (failedCriteria.some((c) => c.includes("Win rate"))) {
      recommendations.push("Increase win rate - consider tightening entry criteria");
      recommendations.push("Focus on high-confidence signals (80%+)");
    }
    if (failedCriteria.some((c) => c.includes("Sharpe"))) {
      recommendations.push("Improve risk-adjusted returns - increase consistency");
      recommendations.push("Reduce volatility through better position sizing");
    }
    if (failedCriteria.some((c) => c.includes("drawdown"))) {
      recommendations.push("Tighten risk management - drawdown is too high");
      recommendations.push("Implement stricter stop-loss rules");
    }
    if (failedCriteria.some((c) => c.includes("Risk compliance"))) {
      recommendations.push("Review daily loss limit enforcement");
      recommendations.push("Reduce position sizes on losing days");
    }
  }

  const nextSteps: string[] = [];

  if (validationStatus === "PASSED") {
    nextSteps.push("1. Review final validation report");
    nextSteps.push("2. Set up Trading 212 API integration");
    nextSteps.push("3. Start with small capital (100-500)");
    nextSteps.push("4. Monitor real trading performance");
    nextSteps.push("5. Scale capital gradually based on performance");
  } else {
    nextSteps.push("1. Analyze failed criteria in detail");
    nextSteps.push("2. Adjust strategy parameters");
    nextSteps.push("3. Run additional validation period (1-2 months)");
    nextSteps.push("4. Re-test with updated strategy");
    nextSteps.push("5. Achieve passing criteria before real trading");
  }

  const readyForRealTrading = validationStatus === "PASSED";

  return {
    validationStatus,
    overallProgress: Math.min(overallProgress, 100),
    milestones,
    passedCriteria,
    failedCriteria,
    riskAssessment: {
      daysExceededLimit: totalRiskDays,
      totalDays,
      riskCompliance,
    },
    recommendations,
    nextSteps,
    readyForRealTrading,
  };
}
