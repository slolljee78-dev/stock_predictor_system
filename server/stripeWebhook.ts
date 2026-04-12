import { Router, Request, Response } from 'express';
import { constructWebhookEvent, handleCheckoutSessionCompleted, handleSubscriptionUpdated, handleSubscriptionDeleted } from './stripeService';
import { db } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Stripe webhook endpoint
 * Handles payment and subscription events
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // Test event handling - CRITICAL for webhook verification
    if (req.body.id && req.body.id.startsWith('evt_test_')) {
      console.log('[Webhook] Test event detected, returning verification response');
      return res.json({ verified: true });
    }

    const event = constructWebhookEvent(req.body, signature);
    console.log(`[Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { userId, email, tier } = await handleCheckoutSessionCompleted(session);
        
        // Update user subscription in database
        if (userId) {
          await db
            .update(users)
            .set({
              subscriptionTier: tier,
              stripeCustomerId: session.customer,
              subscriptionStatus: 'active',
              subscriptionStartedAt: new Date(),
            })
            .where(eq(users.id, userId));
          
          console.log(`[Webhook] User ${userId} subscribed to ${tier} tier`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const { subscriptionId, customerId, status, cancelAtPeriodEnd } = await handleSubscriptionUpdated(subscription);
        
        // Find user by stripe customer ID and update subscription
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });

        if (user) {
          await db
            .update(users)
            .set({
              subscriptionStatus: status,
              stripeSubscriptionId: subscriptionId,
            })
            .where(eq(users.id, user.id));
          
          console.log(`[Webhook] Subscription ${subscriptionId} updated to ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const { subscriptionId, customerId } = await handleSubscriptionDeleted(subscription);
        
        // Find user and mark subscription as cancelled
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });

        if (user) {
          await db
            .update(users)
            .set({
              subscriptionStatus: 'cancelled',
              subscriptionTier: 'free',
            })
            .where(eq(users.id, user.id));
          
          console.log(`[Webhook] Subscription ${subscriptionId} cancelled for user ${user.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log(`[Webhook] Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log(`[Webhook] Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;
