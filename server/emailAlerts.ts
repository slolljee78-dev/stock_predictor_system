import { notifyOwner } from './_core/notification';
import { ExecutedTrade } from './automatedTradeExecutor';

export interface EmailAlertConfig {
  enabled: boolean;
  alertOnTradeExecution: boolean;
  alertOnPositionClose: boolean;
  alertOnDailyLossLimit: boolean;
  alertOnProfitTarget: boolean;
  recipientEmail?: string;
}

const defaultConfig: EmailAlertConfig = {
  enabled: true,
  alertOnTradeExecution: true,
  alertOnPositionClose: true,
  alertOnDailyLossLimit: true,
  alertOnProfitTarget: true,
};

class EmailAlertService {
  private configs: Map<string, EmailAlertConfig> = new Map();

  /**
   * Initialize email alerts for a session
   */
  initializeAlerts(sessionId: string, config: Partial<EmailAlertConfig> = {}): void {
    this.configs.set(sessionId, { ...defaultConfig, ...config });
  }

  /**
   * Send trade execution alert
   */
  async sendTradeExecutionAlert(
    sessionId: string,
    trade: ExecutedTrade,
    capital: number
  ): Promise<boolean> {
    const config = this.configs.get(sessionId);
    if (!config || !config.enabled || !config.alertOnTradeExecution) {
      return false;
    }

    const title = `🚀 Trade Executed: ${trade.symbol}`;
    const content = `
**Signal:** ${trade.signal}
**Entry Price:** £${trade.entryPrice.toFixed(2)}
**Quantity:** ${trade.quantity} shares
**Confidence:** ${trade.confidence.toFixed(1)}%
**Stop Loss:** £${trade.stopLoss.toFixed(2)}
**Take Profit:** £${trade.takeProfit.toFixed(2)}
**Capital Used:** £${(trade.entryPrice * trade.quantity).toFixed(2)} (${((trade.entryPrice * trade.quantity / capital) * 100).toFixed(2)}%)
**Time:** ${new Date().toLocaleString()}
    `;

    return await notifyOwner({ title, content });
  }

  /**
   * Send position close alert
   */
  async sendPositionCloseAlert(
    sessionId: string,
    trade: ExecutedTrade
  ): Promise<boolean> {
    const config = this.configs.get(sessionId);
    if (!config || !config.enabled || !config.alertOnPositionClose) {
      return false;
    }

    const isProfit = (trade.pnl || 0) >= 0;
    const title = `${isProfit ? '✅ Profit' : '❌ Loss'} Taken: ${trade.symbol} - £${(trade.pnl || 0).toFixed(2)}`;
    const content = `
**Symbol:** ${trade.symbol}
**Signal:** ${trade.signal}
**Entry Price:** £${trade.entryPrice.toFixed(2)}
**Exit Price:** £${(trade.exitPrice || 0).toFixed(2)}
**Exit Reason:** ${trade.status}
**Quantity:** ${trade.quantity} shares
**P&L:** £${(trade.pnl || 0).toFixed(2)}
**Return:** ${(((trade.exitPrice || 0) - trade.entryPrice) / trade.entryPrice * 100).toFixed(2)}%
**Time:** ${new Date(trade.exitedAt || new Date()).toLocaleString()}
    `;

    return await notifyOwner({ title, content });
  }

  /**
   * Send daily loss limit alert
   */
  async sendDailyLossLimitAlert(
    sessionId: string,
    dailyLoss: number,
    dailyLossLimit: number
  ): Promise<boolean> {
    const config = this.configs.get(sessionId);
    if (!config || !config.enabled || !config.alertOnDailyLossLimit) {
      return false;
    }

    const title = `⚠️ Daily Loss Limit Hit: £${dailyLoss.toFixed(2)}`;
    const content = `
**Daily Loss:** £${dailyLoss.toFixed(2)}
**Daily Loss Limit:** £${dailyLossLimit.toFixed(2)}
**Status:** Trading stopped for the day
**Time:** ${new Date().toLocaleString()}

Automated trading has been paused due to reaching the daily loss limit. Review your strategy and try again tomorrow.
    `;

    return await notifyOwner({ title, content });
  }

  /**
   * Send profit target alert
   */
  async sendProfitTargetAlert(
    sessionId: string,
    totalPnL: number,
    profitTarget: number
  ): Promise<boolean> {
    const config = this.configs.get(sessionId);
    if (!config || !config.enabled || !config.alertOnProfitTarget) {
      return false;
    }

    const title = `🎯 Profit Target Reached: £${totalPnL.toFixed(2)}`;
    const content = `
**Total P&L:** £${totalPnL.toFixed(2)}
**Profit Target:** £${profitTarget.toFixed(2)}
**Achievement:** ${((totalPnL / profitTarget) * 100).toFixed(1)}%
**Time:** ${new Date().toLocaleString()}

Congratulations! Your trading system has reached the profit target. Consider taking profits or adjusting your targets.
    `;

    return await notifyOwner({ title, content });
  }

  /**
   * Send daily summary alert
   */
  async sendDailySummaryAlert(
    sessionId: string,
    dailyStats: {
      trades: number;
      wins: number;
      losses: number;
      pnl: number;
      winRate: number;
    }
  ): Promise<boolean> {
    const config = this.configs.get(sessionId);
    if (!config || !config.enabled) {
      return false;
    }

    const title = `📊 Daily Trading Summary - ${new Date().toLocaleDateString()}`;
    const content = `
**Trades:** ${dailyStats.trades}
**Wins:** ${dailyStats.wins}
**Losses:** ${dailyStats.losses}
**Win Rate:** ${dailyStats.winRate.toFixed(1)}%
**Daily P&L:** £${dailyStats.pnl.toFixed(2)}
**Time:** ${new Date().toLocaleString()}

Keep up the good work! Review your daily performance and adjust your strategy as needed.
    `;

    return await notifyOwner({ title, content });
  }

  /**
   * Update alert config
   */
  updateConfig(sessionId: string, config: Partial<EmailAlertConfig>): void {
    const current = this.configs.get(sessionId) || defaultConfig;
    this.configs.set(sessionId, { ...current, ...config });
  }

  /**
   * Get alert config
   */
  getConfig(sessionId: string): EmailAlertConfig {
    return this.configs.get(sessionId) || defaultConfig;
  }
}

export const emailAlertService = new EmailAlertService();
