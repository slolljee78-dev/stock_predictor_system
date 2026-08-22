// Import market data service
// For now, using mock implementation - integrate with liveMarketData when available

const getPrice = async (symbol: string): Promise<number | null> => {
  try {
    // This will be replaced with actual market data integration
    // For now, return mock price
    return Math.random() * 300 + 50; // Random price between 50-350
  } catch (error) {
    console.error(`Error getting price for ${symbol}:`, error);
    return null;
  }
};

export interface AutomationConfig {
  enabled: boolean;
  confidenceThreshold: number; // 60-95
  tradingFrequency: 'realtime' | '5min' | '15min' | 'hourly' | 'daily';
  maxPositionsPerDay: number;
  positionSizePercent: number; // % of capital
  stopLossPercent: number;
  takeProfitPercent: number;
  maxDrawdownPercent: number;
}

export interface ExecutedTrade {
  id: string;
  sessionId: string;
  symbol: string;
  signal: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  executedAt: Date;
  status: 'OPEN' | 'CLOSED' | 'STOPPED_OUT' | 'PROFIT_TAKEN';
  exitPrice?: number;
  exitedAt?: Date;
  pnl?: number;
}

const defaultConfig: AutomationConfig = {
  enabled: false,
  confidenceThreshold: 75,
  tradingFrequency: '15min',
  maxPositionsPerDay: 6,
  positionSizePercent: 2,
  stopLossPercent: 2,
  takeProfitPercent: 3,
  maxDrawdownPercent: 5,
};

class AutomatedTradeExecutor {
  private config: AutomationConfig = defaultConfig;
  private executedTrades: Map<string, ExecutedTrade[]> = new Map();
  private executionIntervals: Map<string, NodeJS.Timeout> = new Map();
  private sessionConfigs: Map<string, AutomationConfig> = new Map();

  /**
   * Initialize automation for a validation session
   */
  async initializeAutomation(
    sessionId: string,
    config: Partial<AutomationConfig>
  ): Promise<void> {
    const mergedConfig = { ...defaultConfig, ...config };
    this.sessionConfigs.set(sessionId, mergedConfig);
    this.executedTrades.set(sessionId, []);
    
    if (mergedConfig.enabled) {
      this.startAutomation(sessionId);
    }
  }

  /**
   * Start automated trading for a session
   */
  private startAutomation(sessionId: string): void {
    if (this.executionIntervals.has(sessionId)) {
      return; // Already running
    }

    const config = this.sessionConfigs.get(sessionId) || defaultConfig;
    const frequencyMs = this.getFrequencyMs(config.tradingFrequency);
    
    const interval = setInterval(async () => {
      await this.executeTradeRound(sessionId);
    }, frequencyMs);

    this.executionIntervals.set(sessionId, interval);
  }

  /**
   * Stop automated trading for a session
   */
  stopAutomation(sessionId: string): void {
    const interval = this.executionIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.executionIntervals.delete(sessionId);
    }
  }

  /**
   * Execute one round of trades
   */
  private async executeTradeRound(sessionId: string): Promise<void> {
    try {
      const config = this.sessionConfigs.get(sessionId);
      if (!config) return;

      // Get today's trades count
      const trades = this.executedTrades.get(sessionId) || [];
      const todaysTrades = trades.filter(
        (t) => new Date(t.executedAt).toDateString() === new Date().toDateString()
      );

      if (todaysTrades.length >= config.maxPositionsPerDay) {
        return; // Max positions for today reached
      }

      // Check and close positions that hit stop-loss or take-profit
      await this.checkOpenPositions(sessionId);
    } catch (error) {
      console.error(`Error executing trade round for session ${sessionId}:`, error);
    }
  }

  /**
   * Execute a single trade
   */
  async executeTrade(
    sessionId: string,
    symbol: string,
    signal: 'BUY' | 'SELL',
    confidence: number,
    capital: number
  ): Promise<ExecutedTrade | null> {
    try {
      const config = this.sessionConfigs.get(sessionId);
      if (!config) return null;

      const currentPrice = await getPrice(symbol);
      if (currentPrice === null || currentPrice <= 0) return null;

      // Calculate position size
      const positionSize = Math.floor(
        (capital * (config.positionSizePercent / 100)) / currentPrice
      );

      if (positionSize <= 0) return null;

      // Calculate stop-loss and take-profit
      const stopLoss =
        signal === 'BUY'
          ? currentPrice * (1 - config.stopLossPercent / 100)
          : currentPrice * (1 + config.stopLossPercent / 100);

      const takeProfit =
        signal === 'BUY'
          ? currentPrice * (1 + config.takeProfitPercent / 100)
          : currentPrice * (1 - config.takeProfitPercent / 100);

      // Create trade record
      const trade: ExecutedTrade = {
        id: `trade_${Date.now()}_${Math.random()}`,
        sessionId,
        symbol,
        signal,
        quantity: positionSize,
        entryPrice: currentPrice,
        stopLoss,
        takeProfit,
        confidence,
        executedAt: new Date(),
        status: 'OPEN',
      };

      // Store trade
      const trades = this.executedTrades.get(sessionId) || [];
      trades.push(trade);
      this.executedTrades.set(sessionId, trades);

      return trade;
    } catch (error) {
      console.error(`Error executing trade for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Check open positions for stop-loss or take-profit
   */
  private async checkOpenPositions(sessionId: string): Promise<void> {
    const trades = this.executedTrades.get(sessionId) || [];
    const openTrades = trades.filter((t) => t.status === 'OPEN');

    for (const trade of openTrades) {
      const currentPrice = await getPrice(trade.symbol);
      if (!currentPrice) continue;

      let shouldClose = false;
      let exitPrice = currentPrice;
      let status: 'CLOSED' | 'STOPPED_OUT' | 'PROFIT_TAKEN' = 'CLOSED';

      // Check stop-loss
      if (trade.signal === 'BUY' && currentPrice <= trade.stopLoss) {
        shouldClose = true;
        exitPrice = trade.stopLoss;
        status = 'STOPPED_OUT';
      } else if (trade.signal === 'SELL' && currentPrice >= trade.stopLoss) {
        shouldClose = true;
        exitPrice = trade.stopLoss;
        status = 'STOPPED_OUT';
      }

      // Check take-profit
      if (trade.signal === 'BUY' && currentPrice >= trade.takeProfit) {
        shouldClose = true;
        exitPrice = trade.takeProfit;
        status = 'PROFIT_TAKEN';
      } else if (trade.signal === 'SELL' && currentPrice <= trade.takeProfit) {
        shouldClose = true;
        exitPrice = trade.takeProfit;
        status = 'PROFIT_TAKEN';
      }

      if (shouldClose) {
        trade.status = status;
        trade.exitPrice = exitPrice;
        trade.exitedAt = new Date();

        // Calculate P&L
        if (trade.signal === 'BUY') {
          trade.pnl = (exitPrice - trade.entryPrice) * trade.quantity;
        } else {
          trade.pnl = (trade.entryPrice - exitPrice) * trade.quantity;
        }
      }
    }
  }

  /**
   * Convert frequency string to milliseconds
   */
  private getFrequencyMs(frequency: string): number {
    const frequencies: Record<string, number> = {
      realtime: 1000, // 1 second
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
    };
    return frequencies[frequency] || 15 * 60 * 1000;
  }

  /**
   * Get executed trades for a session
   */
  getExecutedTrades(sessionId: string): ExecutedTrade[] {
    return this.executedTrades.get(sessionId) || [];
  }

  /**
   * Get open trades for a session
   */
  getOpenTrades(sessionId: string): ExecutedTrade[] {
    const trades = this.executedTrades.get(sessionId) || [];
    return trades.filter((t) => t.status === 'OPEN');
  }

  /**
   * Get closed trades for a session
   */
  getClosedTrades(sessionId: string): ExecutedTrade[] {
    const trades = this.executedTrades.get(sessionId) || [];
    return trades.filter((t) => t.status !== 'OPEN');
  }

  /**
   * Update automation config
   */
  updateConfig(sessionId: string, config: Partial<AutomationConfig>): void {
    const current = this.sessionConfigs.get(sessionId) || defaultConfig;
    this.sessionConfigs.set(sessionId, { ...current, ...config });
  }

  /**
   * Get current automation config
   */
  getConfig(sessionId: string): AutomationConfig {
    return this.sessionConfigs.get(sessionId) || defaultConfig;
  }

  /**
   * Get automation status
   */
  getStatus(sessionId: string): {
    enabled: boolean;
    running: boolean;
    openTrades: number;
    totalTrades: number;
  } {
    const config = this.sessionConfigs.get(sessionId);
    const trades = this.executedTrades.get(sessionId) || [];
    const openTrades = trades.filter((t) => t.status === 'OPEN');

    return {
      enabled: config?.enabled || false,
      running: this.executionIntervals.has(sessionId),
      openTrades: openTrades.length,
      totalTrades: trades.length,
    };
  }
}

export const automatedTradeExecutor = new AutomatedTradeExecutor();
