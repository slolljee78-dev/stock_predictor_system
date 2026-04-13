/**
 * Risk Strategy Service
 * Customizes signal generation based on user's risk tolerance
 */

export type RiskStrategy = 'cautious' | 'balanced' | 'high_risk';

export interface RiskStrategyConfig {
  // Minimum confidence threshold for signals
  minConfidence: number;
  
  // Maximum position size as % of portfolio
  maxPositionSize: number;
  
  // Stop loss percentage
  stopLossPercent: number;
  
  // Take profit percentage
  takeProfitPercent: number;
  
  // Maximum daily loss limit
  maxDailyLossPercent: number;
  
  // Signal strength multiplier (affects confidence scoring)
  confidenceMultiplier: number;
  
  // Volume confirmation requirement
  requireVolumeConfirmation: boolean;
  
  // Multi-timeframe analysis requirement
  requireMultiTimeframeConfirmation: boolean;
  
  // Trend strength requirement (0-100)
  minTrendStrength: number;
}

/**
 * Get risk strategy configuration
 */
export function getRiskStrategyConfig(strategy: RiskStrategy): RiskStrategyConfig {
  switch (strategy) {
    case 'cautious':
      return {
        minConfidence: 85, // Only high confidence signals
        maxPositionSize: 2, // Small positions
        stopLossPercent: 2, // Tight stop loss
        takeProfitPercent: 3, // Conservative profit target
        maxDailyLossPercent: 1, // Very strict daily limit
        confidenceMultiplier: 1.2, // Boost confidence requirements
        requireVolumeConfirmation: true, // Require volume confirmation
        requireMultiTimeframeConfirmation: true, // Require multi-timeframe
        minTrendStrength: 70, // Strong trend required
      };
      
    case 'balanced':
      return {
        minConfidence: 70, // Moderate confidence signals
        maxPositionSize: 5, // Moderate positions
        stopLossPercent: 3, // Reasonable stop loss
        takeProfitPercent: 5, // Balanced profit target
        maxDailyLossPercent: 2, // Moderate daily limit
        confidenceMultiplier: 1.0, // Normal confidence
        requireVolumeConfirmation: true, // Require volume
        requireMultiTimeframeConfirmation: false, // Optional multi-timeframe
        minTrendStrength: 50, // Moderate trend
      };
      
    case 'high_risk':
      return {
        minConfidence: 55, // Lower confidence threshold
        maxPositionSize: 10, // Larger positions
        stopLossPercent: 5, // Wider stop loss
        takeProfitPercent: 8, // Aggressive profit target
        maxDailyLossPercent: 5, // Higher daily limit
        confidenceMultiplier: 0.8, // Lower confidence requirements
        requireVolumeConfirmation: false, // Volume optional
        requireMultiTimeframeConfirmation: false, // Multi-timeframe optional
        minTrendStrength: 30, // Weaker trend acceptable
      };
      
    default:
      return getRiskStrategyConfig('balanced');
  }
}

/**
 * Generate risk-adjusted signal prompt for LLM
 */
export function generateRiskStrategyPrompt(strategy: RiskStrategy): string {
  const config = getRiskStrategyConfig(strategy);
  
  switch (strategy) {
    case 'cautious':
      return `
You are a conservative trading signal generator. Generate signals only when you are HIGHLY confident.

Requirements:
- Only generate BUY signals when price shows strong uptrend (${config.minTrendStrength}%+ strength)
- Only generate SELL signals when price shows clear downtrend or major resistance
- Require multiple confirming indicators (RSI, MACD, Moving Averages all aligned)
- Require volume confirmation for all signals
- Assign low confidence (<${config.minConfidence}%) to any uncertain signals
- Prioritize capital preservation over profits
- Avoid signals during high volatility periods

Signal Confidence Threshold: ${config.minConfidence}%
Stop Loss: ${config.stopLossPercent}%
Take Profit: ${config.takeProfitPercent}%
`;
      
    case 'balanced':
      return `
You are a balanced trading signal generator. Generate signals with good risk/reward balance.

Requirements:
- Generate BUY signals when price shows uptrend (${config.minTrendStrength}%+ strength) with 2+ confirming indicators
- Generate SELL signals when price shows downtrend or hits resistance
- Volume confirmation recommended but not required
- Balance between profit potential and risk management
- Assign moderate confidence (${config.minConfidence}%+) to well-formed signals
- Consider both technical and volume factors

Signal Confidence Threshold: ${config.minConfidence}%
Stop Loss: ${config.stopLossPercent}%
Take Profit: ${config.takeProfitPercent}%
`;
      
    case 'high_risk':
      return `
You are an aggressive trading signal generator. Generate signals to capture maximum opportunities.

Requirements:
- Generate BUY signals when price shows any uptrend (${config.minTrendStrength}%+ strength)
- Generate SELL signals when momentum weakens or price hits resistance
- Single confirming indicator is sufficient
- Volume confirmation optional
- Assign confidence based on signal strength, even if moderate
- Prioritize capturing profits over strict risk management
- Include signals during volatile periods if momentum is strong

Signal Confidence Threshold: ${config.minConfidence}%
Stop Loss: ${config.stopLossPercent}%
Take Profit: ${config.takeProfitPercent}%
`;
      
    default:
      return generateRiskStrategyPrompt('balanced');
  }
}

/**
 * Filter signals based on risk strategy
 */
export function filterSignalByRiskStrategy(
  signal: {
    action: 'BUY' | 'SELL' | 'NEUTRAL';
    confidence: number;
    trendStrength?: number;
    volumeConfirmed?: boolean;
    multiTimeframeConfirmed?: boolean;
  },
  strategy: RiskStrategy
): boolean {
  const config = getRiskStrategyConfig(strategy);
  
  // Check confidence threshold
  if (signal.confidence < config.minConfidence) {
    return false;
  }
  
  // Check trend strength if provided
  if (signal.trendStrength !== undefined && signal.trendStrength < config.minTrendStrength) {
    return false;
  }
  
  // Check volume confirmation if required
  if (config.requireVolumeConfirmation && !signal.volumeConfirmed) {
    return false;
  }
  
  // Check multi-timeframe confirmation if required
  if (config.requireMultiTimeframeConfirmation && !signal.multiTimeframeConfirmed) {
    return false;
  }
  
  return true;
}

/**
 * Adjust signal confidence based on risk strategy
 */
export function adjustConfidenceByRiskStrategy(
  confidence: number,
  strategy: RiskStrategy
): number {
  const config = getRiskStrategyConfig(strategy);
  return Math.min(100, confidence * config.confidenceMultiplier);
}

/**
 * Get risk strategy description
 */
export function getRiskStrategyDescription(strategy: RiskStrategy): string {
  switch (strategy) {
    case 'cautious':
      return 'Conservative approach with high confidence requirements, tight stop losses, and strict risk limits. Best for risk-averse traders.';
    case 'balanced':
      return 'Moderate approach balancing profit potential with risk management. Suitable for most traders.';
    case 'high_risk':
      return 'Aggressive approach maximizing profit opportunities with wider stops and higher risk limits. For experienced traders.';
    default:
      return '';
  }
}
