import { describe, it, expect } from 'vitest';
import { SUBSCRIPTION_PRODUCTS } from './products';

describe('Stripe Integration', () => {
  it('should have valid Stripe price IDs configured', () => {
    const starterPriceId = SUBSCRIPTION_PRODUCTS.STARTER.stripePriceId;
    const proPriceId = SUBSCRIPTION_PRODUCTS.PRO.stripePriceId;
    const elitePriceId = SUBSCRIPTION_PRODUCTS.ELITE.stripePriceId;

    // Verify price IDs are not placeholders
    expect(starterPriceId).not.toBe('price_starter_placeholder');
    expect(proPriceId).not.toBe('price_pro_placeholder');
    expect(elitePriceId).not.toBe('price_elite_placeholder');

    // Verify price IDs start with 'price_'
    expect(starterPriceId).toMatch(/^price_/);
    expect(proPriceId).toMatch(/^price_/);
    expect(elitePriceId).toMatch(/^price_/);

    // Verify they are different
    expect(starterPriceId).not.toBe(proPriceId);
    expect(proPriceId).not.toBe(elitePriceId);
    expect(starterPriceId).not.toBe(elitePriceId);

    // Verify expected values
    expect(starterPriceId).toBe('price_1TM1cnE03VD1fIpitMB0qeeO');
    expect(proPriceId).toBe('price_1TM1XfE03VD1fIpi590tgDRx');
    expect(elitePriceId).toBe('price_1TM1WCE03VD1fIpiRroNfbAJ');
  });

  it('should have correct pricing for each tier', () => {
    expect(SUBSCRIPTION_PRODUCTS.STARTER.priceGBP).toBe(7.99);
    expect(SUBSCRIPTION_PRODUCTS.PRO.priceGBP).toBe(23.99);
    expect(SUBSCRIPTION_PRODUCTS.ELITE.priceGBP).toBe(79.99);
  });

  it('should have correct tier names', () => {
    expect(SUBSCRIPTION_PRODUCTS.STARTER.name).toBe('Starter');
    expect(SUBSCRIPTION_PRODUCTS.PRO.name).toBe('Pro');
    expect(SUBSCRIPTION_PRODUCTS.ELITE.name).toBe('Elite');
  });

  it('should mark Pro as recommended', () => {
    expect(SUBSCRIPTION_PRODUCTS.PRO.recommended).toBe(true);
    expect(SUBSCRIPTION_PRODUCTS.STARTER.recommended).toBeUndefined();
    expect(SUBSCRIPTION_PRODUCTS.ELITE.recommended).toBeUndefined();
  });
});
