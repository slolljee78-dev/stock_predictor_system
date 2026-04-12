import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

const PRICING_TIERS = [
  {
    name: "Starter",
    price: 9.99,
    currency: "£",
    description: "Perfect for beginners",
    features: [
      { name: "50 stocks monitoring", included: true },
      { name: "Basic AI signals", included: true },
      { name: "Weekly reports", included: true },
      { name: "Email support", included: true },
      { name: "All 212 stocks", included: false },
      { name: "Real-time alerts", included: false },
      { name: "API access", included: false },
    ],
    cta: "Start Free Trial",
    tier: "STARTER",
  },
  {
    name: "Pro",
    price: 29.99,
    currency: "£",
    description: "Most popular choice",
    features: [
      { name: "50 stocks monitoring", included: true },
      { name: "Basic AI signals", included: true },
      { name: "Weekly reports", included: true },
      { name: "Email support", included: true },
      { name: "All 212 stocks", included: true },
      { name: "Real-time alerts", included: true },
      { name: "API access", included: false },
    ],
    cta: "Start Pro Trial",
    tier: "PRO",
    recommended: true,
  },
  {
    name: "Elite",
    price: 99.99,
    currency: "£",
    description: "For professional traders",
    features: [
      { name: "50 stocks monitoring", included: true },
      { name: "Basic AI signals", included: true },
      { name: "Weekly reports", included: true },
      { name: "Email support", included: true },
      { name: "All 212 stocks", included: true },
      { name: "Real-time alerts", included: true },
      { name: "API access", included: true },
    ],
    cta: "Start Elite Trial",
    tier: "ELITE",
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "cancelled") {
      // Show cancellation message
      console.log("Payment was cancelled");
    }
  }, []);

  const handleSubscribe = async (tier: string) => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }

    setIsProcessing(true);
    setSelectedTier(tier);

    try {
      // Call backend to create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          origin: window.location.origin,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { checkoutUrl } = await response.json();
      window.open(checkoutUrl, "_blank");
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription. Please try again.");
    } finally {
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-card/50 border-b border-border/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-sm"
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your trading needs. All plans include a 7-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`card-premium p-8 relative transition-all duration-300 ${
                tier.recommended
                  ? "ring-2 ring-accent scale-105 md:scale-100"
                  : ""
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-muted-foreground text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.currency}</span>
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Billed monthly, cancel anytime
                </p>
              </div>

              <Button
                onClick={() => handleSubscribe(tier.tier)}
                disabled={isProcessing && selectedTier === tier.tier}
                className={`w-full mb-8 btn-premium ${
                  tier.recommended ? "bg-accent hover:bg-accent/90" : ""
                }`}
              >
                {isProcessing && selectedTier === tier.tier
                  ? "Processing..."
                  : tier.cta}
              </Button>

              <div className="space-y-4">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center gradient-text">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, all plans include a 7-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.
              </p>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely! You can cancel your subscription at any time. No questions asked, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
