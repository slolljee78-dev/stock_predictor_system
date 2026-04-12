import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getPaymentHistory, getInvoicesForUser } from '../db';

/**
 * Payment and Invoice Management Router
 */
export const paymentsRouter = router({
  /**
   * Get payment history for current user
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const payments = await getPaymentHistory(ctx.user.id, input.limit, input.offset);
        const succeededPayments = payments?.filter(p => p.status === 'succeeded') || [];
        const totalSpent = succeededPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        return {
          payments: payments || [],
          totalCount: payments?.length || 0,
          totalSpent,
          averagePayment: succeededPayments.length > 0 ? totalSpent / succeededPayments.length : 0,
          succeededCount: succeededPayments.length,
        };
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
        throw new Error('Failed to fetch payment history');
      }
    }),

  /**
   * Get invoices for current user
   */
  getInvoices: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const invoices = await getInvoicesForUser(ctx.user.id, input.limit, input.offset);
        return {
          invoices: invoices || [],
          totalCount: invoices?.length || 0,
        };
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
        throw new Error('Failed to fetch invoices');
      }
    }),

  /**
   * Get single invoice by ID
   */
  getInvoice: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const invoices = await getInvoicesForUser(ctx.user.id, 1000, 0);
        const invoice = invoices?.find(i => i.id.toString() === input.invoiceId);
        if (!invoice) throw new Error('Invoice not found');
        return invoice;
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
        throw new Error('Failed to fetch invoice');
      }
    }),

  /**
   * Download invoice PDF
   */
  downloadInvoice: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const invoices = await getInvoicesForUser(ctx.user.id, 1000, 0);
        const invoice = invoices?.find(i => i.id.toString() === input.invoiceId);
        if (!invoice) throw new Error('Invoice not found');
        
        return { 
          downloadUrl: invoice.pdfUrl || null,
          invoiceNumber: invoice.invoiceNumber,
        };
      } catch (error) {
        console.error('Failed to download invoice:', error);
        throw new Error('Failed to download invoice');
      }
    }),

  /**
   * Get payment summary for dashboard
   */
  getPaymentSummary: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const allPayments = await getPaymentHistory(ctx.user.id, 1000, 0);
        const succeededPayments = allPayments?.filter(p => p.status === 'succeeded') || [];
        const totalSpent = succeededPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const averagePayment = succeededPayments.length > 0 ? totalSpent / succeededPayments.length : 0;
        const lastPayment = succeededPayments[succeededPayments.length - 1];
        
        return {
          totalSpent,
          totalPayments: succeededPayments.length,
          averagePayment,
          lastPaymentDate: lastPayment?.paidAt || null,
          nextBillingDate: lastPayment?.paidAt 
            ? new Date(lastPayment.paidAt.getTime() + 30 * 24 * 60 * 60 * 1000) 
            : null,
          currency: 'GBP',
        };
      } catch (error) {
        console.error('Failed to fetch payment summary:', error);
        throw new Error('Failed to fetch payment summary');
      }
    }),

  /**
   * Get current subscription status
   */
  getSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        tier: ctx.user.subscriptionTier || 'FREE',
        status: ctx.user.subscriptionStatus || 'inactive',
        startDate: ctx.user.subscriptionStartedAt || null,
        endDate: ctx.user.subscriptionEndedAt || null,
      };
    }),

  /**
   * Resend invoice email
   */
  resendInvoice: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const invoices = await getInvoicesForUser(ctx.user.id, 1000, 0);
        const invoice = invoices?.find(i => i.id.toString() === input.invoiceId);
        if (!invoice) throw new Error('Invoice not found');
        
        // TODO: Send email notification
        return { success: true };
      } catch (error) {
        console.error('Failed to resend invoice:', error);
        throw new Error('Failed to resend invoice');
      }
    }),

  /**
   * Get payment methods (from Stripe)
   */
  getPaymentMethods: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Fetch from Stripe API using ctx.user.stripeCustomerId
        return { methods: [] };
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        throw new Error('Failed to fetch payment methods');
      }
    }),

  /**
   * Add payment method (to Stripe)
   */
  addPaymentMethod: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Save to Stripe using ctx.user.stripeCustomerId
        return { success: true };
      } catch (error) {
        console.error('Failed to add payment method:', error);
        throw new Error('Failed to add payment method');
      }
    }),

  /**
   * Delete payment method (from Stripe)
   */
  deletePaymentMethod: protectedProcedure
    .input(z.object({
      methodId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Delete from Stripe using ctx.user.stripeCustomerId
        return { success: true };
      } catch (error) {
        console.error('Failed to delete payment method:', error);
        throw new Error('Failed to delete payment method');
      }
    }),
});
