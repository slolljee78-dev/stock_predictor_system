import { SimulatorPortfolio, SimulatorTrade, PendingOrder } from './tradingSimulatorState';

export interface ExecutionResult {
  executedOrders: SimulatorTrade[];
  cancelledOrders: PendingOrder[];
  updatedPendingOrders: PendingOrder[];
}

/**
 * Checks pending limit and stop-loss orders against current prices
 * and executes them if conditions are met
 */
export function executePendingOrders(
  portfolio: SimulatorPortfolio,
  currentPrices: Record<string, number>
): ExecutionResult {
  const executedOrders: SimulatorTrade[] = [];
  const cancelledOrders: PendingOrder[] = [];
  const updatedPendingOrders: PendingOrder[] = [];

  if (!portfolio.pendingOrders || portfolio.pendingOrders.length === 0) {
    return { executedOrders, cancelledOrders, updatedPendingOrders };
  }

  for (const order of portfolio.pendingOrders) {
    const currentPrice = currentPrices[order.ticker];

    // Skip if we don't have current price data
    if (currentPrice === undefined) {
      updatedPendingOrders.push(order);
      continue;
    }

    let shouldExecute = false;

    // Check limit order conditions
    if (order.orderType === 'limit') {
      if (order.type === 'buy' && order.limitPrice !== undefined) {
        // Buy limit: execute if current price <= limit price
        shouldExecute = currentPrice <= order.limitPrice;
      } else if (order.type === 'sell' && order.limitPrice !== undefined) {
        // Sell limit: execute if current price >= limit price
        shouldExecute = currentPrice >= order.limitPrice;
      }
    }

    // Check stop-loss conditions
    if (order.orderType === 'stop-loss' && order.stopPrice !== undefined) {
      // Stop-loss: execute if current price <= stop price (always sell)
      shouldExecute = currentPrice <= order.stopPrice;
    }

    if (shouldExecute) {
      // Create executed trade from pending order
      const executedTrade: SimulatorTrade = {
        id: Math.max(...portfolio.trades.map(t => t.id), 0) + 1,
        ticker: order.ticker,
        type: order.type,
        quantity: order.quantity,
        price: currentPrice,
        date: new Date().toISOString().split('T')[0],
        executedAt: new Date().toISOString(),
        priceSource: 'live',
        origin: 'auto',
        orderType: 'market', // Executed as market order at current price
        status: 'filled',
      };

      executedOrders.push(executedTrade);
    } else {
      // Keep order pending
      updatedPendingOrders.push(order);
    }
  }

  return {
    executedOrders,
    cancelledOrders,
    updatedPendingOrders,
  };
}

/**
 * Adds a new pending order to the portfolio
 */
export function addPendingOrder(
  portfolio: SimulatorPortfolio,
  order: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>
): PendingOrder {
  const newOrder: PendingOrder = {
    ...order,
    id: Math.max(...(portfolio.pendingOrders?.map(o => o.id) || [0]), 0) + 1,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  if (!portfolio.pendingOrders) {
    portfolio.pendingOrders = [];
  }

  portfolio.pendingOrders.push(newOrder);
  return newOrder;
}

/**
 * Cancels a pending order
 */
export function cancelPendingOrder(
  portfolio: SimulatorPortfolio,
  orderId: number
): boolean {
  if (!portfolio.pendingOrders) return false;

  const index = portfolio.pendingOrders.findIndex(o => o.id === orderId);
  if (index === -1) return false;

  portfolio.pendingOrders[index].status = 'cancelled';
  return true;
}

/**
 * Gets all active (non-cancelled) pending orders
 */
export function getActivePendingOrders(portfolio: SimulatorPortfolio): PendingOrder[] {
  return (portfolio.pendingOrders || []).filter(o => o.status === 'pending');
}

/**
 * Validates a pending order before adding it
 */
export function validatePendingOrder(
  order: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>,
  portfolio: SimulatorPortfolio,
  currentPrice: number
): { valid: boolean; error?: string } {
  // Validate quantity
  if (order.quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' };
  }

  // Validate limit price for limit orders
  if (order.orderType === 'limit' && order.limitPrice !== undefined) {
    if (order.limitPrice <= 0) {
      return { valid: false, error: 'Limit price must be greater than 0' };
    }

    // For buy orders, warn if limit price is significantly above current price
    if (order.type === 'buy' && order.limitPrice > currentPrice * 1.1) {
      return {
        valid: false,
        error: `Buy limit price (${order.limitPrice}) is more than 10% above current price (${currentPrice})`,
      };
    }

    // For sell orders, warn if limit price is significantly below current price
    if (order.type === 'sell' && order.limitPrice < currentPrice * 0.9) {
      return {
        valid: false,
        error: `Sell limit price (${order.limitPrice}) is more than 10% below current price (${currentPrice})`,
      };
    }
  }

  // Validate stop price for stop-loss orders
  if (order.orderType === 'stop-loss' && order.stopPrice !== undefined) {
    if (order.stopPrice <= 0) {
      return { valid: false, error: 'Stop price must be greater than 0' };
    }

    // Stop price should be below current price for sell orders
    if (order.stopPrice >= currentPrice) {
      return {
        valid: false,
        error: `Stop price (${order.stopPrice}) must be below current price (${currentPrice})`,
      };
    }
  }

  // Check if user has enough cash for buy orders
  if (order.type === 'buy') {
    const estimatedCost = order.quantity * (order.limitPrice || currentPrice) * 1.001; // Add 0.1% commission
    if (estimatedCost > portfolio.cash) {
      return {
        valid: false,
        error: `Insufficient cash. Need ${estimatedCost.toFixed(2)}, have ${portfolio.cash.toFixed(2)}`,
      };
    }
  }

  // Check if user has enough shares for sell orders
  if (order.type === 'sell') {
    const position = portfolio.positions.find(p => p.ticker === order.ticker);
    if (!position || position.quantity < order.quantity) {
      return {
        valid: false,
        error: `Insufficient shares. Need ${order.quantity}, have ${position?.quantity || 0}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Calculates the estimated execution price including commission and slippage
 */
export function calculateExecutionPrice(
  basePrice: number,
  orderType: 'buy' | 'sell',
  commission: number = 0.001, // 0.1% default
  slippage: number = 0.0005 // 0.05% default
): number {
  const slippageAmount = basePrice * slippage;
  const commissionAmount = basePrice * commission;

  if (orderType === 'buy') {
    // Buyer pays more (slippage + commission)
    return basePrice + slippageAmount + commissionAmount;
  } else {
    // Seller receives less (slippage + commission)
    return basePrice - slippageAmount - commissionAmount;
  }
}
