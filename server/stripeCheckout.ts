import { Router } from 'express';
import { createCheckoutSession } from './stripeService';
import { SubscriptionTier } from './products';

const router = Router();

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session for subscription
 */
router.post('/checkout', async (req, res) => {
  return res.status(503).json({
    error: 'Paid subscriptions are not available yet.',
    code: 'PAYMENTS_NOT_LIVE',
  });

  /*
  try {
    const { tier, origin } = req.body;
    
    // Validate input
    if (!tier || !origin) {
      return res.status(400).json({ error: 'Missing tier or origin' });
    }
    
    // Validate tier
    const validTiers = ['STARTER', 'PRO', 'ELITE'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Get user info from session/context
    // For now, we'll use placeholder values - in production, extract from auth context
    const userId = req.headers['x-user-id'] as string || 'user_' + Date.now();
    const userEmail = req.headers['x-user-email'] as string || 'user@example.com';
    const userName = req.headers['x-user-name'] as string || 'User';

    // Create checkout session
    const session = await createCheckoutSession({
      userId,
      userEmail,
      userName,
      tier: tier as SubscriptionTier,
      origin,
    });

    return res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create checkout session' 
    });
  }
  */
});

export default router;
