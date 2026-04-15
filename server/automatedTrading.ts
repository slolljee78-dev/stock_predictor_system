/**
 * Automated Trading Execution - Phase 5
 * Handles order execution, position management, and broker integration
 */

export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type OrderStatus = "pending" | "filled" | "partial" | "cancelled" | "rejected";
export type PositionStatus = "open" | "closed" | "pending_close";

export interface Order {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  orderType: OrderType;
  quantity: number;
  price: number;
  stopPrice?: number;
  status: OrderStatus;
  filledQuantity: number;
  filledPrice: number;
  createdAt: Date;
  filledAt?: Date;
  commission: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  status: PositionStatus;
  openedAt: Date;
  closedAt?: Date;
  stopLoss: number;
  takeProfit: number;
  unrealizedPL: number;
  realizedPL: number;
  orderId: string;
}

export interface ExecutionLog {
  timestamp: Date;
  symbol: string;
  action: string;
  details: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface BrokerConfig {
  name: string;
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  paperTrading: boolean;
}

/**
 * Order Executor - Handles order execution
 */
export class OrderExecutor {
  private orders: Map<string, Order> = new Map();
  private positions: Map<string, Position> = new Map();
  private executionLogs: ExecutionLog[] = [];
  private brokerConfig: BrokerConfig;

  constructor(brokerConfig: BrokerConfig) {
    this.brokerConfig = brokerConfig;
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    symbol: string,
    type: "BUY" | "SELL",
    quantity: number
  ): Promise<Order> {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order: Order = {
      id: orderId,
      symbol,
      type,
      orderType: "market",
      quantity,
      price: 0, // Market price
      status: "pending",
      filledQuantity: 0,
      filledPrice: 0,
      createdAt: new Date(),
      commission: 0,
    };

    this.orders.set(orderId, order);

    try {
      // In production, send to broker API
      await this.executeOrder(order);

      this.logExecution({
        timestamp: new Date(),
        symbol,
        action: `Market ${type} order placed`,
        details: { orderId, quantity },
        success: true,
      });

      return order;
    } catch (error) {
      this.logExecution({
        timestamp: new Date(),
        symbol,
        action: `Market ${type} order failed`,
        details: { orderId, quantity },
        success: false,
        error: String(error),
      });

      throw error;
    }
  }

  /**
   * Place a limit order
   */
  async placeLimitOrder(
    symbol: string,
    type: "BUY" | "SELL",
    quantity: number,
    limitPrice: number
  ): Promise<Order> {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order: Order = {
      id: orderId,
      symbol,
      type,
      orderType: "limit",
      quantity,
      price: limitPrice,
      status: "pending",
      filledQuantity: 0,
      filledPrice: 0,
      createdAt: new Date(),
      commission: 0,
    };

    this.orders.set(orderId, order);

    try {
      await this.executeOrder(order);

      this.logExecution({
        timestamp: new Date(),
        symbol,
        action: `Limit ${type} order placed`,
        details: { orderId, quantity, limitPrice },
        success: true,
      });

      return order;
    } catch (error) {
      this.logExecution({
        timestamp: new Date(),
        symbol,
        action: `Limit ${type} order failed`,
        details: { orderId, quantity, limitPrice },
        success: false,
        error: String(error),
      });

      throw error;
    }
  }

  /**
   * Place a stop-loss order
   */
  async placeStopLossOrder(
    symbol: string,
    quantity: number,
    stopPrice: number
  ): Promise<Order> {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order: Order = {
      id: orderId,
      symbol,
      type: "SELL",
      orderType: "stop",
      quantity,
      price: 0,
      stopPrice,
      status: "pending",
      filledQuantity: 0,
      filledPrice: 0,
      createdAt: new Date(),
      commission: 0,
    };

    this.orders.set(orderId, order);

    try {
      await this.executeOrder(order);

      this.logExecution({
        timestamp: new Date(),
        symbol,
        action: "Stop-loss order placed",
        details: { orderId, quantity, stopPrice },
        success: true,
      });

      return order;
    } catch (error) {
      this.logExecution({
        timestamp: new Date(),
        symbol,
        action: "Stop-loss order failed",
        details: { orderId, quantity, stopPrice },
        success: false,
        error: String(error),
      });

      throw error;
    }
  }

  /**
   * Execute order (mock implementation)
   */
  private async executeOrder(order: Order): Promise<void> {
    // In production, this would call broker API
    // For now, simulate execution

    return new Promise((resolve) => {
      setTimeout(() => {
        order.status = "filled";
        order.filledQuantity = order.quantity;
        order.filledPrice = order.price || 100; // Mock price
        order.filledAt = new Date();
        order.commission = (order.filledQuantity * order.filledPrice) * 0.001; // 0.1% commission

        resolve();
      }, 100);
    });
  }

  /**
   * Open a position
   */
  async openPosition(
    symbol: string,
    type: "LONG" | "SHORT",
    quantity: number,
    entryPrice: number,
    stopLoss: number,
    takeProfit: number
  ): Promise<Position> {
    const positionId = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Place entry order
    const order = await this.placeMarketOrder(symbol, type === "LONG" ? "BUY" : "SELL", quantity);

    const position: Position = {
      id: positionId,
      symbol,
      type,
      quantity,
      entryPrice,
      currentPrice: entryPrice,
      status: "open",
      openedAt: new Date(),
      stopLoss,
      takeProfit,
      unrealizedPL: 0,
      realizedPL: 0,
      orderId: order.id,
    };

    this.positions.set(positionId, position);

    // Place stop-loss order
    await this.placeStopLossOrder(symbol, quantity, stopLoss);

    this.logExecution({
      timestamp: new Date(),
      symbol,
      action: `${type} position opened`,
      details: { positionId, quantity, entryPrice, stopLoss, takeProfit },
      success: true,
    });

    return position;
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string): Promise<Position> {
    const position = this.positions.get(positionId);
    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }

    // Place exit order
    const order = await this.placeMarketOrder(position.symbol, position.type === "LONG" ? "SELL" : "BUY", position.quantity);

    position.status = "closed";
    position.closedAt = new Date();

    // Calculate P&L
    if (position.type === "LONG") {
      position.realizedPL = (order.filledPrice - position.entryPrice) * position.quantity - order.commission;
    } else {
      position.realizedPL = (position.entryPrice - order.filledPrice) * position.quantity - order.commission;
    }

    this.logExecution({
      timestamp: new Date(),
      symbol: position.symbol,
      action: `${position.type} position closed`,
      details: { positionId, realizedPL: position.realizedPL },
      success: true,
    });

    return position;
  }

  /**
   * Update position with current price
   */
  updatePositionPrice(positionId: string, currentPrice: number): void {
    const position = this.positions.get(positionId);
    if (!position) return;

    position.currentPrice = currentPrice;

    if (position.type === "LONG") {
      position.unrealizedPL = (currentPrice - position.entryPrice) * position.quantity;
    } else {
      position.unrealizedPL = (position.entryPrice - currentPrice) * position.quantity;
    }
  }

  /**
   * Get all open positions
   */
  getOpenPositions(): Position[] {
    return Array.from(this.positions.values()).filter((p) => p.status === "open");
  }

  /**
   * Get all orders
   */
  getOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  /**
   * Log execution
   */
  private logExecution(log: ExecutionLog): void {
    this.executionLogs.push(log);

    // Keep only last 1000 logs
    if (this.executionLogs.length > 1000) {
      this.executionLogs = this.executionLogs.slice(-1000);
    }
  }

  /**
   * Get execution logs
   */
  getExecutionLogs(): ExecutionLog[] {
    return this.executionLogs;
  }

  /**
   * Create execution report
   */
  createExecutionReport(): string {
    const openPositions = this.getOpenPositions();
    const totalUnrealizedPL = openPositions.reduce((sum, p) => sum + p.unrealizedPL, 0);

    let report = "# Execution Report\n\n";
    report += `## Summary\n`;
    report += `- Open Positions: ${openPositions.length}\n`;
    report += `- Total Unrealized P&L: £${totalUnrealizedPL.toFixed(2)}\n`;
    report += `- Total Orders: ${this.orders.size}\n\n`;

    report += `## Open Positions\n`;
    for (const position of openPositions) {
      report += `- ${position.type} ${position.symbol}: ${position.quantity} @ £${position.entryPrice.toFixed(2)} (Current: £${position.currentPrice.toFixed(2)}, P&L: £${position.unrealizedPL.toFixed(2)})\n`;
    }

    report += `\n## Recent Executions\n`;
    for (const log of this.executionLogs.slice(-10)) {
      report += `- [${log.timestamp.toISOString()}] ${log.symbol}: ${log.action}\n`;
    }

    return report;
  }
}

/**
 * Paper Trading Mode - Simulates trading without real capital
 */
export class PaperTradingExecutor extends OrderExecutor {
  private paperBalance: number;
  private initialBalance: number;

  constructor(initialBalance: number = 10000) {
    super({
      name: "Paper Trading",
      apiKey: "paper",
      apiSecret: "paper",
      baseUrl: "paper",
      paperTrading: true,
    });

    this.initialBalance = initialBalance;
    this.paperBalance = initialBalance;
  }

  /**
   * Get account balance
   */
  getBalance(): number {
    return this.paperBalance;
  }

  /**
   * Get account statistics
   */
  getAccountStats(): {
    initialBalance: number;
    currentBalance: number;
    totalReturn: number;
    openPositions: number;
  } {
    const openPositions = this.getOpenPositions();
    const totalUnrealizedPL = openPositions.reduce((sum, p) => sum + p.unrealizedPL, 0);
    const currentBalance = this.paperBalance + totalUnrealizedPL;

    return {
      initialBalance: this.initialBalance,
      currentBalance,
      totalReturn: ((currentBalance - this.initialBalance) / this.initialBalance) * 100,
      openPositions: openPositions.length,
    };
  }
}
