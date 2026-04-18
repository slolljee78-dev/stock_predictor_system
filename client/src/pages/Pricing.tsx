import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, ChevronLeft, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RecentPagesMenu } from "@/components/RecentPagesMenu";
import { MobileMenuDrawer } from "@/components/MobileMenuDrawer";
import { UserProfileMenu } from "@/components/UserProfileMenu";

const getBackPath = () => {
  if (typeof window !== 'undefined' && document.referrer.includes('/dashboard')) {
    return '/dashboard';
  }
  return '/';
};

const PRICING_TIERS = [
  {
    name: "Starter",
    price: 9.99,
    currency: "£",
    description: "For investors who want a clean daily review workflow without market overload.",
    tier: "STARTER",
    cta: "Start Starter trial",
    bullets: [
      { name: "Monitor up to 50 stocks", included: true },
      { name: "Daily AI-ranked signals", included: true },
      { name: "Weekly summary email", included: true },
      { name: "Simulator access", included: true },
      { name: "Real-time alerts", included: false },
      { name: "Full 212-stock universe", included: false },
      { name: "API and export access", included: false },
    ],
  },
  {
    name: "Pro",
    price: 29.99,
    currency: "£",
    description: "Best for active Trading 212 users who want richer coverage and faster alerts.",
    tier: "PRO",
    cta: "Start Pro trial",
    recommended: true,
    bullets: [
      { name: "Monitor the full Trading 212 universe", included: true },
      { name: "Daily AI-ranked signals", included: true },
      { name: "Real-time alerting", included: true },
      { name: "Priority support", included: true },
      { name: "Simulator access", included: true },
      { name: "Validation workflow", included: true },
      { name: "API and export access", included: false },
    ],
  },
  {
    name: "Elite",
    price: 99.99,
    currency: "£",
    description: "For serious operators who want advanced workflow access, exports, and premium tooling.",
    tier: "ELITE",
    cta: "Start Elite trial",
    bullets: [
      { name: "Everything in Pro", included: true },
      { name: "Advanced validation workspace", included: true },
      { name: "API and export access", included: true },
      { name: "Priority product support", included: true },
      { name: "Deeper portfolio workflows", included: true },
      { name: "Multi-workspace usage", included: true },
      { name: "Team and admin tooling", included: true },
    ],
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can move up or down at any time. Plan changes are managed through Stripe and take effect according to the billing cycle.",
  },
  {
    question: "Is there a trial?",
    answer:
      "Yes. Every plan includes a 7-day free trial so you can assess the workflow before committing to a subscription.",
  },
  {
    question: "What happens after I subscribe?",
    answer:
      "You will be taken to a secure checkout page. Once completed, the upgraded access is connected to your account and reflected in the product workspace.",
  },
  {
    question: "Can I cancel any time?",
    answer:
      "Yes. There are no long-term contracts. You can cancel at any point and keep access through the remainder of the paid period.",
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backPath, setBackPath] = useState('/');
  const [backLabel, setBackLabel] = useState('Back to menu');

  useEffect(() => {
    const path = getBackPath();
    setBackPath(path);
    setBackLabel(path === '/dashboard' ? 'Back to dashboard' : 'Back to menu');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "cancelled") {
      console.log("Payment was cancelled");
    }
  }, []);

  const isAuthenticated = !!user;

  const handleSubscribe = async (tier: string) => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }

    setSelectedTier(tier);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

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
    <div className="app-shell min-h-screen overflow-x-hidden pb-20 page-enter">
      <div className="hero-orb left-[-6rem] top-0 h-72 w-72 bg-primary/30" />
      <div className="hero-orb right-[-7rem] top-32 h-72 w-72 bg-accent/20" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="rounded-full px-4" onClick={() => setLocation(backPath)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
            <RecentPagesMenu />
            <div className="hidden md:block">
              <MobileMenuDrawer />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserProfileMenu />
            <Button className="pill-button pill-button-primary h-11 px-5" onClick={() => setLocation("/dashboard")}>
              Open dashboard
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="container mt-8">
          <Breadcrumb items={[{ label: "Pricing", href: "/pricing" }]} />
        </div>
        <section className="section-shell pb-12 pt-16 md:pt-24">
          <div className="container grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <div className="eyebrow">
                <Sparkles className="h-4 w-4 text-primary" />
                Premium plans
              </div>
              <div className="space-y-4">
                <h1 className="display-title max-w-5xl text-balance">
                  Pricing designed around <span className="gradient-text">serious trading workflows</span>
                </h1>
                <p className="lead-copy">
                  Choose the access level that matches how you review opportunities. Every tier is built around the same premium product experience: cleaner watchlists, stronger signals, and a calmer decision flow.
                </p>
              </div>
            </div>

            <div className="premium-card p-6 md:p-7">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Included across the platform</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  "Focused watchlist workflow",
                  "AI-ranked trade signals",
                  "Stock detail review pages",
                  "Simulator and validation tools",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-background/35 p-4 text-sm text-muted-foreground">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell pt-6">
          <div className="container grid gap-6 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`premium-card relative flex h-full flex-col p-7 md:p-8 ${tier.recommended ? "ring-1 ring-primary/50 shadow-primary/15" : ""}`}
              >
                {tier.recommended && (
                  <Badge className="mb-5 w-fit rounded-full bg-primary text-primary-foreground px-3 py-1">
                    Most popular
                  </Badge>
                )}

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary/85">{tier.name}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight">{tier.currency}{tier.price}</span>
                    <span className="pb-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">{tier.description}</p>
                </div>

                <Button
                  onClick={() => handleSubscribe(tier.tier)}
                  disabled={isProcessing && selectedTier === tier.tier}
                  className={tier.recommended ? "pill-button pill-button-primary mt-8 h-12 w-full" : "pill-button pill-button-secondary mt-8 h-12 w-full"}
                >
                  {isProcessing && selectedTier === tier.tier ? "Processing…" : tier.cta}
                </Button>

                <div className="mt-8 space-y-4">
                  {tier.bullets.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <X className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                FAQ
              </div>
              <h2>Questions traders ask before upgrading</h2>
              <p className="lead-copy">
                The commercial side should be as clear as the product itself. These are the essentials most users want answered before they start.
              </p>
            </div>

            <div className="grid gap-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="premium-card p-6">
                  <h3 className="text-xl font-semibold tracking-tight">{faq.question}</h3>
                  <p className="mt-3 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
