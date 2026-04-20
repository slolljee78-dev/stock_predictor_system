import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  ChevronRight,
  LineChart,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { getPublicAudienceState, getPublicPrimaryAction } from "@/lib/publicSite";
import { getLoginUrl } from "@/const";

const featureCards = [
  {
    icon: BrainCircuit,
    title: "AI-ranked trade opportunities",
    description:
      "See which Trading 212 names have the strongest buy or sell setup, with clear confidence scoring and context.",
  },
  {
    icon: Radar,
    title: "Watchlists that feel alive",
    description:
      "Track your chosen stocks with fresh signals, confidence movement, and simple next-step guidance instead of raw data overload.",
  },
  {
    icon: BellRing,
    title: "Alert-driven decision flow",
    description:
      "Know when to review a stock, when momentum shifts, and when a setup deserves attention without staring at charts all day.",
  },
];

const proofStats = [
  { label: "Trading 212 stocks covered", value: "212" },
  { label: "Signals generated each week", value: "12k+" },
  { label: "Average review time saved", value: "73%" },
  { label: "Portfolio workflows supported", value: "Watchlists, alerts, simulator" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Create a watchlist that suits you",
    body: "Add the stocks you want to follow and keep everything you care about in one simple, easy-to-scan view.",
    action: "/dashboard",
  },
  {
    step: "02",
    title: "Check your strongest opportunities",
    body: "See the clearest buy and sell opportunities first, then open each stock for the extra detail you need before making a move.",
    action: "/signals",
  },
  {
    step: "03",
    title: "Test ideas before you trade",
    body: "Use the simulator and validation tools to practise, compare outcomes, and feel more confident before risking real money.",
    action: "/simulator",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const heroPrimaryAction = getPublicPrimaryAction(getPublicAudienceState(isAuthenticated), "hero");

  if (loading) {
    return (
      <div className="dashboard-shell min-h-screen flex items-center justify-center px-6">
        <div className="premium-card px-8 py-10 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Loading your trading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen overflow-x-hidden scroll-smooth">
      <div className="hero-orb left-[-8rem] top-[-4rem] h-72 w-72 bg-primary/35" />
      <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/25" />

      <PublicSiteHeader currentPath="/" />

      <main className="focus:outline-none">
        <section className="relative overflow-hidden pt-0">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="container relative py-8 md:py-16 lg:py-20">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div className="space-y-8">
                <div className="eyebrow">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Premium AI Trading Signals for Retail Investors
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/85">Stock Predictor</p>
                    <h1 className="display-title max-w-5xl text-balance leading-tight">
                      Stop guessing.<br className="hidden sm:block" /> <span className="gradient-text">Trade with AI-Powered Stock Predictions.</span>
                    </h1>
                  </div>

                  <p className="lead-copy">
                    Stock Predictor is an AI-powered trading signal platform designed specifically for Trading 212 investors. We analyze technical indicators across your watchlist to identify high-conviction buy and sell opportunities, rank them by confidence, and deliver them through a clean dashboard. Skip the chart analysis—get actionable signals, validate strategies with our simulator, and trade with conviction.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  {heroPrimaryAction.target === "dashboard" ? (
                    <Button
                      onClick={() => setLocation("/dashboard")}
                      size="lg"
                      className="pill-button pill-button-primary h-14 px-7 text-base"
                    >
                      {heroPrimaryAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="pill-button pill-button-primary h-14 px-7 text-base">
                      <a href={getLoginUrl()}>
                        {heroPrimaryAction.label}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="pill-button pill-button-secondary h-14 px-7 text-base"
                  >
                    <a href="#demo">
                      Watch the platform tour
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {proofStats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                      <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-frame relative overflow-hidden p-4 md:p-5">
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/15 to-transparent" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/50 px-4 py-4 md:py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Signal workspace</p>
                      <p className="text-lg md:text-lg font-semibold">Today's highest-conviction ideas</p>
                    </div>
                    <Badge className="rounded-full bg-primary/15 px-4 py-2 text-primary border-primary/30 text-sm md:px-3 md:py-1">Live market view</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      onClick={() => setLocation("/dashboard")}
                      className="feature-card min-h-44 text-left hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <LineChart className="h-7 w-7 md:h-6 md:w-6" />
                        </div>
                        <Badge className="rounded-full bg-emerald-500/15 text-emerald-300 border-emerald-400/20 text-sm md:text-xs px-3 py-2 md:px-2 md:py-1">+18.4%</Badge>
                      </div>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Today's Ideas</p>
                      <p className="mt-3 text-3xl md:text-3xl font-semibold tracking-tight">14 trading opportunities</p>
                      <p className="mt-3 text-sm text-muted-foreground">Ranked by confidence so you know which setups to focus on first.</p>
                    </button>

                    <button
                      onClick={() => setLocation("/dashboard")}
                      className="feature-card min-h-44 text-left hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                          <ShieldCheck className="h-7 w-7 md:h-6 md:w-6" />
                        </div>
                        <Badge className="rounded-full bg-primary/15 text-primary border-primary/30 text-sm md:text-xs px-3 py-2 md:px-2 md:py-1">Risk controlled</Badge>
                      </div>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Your Watchlist</p>
                      <p className="mt-3 text-3xl md:text-3xl font-semibold tracking-tight">6 stocks tracked</p>
                      <p className="mt-3 text-sm text-muted-foreground">Get alerts when your stocks show strong buy or sell signals.</p>
                    </button>
                  </div>

                  <div className="premium-card p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What premium feels like</p>
                        <p className="mt-2 text-xl font-semibold">A cleaner, calmer dashboard designed to support real decision-making.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm md:w-[18rem]">
                        <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
                          <p className="text-muted-foreground">Watchlist flow</p>
                          <p className="mt-1 font-semibold">Guided and clear</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
                          <p className="text-muted-foreground">Signal review</p>
                          <p className="mt-1 font-semibold">Prioritised</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="container">
            <div className="premium-card px-6 py-5 md:px-8 md:py-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {proofStats.map((item) => (
                  <div key={item.label}>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell pt-0">
          <div className="container grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Why traders trust the workflow
              </div>
              <h2>Designed to make signal review clearer, calmer, and more accountable.</h2>
              <p className="lead-copy">
                The product does not ask you to trust a black box. It gives you ranked ideas, confidence context, watchlist focus, and validation tools so you can understand what deserves attention before acting.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Clear ranking logic",
                  body: "Signals are prioritised so you can review the strongest opportunities first instead of scanning dozens of charts in random order.",
                },
                {
                  title: "Built-in validation",
                  body: "Simulator and validation views encourage practice and review before you commit capital to a live idea.",
                },
                {
                  title: "Responsible use",
                  body: "The workflow is designed as decision support for investors, not as a promise of automatic profits or risk-free outcomes.",
                },
              ].map((item) => (
                <div key={item.title} className="premium-card p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary/80">{item.title}</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section-shell">
          <div className="container grid-section">
            <div className="max-w-3xl space-y-4">
              <div className="eyebrow">
                <BarChart3 className="h-4 w-4 text-primary" />
                Feature set
              </div>
              <h2>Everything you need to make faster, better trading reviews.</h2>
              <p className="lead-copy">
                The platform is structured around how investors actually work: filter a universe, review high-conviction ideas, inspect the detail, then track the outcome.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="feature-card min-h-72">
                    <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-4 text-base text-muted-foreground">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="section-shell">
          <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                How the workflow works
              </div>
              <h2>A smoother way to move from ideas to action.</h2>
              <p className="lead-copy">
                Stock Predictor is designed to help you know what to look at first, what deserves closer attention, and what to review before you place a trade.
              </p>
            </div>

            <div className="grid gap-4">
              {workflowSteps.map((step) => (
                <button
                  key={step.step}
                  onClick={() => step.action && setLocation(step.action)}
                  className="premium-card p-6 md:p-7 cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all text-left"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="section-shell">
          <div className="container grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className="space-y-4">
              <div className="eyebrow">
                <Star className="h-4 w-4 text-primary" />
                Product walkthrough
              </div>
              <h2>See how the platform helps you make better trading decisions.</h2>
              <p className="lead-copy">
                This quick walkthrough shows how Stock Predictor helps you move from tracking stocks, to spotting opportunities, to checking your ideas before you act.
              </p>
              <div className="premium-card p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What you will see in under two minutes</p>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  {[
                    "How your watchlist keeps the stocks you care about organised in one place.",
                    "How buy and sell signals help you spot the opportunities worth reviewing first.",
                    "How stock pages and alerts give you more context before you act.",
                    "How the simulator and validation tools help you test ideas with more confidence.",
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="premium-card overflow-hidden p-3 md:p-4">
              <div className="overflow-hidden rounded-[1.4rem] border border-border/70 bg-black">
                <div className="aspect-video w-full">
                  <video
                    width="100%"
                    height="100%"
                    controls
                    preload="metadata"
                    className="h-full w-full object-cover"
                    poster="https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80"
                    controlsList="nodownload"
                    playsInline
                  >
                    <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/stock_predictor_walkthrough_d76d0fcd.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="section-shell pb-20">
          <div className="container grid-section">
            <div className="max-w-3xl space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Plans
              </div>
              <h2>Pick the level of insight that matches your trading routine.</h2>
              <p className="lead-copy">
                Start with the essentials, then move up when you want broader coverage, richer alerts, and more confidence in the workflow.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "£9.99",
                  description: "Best for building your first signal-driven routine.",
                  bullets: ["50 monitored stocks", "Daily AI signals", "Weekly email summary"],
                },
                {
                  name: "Pro",
                  price: "£29.99",
                  description: "For active traders who want alerts and broader coverage.",
                  bullets: ["All 212 stocks", "Real-time alerts", "Priority product support"],
                  featured: true,
                },
                {
                  name: "Elite",
                  price: "£99.99",
                  description: "For advanced users validating strategies and APIs.",
                  bullets: ["API access", "Advanced workflows", "Full premium access"],
                },
              ].map((tier) => (
                <div key={tier.name} className={`premium-card p-7 ${tier.featured ? "ring-1 ring-primary/50 shadow-primary/10" : ""}`}>
                  {tier.featured && (
                    <Badge className="mb-5 rounded-full bg-primary text-primary-foreground px-3 py-1">Most popular</Badge>
                  )}
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary/80">{tier.name}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <p className="text-4xl font-semibold tracking-tight">{tier.price}</p>
                    <p className="pb-1 text-muted-foreground">/month</p>
                  </div>
                  <p className="mt-4 text-muted-foreground">{tier.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {tier.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => setLocation("/pricing")}
                    className="pill-button pill-button-secondary mt-8 h-12 w-full"
                  >
                    View plan details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
