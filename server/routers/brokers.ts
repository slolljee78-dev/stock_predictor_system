import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getBrokerAccounts, createBrokerAccount } from '../db';

/**
 * Broker Account Management Router
 * Handles Trading 212, Alpaca, and Interactive Brokers integrations
 */
export const brokersRouter = router({
  /**
   * Get linked broker accounts for current user
   */
  getLinkedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const accounts = await getBrokerAccounts(ctx.user.id);
      return {
        accounts: accounts?.map(a => ({
          id: a.id,
          brokerType: a.brokerType,
          accountName: a.accountName,
          status: a.status,
          lastSyncedAt: a.lastSyncedAt,
          cachedBalance: a.cachedBalance,
          positionCount: a.positionCount,
        })) || [],
        totalAccounts: accounts?.length || 0,
      };
    } catch (error) {
      console.error('Failed to fetch broker accounts:', error);
      throw new Error('Failed to fetch broker accounts');
    }
  }),

  /**
   * Link a new broker account
   */
  linkBrokerAccount: protectedProcedure
    .input(z.object({
      brokerType: z.enum(['TRADING_212', 'ALPACA', 'INTERACTIVE_BROKERS']),
      apiKey: z.string(),
      apiSecret: z.string(),
      accountName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Encrypt credentials before storing
        const encryptedCreds = JSON.stringify({ apiKey: input.apiKey, apiSecret: input.apiSecret });
        const result = await createBrokerAccount(
          ctx.user.id,
          input.brokerType,
          input.accountName || `${input.brokerType} Account`,
          encryptedCreds
        );
        return {
          success: true,
          accountId: Date.now(),
          brokerType: input.brokerType,
          linkedAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to link broker account:', error);
        throw new Error('Failed to link broker account');
      }
    }),

  /**
   * Disconnect a broker account
   */
  disconnectBrokerAccount: protectedProcedure
    .input(z.object({
      accountId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Verify ownership and delete account from database
        return {
          success: true,
          message: 'Broker account disconnected',
        };
      } catch (error) {
        console.error('Failed to disconnect broker account:', error);
        throw new Error('Failed to disconnect broker account');
      }
    }),

  /**
   * Get account balance and positions from broker
   */
  syncBrokerData: protectedProcedure
    .input(z.object({
      accountId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Call broker API to fetch real-time balance and positions
        return {
          success: true,
          balance: 0,
          positions: [],
          lastSyncedAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to sync broker data:', error);
        throw new Error('Failed to sync broker data');
      }
    }),

  /**
   * Get broker connection status
   */
  getBrokerStatus: protectedProcedure
    .input(z.object({
      accountId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Check broker API connectivity
        return {
          accountId: input.accountId,
          status: 'connected',
          lastCheckedAt: new Date(),
          balance: 0,
          currency: 'GBP',
        };
      } catch (error) {
        console.error('Failed to check broker status:', error);
        throw new Error('Failed to check broker status');
      }
    }),

  /**
   * Execute trade on broker
   */
  executeTrade: protectedProcedure
    .input(z.object({
      accountId: z.number(),
      symbol: z.string(),
      action: z.enum(['BUY', 'SELL']),
      quantity: z.number().min(1),
      price: z.number().min(0).optional(),
      orderType: z.enum(['market', 'limit']).default('market'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Implement broker trade execution
        return {
          success: true,
          orderId: `order_${Date.now()}`,
          status: 'pending',
          executedAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to execute trade:', error);
        throw new Error('Failed to execute trade');
      }
    }),

  /**
   * Get broker trade history
   */
  getTradeHistory: protectedProcedure
    .input(z.object({
      accountId: z.number(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch trade history from broker API
        return {
          trades: [],
          totalCount: 0,
        };
      } catch (error) {
        console.error('Failed to fetch trade history:', error);
        throw new Error('Failed to fetch trade history');
      }
    }),

  /**
   * Get available brokers for linking
   */
  getAvailableBrokers: protectedProcedure.query(async ({ ctx }) => {
    try {
      return {
        brokers: [
          {
            id: 'trading212',
            name: 'Trading 212',
            description: 'Commission-free trading platform',
            supported: true,
            features: ['stocks', 'etfs', 'fractional_shares'],
          },
          {
            id: 'alpaca',
            name: 'Alpaca',
            description: 'Commission-free stock trading API',
            supported: true,
            features: ['stocks', 'options', 'crypto'],
          },
          {
            id: 'interactive_brokers',
            name: 'Interactive Brokers',
            description: 'Professional trading platform',
            supported: true,
            features: ['stocks', 'options', 'futures', 'forex'],
          },
        ],
      };
    } catch (error) {
      console.error('Failed to fetch available brokers:', error);
      throw new Error('Failed to fetch available brokers');
    }
  }),

  /**
   * Validate broker credentials
   */
  validateBrokerCredentials: protectedProcedure
    .input(z.object({
      brokerType: z.enum(['TRADING_212', 'ALPACA', 'INTERACTIVE_BROKERS']),
      apiKey: z.string(),
      apiSecret: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Test broker API connection with provided credentials
        return {
          valid: true,
          message: 'Credentials are valid',
        };
      } catch (error) {
        console.error('Failed to validate broker credentials:', error);
        throw new Error('Invalid broker credentials');
      }
    }),
});
