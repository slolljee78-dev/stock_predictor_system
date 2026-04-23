import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Crown,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const PRICING_TIERS: Array<{
  name: string;
  price: number;
  currency: string;
  tier: string;
  audience: string;
  description: string;
  cta: string;
  highlight: string;
  recommended?: boolean;
  bullets: Array<{ name: string; included: boolean }>;
}> = [
  {
    name: "Starter",
    price: 9.99,
    currency: "£",
    tier: "STARTER",
    audience: "Best for first-time signal users",
    description:
      "For investors who want a clean daily review workflow without market overload.",
    cta: "Start Starter trial",
    highlight: "Daily signal review",
    bullets: [
      { name: "Monitor up to 50 stocks", included: true },
      { name: "Daily AI-ranked signals", included: true },
      { name: "Weekly summary email", included: true },
      { name: "Simulator access", included: true },
      { name: "Real-time alerts", included: false },
      { name: "Full Trading 212 coverage", included: false },
      { name: "Exports and API access", included: false },
    ],
  },
  {
    name: "Pro",
    price: 29.99,
    currency: "£",
    tier: "PRO",
    audience: "Best for active Trading 212 investors",
    description:
      "For members who want faster alerts, broader market coverage, and a more responsive workflow.",
    cta: "Start Pro trial",
    highlight: "Real-time conviction workflow",
    recommended: true,
    bullets: [
      { name: "Monitor the full Trading 212 universe", included: true },
      { name: "Daily AI-ranked signals", included: true },
      { name: "Real-time alerting", included: true },
      { name: "Priority support", included: true },
      { name: "Simulator access", included: true },
      { name: "Validation workflow", included: true },
      { name: "Exports and API access", included: false },
    ],
  },
  {
    name: "Elite",
    price: 99.99,
    currency: "£",
    tier: "ELITE",
    audience: "Best for power users and advanced workflows",
    description:
      "For serious operators who want exports, deeper validation tools, and more advanced workspace control.",
    cta: "Start Elite trial",
    highlight: "Full workflow access",
    bullets: [
      { name: "Everything in Pro", included: true },
      { name: "Advanced validation workspace", included: true },
      { name: "Exports and API access", included: true },
      { name: "Priority product support", included: true },
      { name: "Deeper portfolio workflows", included: true },
      { name: "Multi-workspace usage", included: true },
      { name: "Team and admin tooling", included: true },
    ],
  },
];

const comparisonRows = [
  {
    label: "Watchlist coverage",
    starter: "50 stocks",
    pro: "Full Trading 212 universe",
    elite: "Full universe + advanced workflows",
  },
  {
    label: "Signal delivery",
    starter: "Daily review",
    pro: "Daily + real-time alerts",
    elite: "Daily + real-time alerts",
  },
  {
    label: "Validation tools",
    starter: "Simulator only",
    pro: "Simulator + validation",
    elite: "Advanced validation workspace",
  },
  {
    label: "Exports and API",
    starter: "Not included",
    pro: "Not included",
    elite: "Included",
  },
  {
    label: "Support level",
    starter: "Standard",
    pro: "Priority",
    elite: "Priority + premium",
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can move up or down at any time. Plan changes are managed through Stripe and take effect according to your billing cycle.",
  },
  {
    question: "Is there a trial?",
    answer:
      "Yes. Every paid plan includes a 7-day trial so you can evaluate the workflow before subscribing.",
  },
  {
    question: "What happens after I subscribe?",
    answer:
      "You will be taken to a secure checkout page. After payment, your upgraded access is tied to your account and reflected inside the workspace.",
  },
  {
    question: "Can I cancel any time?",
    answer:
      "Yes. There are no long-term contracts. You can cancel whenever you like and keep access through the end of the paid period.",
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "cancelled") {
      console.log("Payment was cancelled");
    }
  }, []);

  const isAuthenticated = !!user;

  const handleSubscribe = async (tier: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
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
      <div className="hero-orb left-[-8rem] top-[-3rem] h-72 w-72 bg-primary/35" />
      <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/25" />

      <PublicSiteHeader currentPath="/pricing" />

        <div className="border-b border-border/70 bg-background/50">
        <div className="container flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to menu
          </button>
        </div>
      </div>

      <main className="focus:outline-none">
        <section className="relative overflow-hidden pt-0">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="container relative py-10 md:py-16 lg:py-20">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div className="space-y-6">
                <div className="eyebrow">
                  <Crown className="h-4 w-4 text-primary" />
                  Pricing designed for serious trading workflows
                </div>
                <div className="space-y-4">
                  <h1 className="display-title max-w-5xl text-balance leading-tight">
                    Choose the plan that matches your <span className="gradient-text">decision speed and market coverage.</span>
                  </h1>
                  <p className="lead-copy max-w-3xl">
                    Every plan gives you the same premium product foundation. The difference is how much coverage, alerting, and validation depth you want in your daily trading workflow.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    onClick={() => document.getElementById("plan-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    size="lg"
                    className="pill-button pill-button-primary h-14 px-7 text-base"
                  >
                    Compare plans
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="pill-button pill-button-secondary h-14 px-7 text-base">
                    <a href="/faq">
                      Read common questions
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="premium-card p-6 md:p-7">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What all plans include</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Sparkles,
                      title: "AI-ranked ideas",
                      body: "Signals are organised by conviction so you can review the strongest setups first.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Cleaner workflow",
                      body: "Watchlists, alerts, and validation live in one calmer product experience.",
                    },
                    {
                      icon: Zap,
                      title: "Faster decision-making",
                      body: "Spend less time filtering charts and more time reviewing actual opportunities.",
                    },
                    {
                      icon: Users,
                      title: "Built for Trading 212",
                      body: "Messaging, features, and coverage stay focused on the audience the product serves.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-2xl border border-border/70 bg-background/35 p-4 text-sm text-muted-foreground">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-2 leading-6">{item.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="plan-grid" className="section-shell pt-0 md:pt-4">
          <div className="container grid gap-6 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`premium-card relative flex h-full flex-col p-7 md:p-8 ${tier.recommended ? "ring-1 ring-primary/50 shadow-primary/15" : ""}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary/85">{tier.name}</p>
                    {tier.recommended ? (
                      <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                        Most popular
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-primary/80">{tier.audience}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight">{tier.currency}{tier.price}</span>
                    <span className="pb-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground">{tier.description}</p>
                  <div className="rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-slate-200">
                    <span className="font-semibold text-white">Ideal outcome:</span> {tier.highlight}
                  </div>
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
                      <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${feature.included ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {feature.included ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </div>
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell pt-4">
          <div className="container grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Compare the plans directly
              </div>
              <h2>See exactly what changes as you move up a tier</h2>
              <p className="lead-copy">
                This view is designed to answer the upgrade question quickly: how much extra speed, coverage, and workflow depth do you actually gain at each level?
              </p>
            </div>

            <div className="premium-card overflow-hidden p-0">
              <div className="grid grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] border-b border-border/70 bg-background/30 text-sm">
                <div className="px-4 py-4 font-semibold text-foreground md:px-6">Feature</div>
                <div className="px-4 py-4 text-center font-semibold text-foreground md:px-6">Starter</div>
                <div className="px-4 py-4 text-center font-semibold text-primary md:px-6">Pro</div>
                <div className="px-4 py-4 text-center font-semibold text-foreground md:px-6">Elite</div>
              </div>
              {comparisonRows.map((row, index) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] text-sm ${index !== comparisonRows.length - 1 ? "border-b border-border/60" : ""}`}
                >
                  <div className="px-4 py-4 font-medium text-foreground md:px-6">{row.label}</div>
                  <div className="px-4 py-4 text-center text-muted-foreground md:px-6">{row.starter}</div>
                  <div className="px-4 py-4 text-center text-primary md:px-6">{row.pro}</div>
                  <div className="px-4 py-4 text-center text-muted-foreground md:px-6">{row.elite}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Questions traders ask before upgrading
              </div>
              <h2>Clear commercial answers build confidence faster</h2>
              <p className="lead-copy">
                The commercial side should be as calm and understandable as the product itself. These are the essential questions most users ask before they begin.
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
