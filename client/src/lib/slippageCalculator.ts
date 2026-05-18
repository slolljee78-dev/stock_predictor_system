/**
 * Market-Realistic Slippage Calculator
 * Models real-world order execution with variable slippage based on:
 * - Stock price (lower prices = higher slippage %)
 * - Order size (larger orders = higher slippage)
 * - Market volatility (higher volatility = higher slippage)
 * - Bid-ask spread (wider spread = higher slippage)
 */

export interface SlippageFactors {
  price: number; // Stock price
  quantity: number; // Order size in shares
  volatility?: number; // 0-1 (0 = low, 1 = high)
  bidAskSpread?: number; // Bid-ask spread in dollars
  orderType?: 'market' | 'limit'; // Market orders have more slippage
}

export interface SlippageResult {
  slippagePercent: number; // Slippage as percentage (e.g., 0.05 = 0.05%)
  slippageDollars: number; // Slippage in dollars
  executionPrice: number; // Final execution price
}

/**
 * Calculate base slippage from bid-ask spread
 * Typical spreads: $0.01 for large caps, $0.05-$0.10 for mid caps, $0.10+ for small caps
 */
function calculateBaseSlippage(price: number, spread?: number): number {
  if (spread) {
    return (spread / 2) / price; // Half the spread on average
  }

  // Estimate spread based on price
  if (price > 100) {
    return 0.0001; // $0.01 spread for high-price stocks
  } else if (price > 50) {
    return 0.0002; // $0.01 spread for mid-price stocks
  } else if (price > 10) {
    return 0.0005; // $0.05 spread for lower-price stocks
  } else {
    return 0.001; // $0.10 spread for penny stocks
  }
}

/**
 * Calculate order size impact on slippage
 * Larger orders have more market impact
 */
function calculateOrderSizeImpact(quantity: number, price: number): number {
  const orderValue = quantity * price;

  // Assume typical daily volume is $1M for average stock
  const typicalDailyVolume = 1000000;
  const orderSizeRatio = orderValue / typicalDailyVolume;

  // Order size impact (non-linear): 0.1% of daily volume = 0.01% slippage
  if (orderSizeRatio < 0.001) {
    return 0; // Negligible impact
  } else if (orderSizeRatio < 0.01) {
    return orderSizeRatio * 0.01; // Linear up to 0.01% of daily volume
  } else if (orderSizeRatio < 0.1) {
    return 0.0001 + (orderSizeRatio - 0.01) * 0.02; // Accelerating impact
  } else {
    return 0.003; // Cap at 0.3% for very large orders
  }
}

/**
 * Calculate volatility impact on slippage
 * Higher volatility = wider spreads = higher slippage
 */
function calculateVolatilityImpact(volatility: number = 0.5): number {
  // Volatility from 0 (very stable) to 1 (very volatile)
  // Maps to 0% to 0.2% additional slippage
  return volatility * 0.002;
}

/**
 * Calculate market impact for large orders
 * Temporary price movement caused by the order itself
 */
function calculateMarketImpact(quantity: number, price: number): number {
  const orderValue = quantity * price;
  const typicalDailyVolume = 1000000;
  const orderSizeRatio = orderValue / typicalDailyVolume;

  // Market impact: 0.1% of daily volume = 0.05% price movement
  return Math.min(orderSizeRatio * 0.5, 0.01); // Cap at 1%
}

/**
 * Calculate total slippage for a market order
 */
export function calculateMarketOrderSlippage(factors: SlippageFactors): SlippageResult {
  const baseSlippage = calculateBaseSlippage(factors.price, factors.bidAskSpread);
  const orderSizeImpact = calculateOrderSizeImpact(factors.quantity, factors.price);
  const volatilityImpact = calculateVolatilityImpact(factors.volatility);
  const marketImpact = calculateMarketImpact(factors.quantity, factors.price);

  const totalSlippagePercent = baseSlippage + orderSizeImpact + volatilityImpact + marketImpact;
  const slippageDollars = factors.price * totalSlippagePercent;
  const executionPrice = factors.price + slippageDollars;

  return {
    slippagePercent: totalSlippagePercent,
    slippageDollars,
    executionPrice,
  };
}

/**
 * Calculate slippage for a limit order
 * Limit orders have less slippage but may not fill
 */
export function calculateLimitOrderSlippage(factors: SlippageFactors): SlippageResult {
  // Limit orders typically have 50% less slippage than market orders
  const marketSlippage = calculateMarketOrderSlippage(factors);
  const limitSlippagePercent = marketSlippage.slippagePercent * 0.5;
  const slippageDollars = factors.price * limitSlippagePercent;
  const executionPrice = factors.price + slippageDollars;

  return {
    slippagePercent: limitSlippagePercent,
    slippageDollars,
    executionPrice,
  };
}

/**
 * Calculate slippage for a sell order
 * Sell orders have slippage in the opposite direction (price reduction)
 */
export function calculateSellOrderSlippage(factors: SlippageFactors): SlippageResult {
  const result = calculateMarketOrderSlippage(factors);
  return {
    slippagePercent: result.slippagePercent,
    slippageDollars: -result.slippageDollars, // Negative for sell orders
    executionPrice: factors.price - result.slippageDollars,
  };
}

/**
 * Get realistic slippage for a trade
 */
export function getRealisticSlippage(
  price: number,
  quantity: number,
  orderType: 'market' | 'limit' = 'market',
  tradeType: 'buy' | 'sell' = 'buy',
  volatility: number = 0.5
): number {
  const factors: SlippageFactors = {
    price,
    quantity,
    volatility,
    orderType,
  };

  let result: SlippageResult;

  if (orderType === 'limit') {
    result = calculateLimitOrderSlippage(factors);
  } else if (tradeType === 'sell') {
    result = calculateSellOrderSlippage(factors);
  } else {
    result = calculateMarketOrderSlippage(factors);
  }

  return result.slippagePercent;
}

/**
 * Format slippage for display
 */
export function formatSlippage(slippagePercent: number): string {
  return `${(slippagePercent * 100).toFixed(3)}%`;
}

/**
 * Get slippage description for user education
 */
export function getSlippageDescription(slippagePercent: number): string {
  if (slippagePercent < 0.0001) {
    return 'Negligible slippage';
  } else if (slippagePercent < 0.0005) {
    return 'Very low slippage (large cap stock)';
  } else if (slippagePercent < 0.001) {
    return 'Low slippage (mid cap stock)';
  } else if (slippagePercent < 0.005) {
    return 'Moderate slippage (small cap stock)';
  } else if (slippagePercent < 0.01) {
    return 'High slippage (very small cap or large order)';
  } else {
    return 'Very high slippage (penny stock or extremely large order)';
  }
}
