import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { automatedTradeExecutor, AutomationConfig } from '../automatedTradeExecutor';

export const automationRouter = router({
  /**
   * Initialize automation for a validation session
   */
  initializeAutomation: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        config: z.object({
          enabled: z.boolean().optional(),
          confidenceThreshold: z.number().min(60).max(95).optional(),
          tradingFrequency: z
            .enum(['realtime', '5min', '15min', 'hourly', 'daily'])
            .optional(),
          maxPositionsPerDay: z.number().min(1).optional(),
          positionSizePercent: z.number().min(0.1).max(10).optional(),
          stopLossPercent: z.number().min(0.5).max(10).optional(),
          takeProfitPercent: z.number().min(0.5).max(20).optional(),
          maxDrawdownPercent: z.number().min(1).max(20).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await automatedTradeExecutor.initializeAutomation(
        input.sessionId,
        input.config || {}
      );
      return { success: true, message: 'Automation initialized' };
    }),

  /**
   * Execute a manual trade through the automation system
   */
  executeTrade: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        symbol: z.string(),
        signal: z.enum(['BUY', 'SELL']),
        confidence: z.number().min(0).max(100),
        capital: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const trade = await automatedTradeExecutor.executeTrade(
        input.sessionId,
        input.symbol,
        input.signal,
        input.confidence,
        input.capital
      );

      if (!trade) {
        throw new Error('Failed to execute trade');
      }

      return {
        success: true,
        trade,
        message: `${input.signal} trade executed for ${input.symbol}`,
      };
    }),

  /**
   * Get all executed trades for a session
   */
  getExecutedTrades: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const trades = automatedTradeExecutor.getExecutedTrades(input.sessionId);
      return {
        trades,
        total: trades.length,
        open: trades.filter((t) => t.status === 'OPEN').length,
        closed: trades.filter((t) => t.status !== 'OPEN').length,
      };
    }),

  /**
   * Get open trades for a session
   */
  getOpenTrades: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const trades = automatedTradeExecutor.getOpenTrades(input.sessionId);
      return {
        trades,
        count: trades.length,
      };
    }),

  /**
   * Get closed trades for a session
   */
  getClosedTrades: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const trades = automatedTradeExecutor.getClosedTrades(input.sessionId);
      const profitableTrades = trades.filter((t) => (t.pnl || 0) > 0);
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

      return {
        trades,
        count: trades.length,
        profitableTrades: profitableTrades.length,
        totalPnL,
        winRate: trades.length > 0 ? (profitableTrades.length / trades.length) * 100 : 0,
      };
    }),

  /**
   * Get automation status
   */
  getStatus: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      return automatedTradeExecutor.getStatus(input.sessionId);
    }),

  /**
   * Get automation config
   */
  getConfig: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      return automatedTradeExecutor.getConfig(input.sessionId);
    }),

  /**
   * Update automation config
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        config: z.object({
          enabled: z.boolean().optional(),
          confidenceThreshold: z.number().min(60).max(95).optional(),
          tradingFrequency: z
            .enum(['realtime', '5min', '15min', 'hourly', 'daily'])
            .optional(),
          maxPositionsPerDay: z.number().min(1).optional(),
          positionSizePercent: z.number().min(0.1).max(10).optional(),
          stopLossPercent: z.number().min(0.5).max(10).optional(),
          takeProfitPercent: z.number().min(0.5).max(20).optional(),
          maxDrawdownPercent: z.number().min(1).max(20).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      automatedTradeExecutor.updateConfig(input.sessionId, input.config);
      return {
        success: true,
        config: automatedTradeExecutor.getConfig(input.sessionId),
        message: 'Automation config updated',
      };
    }),

  /**
   * Get trade statistics
   */
  getStatistics: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const allTrades = automatedTradeExecutor.getExecutedTrades(input.sessionId);
      const closedTrades = automatedTradeExecutor.getClosedTrades(input.sessionId);
      const profitableTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);

      const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const avgWin =
        profitableTrades.length > 0
          ? profitableTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
            profitableTrades.length
          : 0;

      const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);
      const avgLoss =
        losingTrades.length > 0
          ? Math.abs(
              losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
                losingTrades.length
            )
          : 0;

      const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

      return {
        totalTrades: allTrades.length,
        openTrades: allTrades.filter((t) => t.status === 'OPEN').length,
        closedTrades: closedTrades.length,
        profitableTrades: profitableTrades.length,
        losingTrades: losingTrades.length,
        winRate:
          closedTrades.length > 0
            ? (profitableTrades.length / closedTrades.length) * 100
            : 0,
        totalPnL,
        avgWin,
        avgLoss,
        profitFactor,
      };
    }),
});
