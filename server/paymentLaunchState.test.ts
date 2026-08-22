import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import stripeCheckoutRouter from "./stripeCheckout";

const pricingSource = readFileSync(
  new URL("../client/src/pages/Pricing.tsx", import.meta.url),
  "utf8",
);

describe("payment launch state", () => {
  it("does not offer a trial or invoke checkout from the pricing page", () => {
    expect(pricingSource).not.toContain("Start Pro trial");
    expect(pricingSource).not.toContain("Start Starter trial");
    expect(pricingSource).not.toContain("/api/stripe/checkout");
    expect(pricingSource).toContain("Paid subscriptions are not live yet");
  });

  it("returns a clear service-unavailable response from the disabled checkout route", async () => {
    const layer = (stripeCheckoutRouter as any).stack.find(
      (entry: any) => entry.route?.path === "/checkout",
    );
    const handler = layer.route.stack[0].handle;
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await handler({}, response);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith({
      error: "Paid subscriptions are not available yet.",
      code: "PAYMENTS_NOT_LIVE",
    });
  });
});
