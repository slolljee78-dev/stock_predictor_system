import Stripe from 'stripe';
import { SUBSCRIPTION_PRODUCTS, SubscriptionTier } from './products';

// Lazy initialization — prevents crash on startup when STRIPE_SECRET_KEY is absent
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured: STRIPE_SECRET_KEY is missing.');
  _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' as any });
  return _stripe;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  userName: string;
  tier: SubscriptionTier;
  origin: string;
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const { userId, userEmail, userName, tier, origin } = params;
  const product = SUBSCRIPTION_PRODUCTS[tier];

  if (!product.stripePriceId || product.stripePriceId.includes('placeholder')) {
    throw new Error(`Stripe price ID not configured for tier: ${tier}`);
  }

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7, // 7-day free trial for all subscriptions
    },
    metadata: {
      user_id: userId,
      customer_email: userEmail,
      customer_name: userName,
      subscription_tier: tier,
      trial_days: 7,
    },
    success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?payment=cancelled`,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Get customer subscriptions
 */
export async function getCustomerSubscriptions(customerId: string) {
  return getStripe().subscriptions.list({
    customer: customerId,
    limit: 10,
  });
}

/**
 * Create a customer in Stripe
 */
export async function createCustomer(email: string, name: string) {
  return getStripe().customers.create({
    email,
    name,
  });
}

/**
 * Get or create a Stripe customer
 */
export async function getOrCreateCustomer(email: string, name: string) {
  // Search for existing customer
  const customers = await getStripe().customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return createCustomer(email, name);
}

/**
 * Construct and verify webhook event
 */
export function constructWebhookEvent(body: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  try {
    return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Handle checkout.session.completed event
 */
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { client_reference_id, customer_email, metadata } = session;
  
  return {
    userId: client_reference_id,
    email: customer_email,
    tier: metadata?.subscription_tier as SubscriptionTier,
    sessionId: session.id,
    customerId: session.customer as string,
  };
}

/**
 * Handle customer.subscription.updated event
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  return {
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
    status: subscription.status,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
  };
}

/**
 * Handle customer.subscription.deleted event
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  return {
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
  };
}
