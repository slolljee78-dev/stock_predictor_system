import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { trackProductEvent } from "@/lib/analytics";
import { getPricingRecommendation } from "@/lib/pricingRecommendation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Crown,
  Home,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { navigateToDashboardMenu, navigateToDashboardReturn } from "@/lib/navigation";

export const PRICING_TIERS: Array<{
  name: string;
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
    tier: "STARTER",
    audience: "Best for first-time signal users",
    description:
      "Planned for investors who want a focused daily review workflow without market overload.",
    cta: "Explore the workspace",
    highlight: "Planned daily review workflow",
    bullets: [
      { name: "Monitor up to 50 stocks", included: true },
      { name: "Daily AI-ranked signals", included: true },
      { name: "Weekly summary email", included: true },
      { name: "Simulator access", included: true },
      { name: "Planned alerts", included: false },
      { name: "Full Trading 212 coverage", included: false },
      { name: "Exports and API access", included: false },
    ],
  },
  {
    name: "Pro",
    tier: "PRO",
    audience: "Best for active Trading 212 investors",
    description:
      "Planned for members who want broader market coverage and more responsive review tools.",
    cta: "Explore the workspace",
    highlight: "Planned expanded workflow",
    recommended: true,
    bullets: [
      { name: "Monitor the full Trading 212 universe", included: true },
      { name: "Daily AI-ranked signals", included: true },
      { name: "Planned alerting", included: true },
      { name: "Planned support options", included: true },
      { name: "Simulator access", included: true },
      { name: "Validation workflow", included: true },
      { name: "Signal Engine access", included: true },
    ],
  },
  {
    name: "Elite",
    tier: "ELITE",
    audience: "Best for power users and advanced workflows",
    description:
      "Planned for users who want deeper validation tools and advanced workspace control.",
    cta: "Explore the workspace",
    highlight: "Planned advanced workflow",
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
    starter: "Planned focused coverage",
    pro: "Planned broader coverage",
    elite: "Planned advanced workflows",
  },
  {
    label: "Signal delivery",
    starter: "Planned daily review",
    pro: "Planned expanded review",
    elite: "Planned expanded review",
  },
  {
    label: "Validation tools",
    starter: "Current simulator",
    pro: "Planned validation access",
    elite: "Planned advanced validation",
  },
  {
    label: "Exports and API",
    starter: "Not yet available",
    pro: "Not yet available",
    elite: "Planned feature",
  },
  {
    label: "Support level",
    starter: "Details to be published",
    pro: "Details to be published",
    elite: "Details to be published",
  },
];

const faqs = [
  {
    question: "Are paid plans available today?",
    answer:
      "No. Paid subscriptions are not live yet. This page is a transparent preview of the planned access model, not a checkout offer.",
  },
  {
    question: "What can I use now?",
    answer:
      "You can sign in and explore the current workspace, including watchlists, signals, the simulator, and Signal Engine paper-trading workflows without entering payment details.",
  },
  {
    question: "When will billing details be published?",
    answer:
      "Pricing, billing, cancellations, and support terms will be published only after the payment flow and customer-support process have been fully tested.",
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const watchlistQuery = trpc.watchlist.list.useQuery(undefined, {
    enabled: !!user,
  });
  const signalsQuery = trpc.signals.getForUser.useQuery(undefined, {
    enabled: !!user,
  });

  const isAuthenticated = !!user;
  const watchlist = watchlistQuery.data ?? [];
  const signals = signalsQuery.data ?? [];
  const buySignals = signals.filter((signal) => signal.type === "buy").length;
  const sellSignals = signals.filter((signal) => signal.type === "sell").length;
  const signalCoverage = watchlist.length
    ? Math.min(100, Math.round((signals.length / watchlist.length) * 100))
    : 0;
  const recommendedTier = getPricingRecommendation(watchlist.length, signals.length);

  const handleExploreWorkspace = (tier: string) => {
    trackProductEvent("plan_preview_selected", {
      tier: tier.toLowerCase(),
      authenticated: isAuthenticated,
    });
    if (!isAuthenticated) {
      trackProductEvent("login_cta_clicked", { placement: "pricing_preview", tier: tier.toLowerCase() });
      window.location.href = getLoginUrl();
      return;
    }
    setLocation("/dashboard");
  };

  return (
    <div className="app-shell min-h-screen overflow-x-hidden pb-20 page-enter">
      <div className="hero-orb left-[-8rem] top-[-3rem] h-72 w-72 bg-primary/35" />
      <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/25" />

      <PublicSiteHeader currentPath="/pricing" />

        <div className="border-b border-border/70 bg-background/50">
        <div className="container flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigateToDashboardMenu(setLocation)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to menu</span>
              </button>
              <button
                onClick={() => navigateToDashboardReturn(setLocation)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium"
              >
                <Home className="h-4 w-4" />
                <span>Back to dashboard</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Back to home</span>
            </button>
          )}
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
                  Planned access model
                </div>
                <div className="space-y-4">
                  <h1 className="display-title max-w-5xl text-balance leading-tight">
                    Explore the workspace while <span className="gradient-text">plans are being prepared.</span>
                  </h1>
                  <p className="lead-copy max-w-3xl">
                    This page is a preview of a future access model. Paid subscriptions, billing, and service terms are not available yet; current workspace access does not require payment details.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    onClick={() => document.getElementById("plan-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    size="lg"
                    className="pill-button pill-button-primary h-14 px-7 text-base"
                  >
                    View planned access
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

              <div className="space-y-5">
                <div className="premium-card p-6 md:p-7">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What you can explore now</p>
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

                <div className="premium-card p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Your live signal snapshot</p>
                      <h2 className="mt-2 text-xl font-semibold text-foreground">Review your current workspace before paid plans launch</h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <LineChart className="h-5 w-5" />
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <div className="mt-5 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Watchlist</p>
                          <p className="mt-3 text-3xl font-semibold text-foreground">{watchlist.length}</p>
                          <p className="mt-2 text-sm text-muted-foreground">Tracked names in your current workspace</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/80">Buy signals</p>
                          <p className="mt-3 text-3xl font-semibold text-emerald-300">{buySignals}</p>
                          <p className="mt-2 text-sm text-emerald-100/70">Live long opportunities available now</p>
                        </div>
                        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-200/80">Sell signals</p>
                          <p className="mt-3 text-3xl font-semibold text-rose-300">{sellSignals}</p>
                          <p className="mt-2 text-sm text-rose-100/70">Active downside alerts in your watchlist</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Coverage</p>
                            <p className="mt-2 text-lg font-semibold text-foreground">{signalCoverage}% of your watchlist currently has active signals</p>
                          </div>
                          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                            {signals.length} live signals
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Use this snapshot to understand your current workspace. Future access tiers will be published only after billing, entitlements, and support have been fully tested.
                        </p>
                        <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/10 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/80">Future-plan preview</p>
                              <p className="mt-2 text-lg font-semibold text-foreground">{recommendedTier.tier}</p>
                            </div>
                            <Badge className="rounded-full bg-primary text-primary-foreground">{recommendedTier.badge}</Badge>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{recommendedTier.reason} This is an informational preview, not an offer to purchase.</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">How each plan helps this snapshot</p>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-foreground">Starter</p>
                              <Badge variant="secondary" className="rounded-full px-2.5 py-1">Planned access</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="rounded-full border-border/70">Planned focused coverage</Badge>
                              <Badge variant="outline" className="rounded-full border-border/70">Planned daily review</Badge>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-foreground">Pro</p>
                              <Badge className="rounded-full bg-primary text-primary-foreground">Planned access</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="secondary" className="rounded-full">Planned broader coverage</Badge>
                              <Badge variant="secondary" className="rounded-full">Planned alerting</Badge>
                              <Badge variant="secondary" className="rounded-full">Validation workflow</Badge>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-foreground">Elite</p>
                              <Badge className="rounded-full bg-accent text-accent-foreground">Planned access</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="secondary" className="rounded-full">Planned advanced validation</Badge>
                              <Badge variant="secondary" className="rounded-full">Planned exports and API</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-background/25 p-5 text-sm leading-6 text-muted-foreground">
                      Sign in to compare these plans against your own watchlist size, active buy and sell signals, and current signal coverage.
                    </div>
                  )}
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
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/8 px-4 py-3 text-sm font-semibold text-primary">Pricing and availability to be announced</div>
                  <p className="text-muted-foreground">{tier.description}</p>
                  <div className="rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-slate-200">
                    <span className="font-semibold text-white">Ideal outcome:</span> {tier.highlight}
                  </div>
                </div>

                <Button
                  onClick={() => handleExploreWorkspace(tier.tier)}
                  className={tier.recommended ? "pill-button pill-button-primary mt-8 h-12 w-full" : "pill-button pill-button-secondary mt-8 h-12 w-full"}
                >
                  {tier.cta}
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
                Planned access comparison
              </div>
              <h2>See the planned access model at a glance</h2>
              <p className="lead-copy">
                These details are planning information, not a billing offer. The final entitlement model will be verified before subscriptions become available.
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
                Questions about planned access
              </div>
              <h2>Clear launch status helps visitors make informed choices</h2>
              <p className="lead-copy">
                The product should never imply that a payment flow is available when it is not. These answers explain the current status clearly.
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
