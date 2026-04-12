/**
 * Subscription products for Manus Stock Predictor
 * Define all products and prices here for centralized management
 */

export const SUBSCRIPTION_PRODUCTS = {
  STARTER: {
    name: 'Starter',
    description: 'Basic stock analysis for beginners',
    priceUSD: 9.99,
    priceGBP: 7.99,
    features: [
      '50 stocks monitoring',
      'Basic AI signals',
      'Weekly reports',
      'Email support',
    ],
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
  },
  PRO: {
    name: 'Pro',
    description: 'Full access to all features',
    priceUSD: 29.99,
    priceGBP: 23.99,
    features: [
      'All 212 stocks',
      'Advanced AI signals',
      'Daily reports',
      'Real-time alerts',
      'Live market data',
      'Priority support',
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    recommended: true,
  },
  ELITE: {
    name: 'Elite',
    description: 'Professional trading suite',
    priceUSD: 99.99,
    priceGBP: 79.99,
    features: [
      'Everything in Pro',
      'API access',
      'Custom strategies',
      'Automated trading',
      'Portfolio analysis',
      'Dedicated support',
      'Custom alerts',
    ],
    stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || 'price_elite_placeholder',
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PRODUCTS;

export function getSubscriptionTier(stripePriceId: string): SubscriptionTier | null {
  for (const [tier, product] of Object.entries(SUBSCRIPTION_PRODUCTS)) {
    if (product.stripePriceId === stripePriceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

export function getProductByTier(tier: SubscriptionTier) {
  return SUBSCRIPTION_PRODUCTS[tier];
}
