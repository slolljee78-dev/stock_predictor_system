/**
 * Trading 212 Broker API Integration
 * Handles real trading execution, position tracking, and account management
 */

export interface Trading212Config {
  apiKey: string;
  apiUrl: string;
  accountId: string;
  mode: 'demo' | 'live';
}

export interface OrderRequest {
  ticker: string;
  quantity: number;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  limitPrice?: number;
  stopPrice?: number;
}

export interface Order {
  id: string;
  ticker: string;
  quantity: number;
  type: 'buy' | 'sell';
  orderType: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  executedPrice?: number;
  executedQuantity?: number;
  createdAt: Date;
  executedAt?: Date;
}

export interface Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface AccountInfo {
  accountId: string;
  balance: number;
  buyingPower: number;
  totalValue: number;
  dayTradeCount: number;
  positions: Position[];
  orders: Order[];
}

class Trading212Client {
  private config: Trading212Config;
  private baseUrl: string;

  constructor(config: Trading212Config) {
    this.config = config;
    this.baseUrl = config.apiUrl;
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<AccountInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.config.accountId}`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get account info: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapAccountInfo(data);
    } catch (error) {
      console.error('[Trading212] Failed to get account info:', error);
      throw error;
    }
  }

  /**
   * Place an order
   */
  async placeOrder(order: OrderRequest): Promise<Order> {
    try {
      const payload = {
        ticker: order.ticker,
        quantity: order.quantity,
        side: order.type === 'buy' ? 'BUY' : 'SELL',
        type: order.orderType.toUpperCase(),
        limitPrice: order.limitPrice,
        stopPrice: order.stopPrice,
      };

      const response = await fetch(`${this.baseUrl}/accounts/${this.config.accountId}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapOrder(data);
    } catch (error) {
      console.error('[Trading212] Failed to place order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.config.accountId}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Trading212] Failed to cancel order:', error);
      throw error;
    }
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<Position[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.config.accountId}/positions`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.positions.map((p: any) => this.mapPosition(p));
    } catch (error) {
      console.error('[Trading212] Failed to get positions:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(limit: number = 100): Promise<Order[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/orders?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get order history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.orders.map((o: any) => this.mapOrder(o));
    } catch (error) {
      console.error('[Trading212] Failed to get order history:', error);
      throw error;
    }
  }

  /**
   * Close a position
   */
  async closePosition(ticker: string): Promise<Order> {
    try {
      // Get current position
      const positions = await this.getPositions();
      const position = positions.find((p) => p.ticker === ticker);

      if (!position) {
        throw new Error(`No open position for ${ticker}`);
      }

      // Place sell order for entire position
      return await this.placeOrder({
        ticker,
        quantity: position.quantity,
        type: 'sell',
        orderType: 'market',
      });
    } catch (error) {
      console.error('[Trading212] Failed to close position:', error);
      throw error;
    }
  }

  // Private mapping methods
  private mapAccountInfo(data: any): AccountInfo {
    return {
      accountId: data.accountId,
      balance: data.balance,
      buyingPower: data.buyingPower,
      totalValue: data.totalValue,
      dayTradeCount: data.dayTradeCount || 0,
      positions: data.positions?.map((p: any) => this.mapPosition(p)) || [],
      orders: data.orders?.map((o: any) => this.mapOrder(o)) || [],
    };
  }

  private mapPosition(data: any): Position {
    return {
      ticker: data.ticker,
      quantity: data.quantity,
      averagePrice: data.averagePrice,
      currentPrice: data.currentPrice,
      unrealizedPnL: data.unrealizedPnL,
      unrealizedPnLPercent: data.unrealizedPnLPercent,
    };
  }

  private mapOrder(data: any): Order {
    return {
      id: data.id,
      ticker: data.ticker,
      quantity: data.quantity,
      type: data.side === 'BUY' ? 'buy' : 'sell',
      orderType: data.type,
      status: data.status.toLowerCase(),
      executedPrice: data.executedPrice,
      executedQuantity: data.executedQuantity,
      createdAt: new Date(data.createdAt),
      executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
    };
  }
}

/**
 * Create Trading 212 client instance
 */
export function createTrading212Client(config: Trading212Config): Trading212Client {
  return new Trading212Client(config);
}

/**
 * Get Trading 212 client from environment
 */
export function getTrading212Client(): Trading212Client | null {
  const apiKey = process.env.TRADING212_API_KEY;
  const apiUrl = process.env.TRADING212_API_URL || 'https://api.trading212.com/v0';
  const accountId = process.env.TRADING212_ACCOUNT_ID;
  const mode = (process.env.TRADING212_MODE || 'demo') as 'demo' | 'live';

  if (!apiKey || !accountId) {
    console.warn('[Trading212] API key or account ID not configured');
    return null;
  }

  return createTrading212Client({
    apiKey,
    apiUrl,
    accountId,
    mode,
  });
}
