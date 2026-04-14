import { Check, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { TierComparison } from "@/components/TierComparison";

const PRICING_TIERS = [
  {
    name: "Free",
    price: 0,
    currency: "£",
    description: "Test the platform",
    features: [
      { name: "3 stocks monitoring", included: true },
      { name: "5 signals per day", included: true },
      { name: "Basic signal export (CSV)", included: true },
      { name: "Email support", included: true },
      { name: "50 stocks monitoring", included: false },
      { name: "Real-time SMS alerts", included: false },
      { name: "API access", included: false },
    ],
    cta: "Start Free",
    tier: "FREE",
  },
  {
    name: "Starter",
    price: 9.99,
    currency: "£",
    description: "Perfect for beginners",
    features: [
      { name: "5 stocks monitoring", included: true },
      { name: "AI-powered buy/sell signals", included: true },
      { name: "Signal export (CSV, JSON)", included: true },
      { name: "Email support", included: true },
      { name: "50 stocks monitoring", included: false },
      { name: "Real-time SMS alerts", included: false },
      { name: "API access", included: false },
    ],
    cta: "Start Free Trial",
    tier: "STARTER",
  },
  {
    name: "Professional",
    price: 29.99,
    currency: "£",
    description: "Most popular choice",
    features: [
      { name: "50 stocks monitoring", included: true },
      { name: "AI-powered buy/sell signals", included: true },
      { name: "Signal export (CSV, JSON)", included: true },
      { name: "Email & SMS alerts", included: true },
      { name: "Portfolio performance tracker", included: true },
      { name: "Signal accuracy dashboard", included: true },
      { name: "API access", included: false },
    ],
    cta: "Start Professional Trial",
    tier: "PROFESSIONAL",
    recommended: true,
  },
  {
    name: "Elite",
    price: 99.99,
    currency: "£",
    description: "For professional traders",
    features: [
      { name: "Unlimited stocks monitoring", included: true },
      { name: "AI-powered buy/sell signals", included: true },
      { name: "Signal export (CSV, JSON, API)", included: true },
      { name: "Email & SMS alerts", included: true },
      { name: "Portfolio performance tracker", included: true },
      { name: "Signal accuracy dashboard", included: true },
      { name: "Full API access", included: true },
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

    // Handle free tier - no checkout needed
    if (tier === "FREE") {
      setLocation("/dashboard");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered trading signals for any broker. No platform lock-in, pure signal intelligence.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border transition-all ${
                tier.recommended
                  ? "border-accent-gold/50 bg-card/80 shadow-lg shadow-accent-gold/20 scale-105"
                  : "border-border bg-card/50"
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent-gold text-black px-4 py-1 rounded-full text-sm font-bold">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
                <p className="text-muted-foreground mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-black">{tier.currency}{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <button
                  onClick={() => handleSubscribe(tier.tier)}
                  disabled={isProcessing && selectedTier === tier.tier}
                  className={`w-full py-3 rounded-lg font-bold mb-8 transition-all ${
                    tier.recommended
                      ? "bg-accent-gold text-black hover:bg-accent-gold/90"
                      : "bg-accent text-black hover:bg-accent/90"
                  } disabled:opacity-50`}
                >
                  {isProcessing && selectedTier === tier.tier ? "Processing..." : tier.cta}
                </button>

                <div className="space-y-4">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-accent-emerald flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span
                        className={feature.included ? "text-foreground" : "text-muted-foreground/50"}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div className="mt-20 mb-20">
          <TierComparison />
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Can I trade on any broker?</h3>
              <p className="text-muted-foreground">
                Yes! Our signals work with any broker - Trading 212, Robinhood, Interactive Brokers, etc. Export signals and trade them yourself.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">What if I don't like the signals?</h3>
              <p className="text-muted-foreground">
                Cancel anytime, no questions asked. We offer a 7-day free trial so you can test the signals risk-free.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">How accurate are the signals?</h3>
              <p className="text-muted-foreground">
                Our ML model achieves 98% accuracy on historical data. Check the accuracy dashboard to see real-time performance metrics.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Do you manage my money?</h3>
              <p className="text-muted-foreground">
                No. We provide signals only. You control all trades and keep 100% of your profits. We never touch your funds.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Can I get an API for my platform?</h3>
              <p className="text-muted-foreground">
                Yes! Elite tier includes full API access. Contact support for integration details and custom pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
