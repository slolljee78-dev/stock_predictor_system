/**
 * Fractional Share Trading Helper Functions
 * Supports buying/selling fractional shares and dollar-based orders
 */

import { SimulatorPortfolio, SimulatorTrade, SimulatorPosition } from './tradingSimulatorState';

export interface FractionalOrderOptions {
  ticker: string;
  type: 'buy' | 'sell';
  price: number;
  // Either quantity OR dollarAmount must be provided
  quantity?: number;
  dollarAmount?: number;
  commission?: number; // Default: 0% (free trading)
  slippage?: number; // Default: 0.05%
}

export interface FractionalOrderResult {
  success: boolean;
  error?: string;
  trade?: SimulatorTrade;
  newCash?: number;
  newPosition?: SimulatorPosition;
}

/**
 * Calculate actual quantity from dollar amount
 */
export function calculateQuantityFromDollarAmount(
  dollarAmount: number,
  price: number,
  commission: number = 0
): number {
  if (price <= 0) return 0;
  
  // For buy orders: dollarAmount / (price * (1 + commission))
  // This ensures the total cost (including commission) equals dollarAmount
  const totalCost = dollarAmount / (1 + commission);
  return totalCost / price;
}

/**
 * Calculate dollar amount from quantity
 */
export function calculateDollarAmount(
  quantity: number,
  price: number,
  commission: number = 0
): number {
  const baseCost = quantity * price;
  return baseCost * (1 + commission);
}

/**
 * Validate fractional order
 */
export function validateFractionalOrder(
  options: FractionalOrderOptions,
  portfolio: SimulatorPortfolio,
  currentPrice: number
): { valid: boolean; error?: string } {
  // Must have either quantity or dollarAmount
  if (!options.quantity && !options.dollarAmount) {
    return { valid: false, error: 'Must specify either quantity or dollarAmount' };
  }

  // Cannot have both
  if (options.quantity && options.dollarAmount) {
    return { valid: false, error: 'Cannot specify both quantity and dollarAmount' };
  }

  const quantity = options.quantity || calculateQuantityFromDollarAmount(
    options.dollarAmount!,
    options.price,
    options.commission || 0
  );

  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be positive' };
  }

  const commission = options.commission || 0;
  const totalCost = quantity * options.price * (1 + commission);

  if (options.type === 'buy') {
    if (totalCost > portfolio.cash) {
      return {
        valid: false,
        error: `Insufficient cash. Need $${totalCost.toFixed(2)}, have $${portfolio.cash.toFixed(2)}`,
      };
    }
  } else {
    // Sell order
    const position = portfolio.positions.find(p => p.ticker === options.ticker);
    if (!position || position.quantity < quantity) {
      return {
        valid: false,
        error: `Insufficient shares. Need ${quantity.toFixed(4)}, have ${position?.quantity || 0}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Execute a fractional share order
 */
export function executeFractionalOrder(
  portfolio: SimulatorPortfolio,
  options: FractionalOrderOptions,
  tradeId: number
): FractionalOrderResult {
  // Validate order
  const validation = validateFractionalOrder(options, portfolio, options.price);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const quantity = options.quantity || calculateQuantityFromDollarAmount(
    options.dollarAmount!,
    options.price,
    options.commission || 0
  );

  const commission = options.commission || 0;
  const slippage = options.slippage || 0.0005; // 0.05% default
  
  // Calculate execution price with slippage
  const executionPrice = options.type === 'buy'
    ? options.price * (1 + slippage)
    : options.price * (1 - slippage);

  const totalCost = quantity * executionPrice * (1 + commission);
  const commissionAmount = quantity * executionPrice * commission;

  // Create trade record
  const trade: SimulatorTrade = {
    id: tradeId,
    ticker: options.ticker,
    type: options.type,
    quantity,
    price: executionPrice,
    date: new Date().toLocaleString(),
    executedAt: new Date().toISOString(),
    priceSource: 'live',
    origin: 'manual',
    isFractional: quantity % 1 !== 0,
    dollarAmount: options.dollarAmount,
    commission: commissionAmount,
  };

  // Update portfolio
  let newCash = portfolio.cash;
  let newPosition: SimulatorPosition | undefined;

  if (options.type === 'buy') {
    newCash -= totalCost;

    // Find or create position
    const existingPosition = portfolio.positions.find(p => p.ticker === options.ticker);
    if (existingPosition) {
      const totalQuantity = existingPosition.quantity + quantity;
      const totalCost = (existingPosition.quantity * existingPosition.entryPrice) +
                       (quantity * executionPrice);
      const newEntryPrice = totalCost / totalQuantity;

      newPosition = {
        ...existingPosition,
        quantity: totalQuantity,
        entryPrice: newEntryPrice,
        isFractional: totalQuantity % 1 !== 0,
      };
    } else {
      newPosition = {
        ticker: options.ticker,
        quantity,
        entryPrice: executionPrice,
        currentPrice: executionPrice,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        isFractional: quantity % 1 !== 0,
      };
    }
  } else {
    // Sell order
    newCash += totalCost;

    const existingPosition = portfolio.positions.find(p => p.ticker === options.ticker);
    if (existingPosition) {
      const newQuantity = existingPosition.quantity - quantity;
      if (newQuantity > 0.0001) { // Keep position if > 0.0001 shares
        newPosition = {
          ...existingPosition,
          quantity: newQuantity,
          isFractional: newQuantity % 1 !== 0,
        };
      }
    }
  }

  return {
    success: true,
    trade,
    newCash,
    newPosition,
  };
}

/**
 * Format fractional quantity for display
 */
export function formatFractionalQuantity(quantity: number): string {
  if (quantity % 1 === 0) {
    return quantity.toString();
  }
  return quantity.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Format dollar-based order for display
 */
export function formatDollarOrder(dollarAmount: number): string {
  return `$${dollarAmount.toFixed(2)}`;
}

/**
 * Calculate average cost per share including commission
 */
export function calculateAverageCostPerShare(
  quantity: number,
  price: number,
  commission: number = 0
): number {
  return price * (1 + commission);
}

/**
 * Calculate total investment including commission
 */
export function calculateTotalInvestment(
  quantity: number,
  price: number,
  commission: number = 0
): number {
  return quantity * price * (1 + commission);
}
