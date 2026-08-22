import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  LineChart,
  Radar,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { getPublicAudienceState, getPublicPrimaryAction } from "@/lib/publicSite";
import { getLoginUrl } from "@/const";
import { trackProductEvent } from "@/lib/analytics";
import { useState } from "react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { FeatureShowcase } from "@/components/FeatureShowcase";

const featureCards = [
  {
    icon: TrendingUp,
    title: "Signal Engine — Auto Trade",
    description:
      "The platform's flagship feature. Set the Signal Engine to scan a stock universe, pick a basket, and auto-trade from live buy and sell signals for 1, 3, or 7 days. Close the tab and come back to results.",
  },
  {
    icon: BrainCircuit,
    title: "AI-ranked trade opportunities",
    description:
      "See which Trading 212 stocks have the strongest buy or sell setup, ranked by confidence score so you know exactly which setups to review first.",
  },
  {
    icon: BellRing,
    title: "Alerts, watchlists & validation",
    description:
      "Track your chosen stocks with live signal alerts, confidence movement, and a paper-trading simulator to validate ideas before committing real capital.",
  },
];

const proofStats = [
  { label: "Trading 212 stocks covered", value: "212" },
  { label: "Technical indicators used", value: "RSI, MACD, SMA, Bollinger Bands" },
  { label: "Signal update frequency", value: "Daily (end-of-day)" },
  { label: "Auto-trading simulator", value: "Paper trading with $10k virtual capital" },
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
    link: { text: "Learn about signals", href: "/how-it-works" }
  },
  {
    step: "03",
    title: "Activate the Signal Engine and let it auto-trade for you",
    body: "Set the Signal Engine to scan a stock universe, pick a random basket, and automatically open and close virtual positions from live buy and sell signals. Choose a 1-day, 3-day, or 7-day timed run — then come back to real results without touching a chart.",
    action: "/simulator",
    link: { text: "See how it works", href: "/how-it-works" }
  },
];

const socialProofStats = [
  { value: "212", label: "Trading 212 stocks covered" },
  { value: "Daily", label: "End-of-day signal review" },
  { value: "$10k", label: "Virtual capital for simulator" },
  { value: "Multi-indicator", label: "Consensus-based signals" },
];

const faqItems = [
  {
    question: "Will this guarantee me profits?",
    answer: "No. No trading tool guarantees profits. Markets are unpredictable, and you can lose money. Vortextrade is a decision-support tool that helps you analyze faster and validate ideas. The simulator is for learning only—real trading results may differ significantly. Always trade responsibly and never risk more than you can afford to lose.",
  },
  {
    question: "Is this a scam?",
    answer: "No. Vortextrade is a decision-support platform for self-directed investors. It does not provide personal financial advice and is not regulated by the FCA. We are transparent about our methodology (technical indicators), data sources (Alpha Vantage), and limitations (daily data, not real-time). Use the simulator to validate ideas before risking real capital.",
  },
  {
    question: "How accurate are the signals?",
    answer: "Signal accuracy depends on market conditions and is not guaranteed. We use technical indicators (RSI, MACD, SMA, Bollinger Bands) to generate buy/sell recommendations, but past performance does not guarantee future results. Use the simulator to test strategies before risking real capital.",
  },
  {
    question: "Can I use this with other brokers?",
    answer: "Yes. While we're optimized for Trading 212 stocks, the signals work with any broker that offers these stocks. The simulator is independent and works with any trading strategy.",
  },
  {
    question: "Is this for beginners or pros?",
    answer: "Both. Beginners benefit from the simple signal interface and paper trading simulator to learn. Experienced traders use it to validate ideas and test strategies before committing capital. Pick the plan that matches your needs.",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const heroPrimaryAction = getPublicPrimaryAction(getPublicAudienceState(isAuthenticated), "hero");

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

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

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* HERO SECTION - REDESIGNED */}
        <section className="relative overflow-hidden pt-20 md:pt-0">
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
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/85">Vortextrade</p>
                    <h1 className="display-title max-w-5xl text-balance leading-tight">
                      AI Signals. <span className="gradient-text">Auto Trade.</span><br className="hidden sm:block" /> Zero Manual Analysis.
                    </h1>
                  </div>

                  <p className="lead-copy">
                    Vortextrade generates AI-ranked buy and sell signals for Trading 212 stocks — then lets the <strong>Signal Engine</strong> automatically scan, select, and paper-trade a basket of stocks for you. Set it to run for 1, 3, or 7 days and review the simulated results when the run ends.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  {heroPrimaryAction.target === "dashboard" ? (
                    <Button
                      onClick={() => {
                        trackProductEvent("dashboard_cta_clicked", { placement: "homepage_hero" });
                        setLocation("/dashboard");
                      }}
                      size="lg"
                      className="pill-button pill-button-primary h-14 px-7 text-base"
                    >
                      {heroPrimaryAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="pill-button pill-button-primary h-14 px-7 text-base">
                      <a href={getLoginUrl()} onClick={() => trackProductEvent("login_cta_clicked", { placement: "homepage_hero" })}>
                        {heroPrimaryAction.label}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    className="pill-button pill-button-secondary h-14 px-7 text-base"
                    onClick={() => {
                      trackProductEvent("product_tour_opened", { placement: "homepage_hero" });
                      setShowOnboarding(true);
                    }}
                  >
                    How it works
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Trust Badges Below CTA */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Signal Engine auto-trade included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>1-day, 3-day &amp; 7-day timed runs</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-50/90 shadow-[0_20px_50px_rgba(245,158,11,0.12)]">
                  <p className="font-semibold uppercase tracking-[0.16em] text-amber-200">Important risk notice</p>
                  <p className="mt-2 leading-6 text-amber-50/85">
                    Vortextrade provides market analysis, ranking tools, and paper-trading workflows for educational decision support. It does not provide financial advice or personal investment recommendations, and it is not regulated by the FCA.
                  </p>
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
                  {/* Signal Engine Hero Card */}
                  <button
                    onClick={() => {
                      trackProductEvent("signal_engine_cta_clicked", { placement: "homepage_hero" });
                      setLocation("/simulator");
                    }}
                    className="w-full text-left rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 p-5 hover:shadow-xl hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground">Signal Engine</p>
                            <Badge className="rounded-full bg-primary/20 text-primary border-primary/30 text-[10px] px-2 py-0.5 uppercase tracking-wider">Auto Trade</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">Scans stocks, picks a basket, and paper-trades automatically</p>
                        </div>
                      </div>
                      <Badge className="rounded-full bg-primary/15 text-primary border-primary/30 text-xs px-2 py-1 shrink-0">Paper trading</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {["1-day run", "3-day run", "7-day run"].map((label) => (
                        <div key={label} className="rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-center">
                          <p className="text-xs font-semibold text-foreground">{label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Timed auto</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Set a run, close the tab, and review the simulated results when it finishes.</p>
                  </button>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      onClick={() => setLocation("/dashboard")}
                      className="feature-card min-h-36 text-left hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <LineChart className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Signal review</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">Ranked setups</p>
                      <p className="mt-2 text-sm text-muted-foreground">Review buy, sell, and no-trade context in one workspace.</p>
                    </button>

                    <button
                      onClick={() => setLocation("/simulator")}
                      className="feature-card min-h-36 text-left hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <Badge className="rounded-full bg-primary/15 text-primary border-primary/30 text-xs px-2 py-1">Paper trade</Badge>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Simulator</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">$10k virtual capital</p>
                      <p className="mt-2 text-sm text-muted-foreground">Test before real money.</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST SECTION - NEW */}
        <section className="section-shell">
          <div className="container">
            <div className="premium-card p-8 md:p-10">
              <div className="space-y-8">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold">Built by Traders. For Traders.</h2>
                  <p className="text-muted-foreground">
                    Vortextrade is designed for investors who want a more structured way to review signal setups, validation, and paper-trading results. You keep the final decision and control.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Transparent Algorithm</h3>
                    <p className="text-sm text-muted-foreground">We explain how signals are ranked. No black box.</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Responsible by Design</h3>
                    <p className="text-sm text-muted-foreground">We never promise profits. We promise clarity.</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Not FCA-Regulated</h3>
                    <p className="text-sm text-muted-foreground">This is decision-support software, not regulated investment advice, and it should be used with independent judgment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT PRINCIPLES */}
        <section className="section-shell">
          <div className="container">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">A clearer signal-review workflow</h2>
                <p className="text-muted-foreground">Explore the tools, understand the limitations, and validate ideas before deciding whether to act.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-4 mt-8">
                {socialProofStats.map((stat, index) => (
                  <div key={index} className="premium-card p-6 text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
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

        {/* WHY TRADERS TRUST SECTION */}
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
              <div className="flex flex-wrap gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={() => setLocation('/how-it-works')}>
                  How it works
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocation('/analysis')}>
                  Stock analysis
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
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

        {/* FEATURES SECTION */}
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
              {featureCards.map((feature, index) => {
                const Icon = feature.icon;
                const isSignalEngine = index === 0;
                return (
                  <article
                    key={feature.title}
                    className={`feature-card min-h-72 ${
                      isSignalEngine
                        ? "border-primary/50 bg-gradient-to-br from-primary/8 via-background to-accent/5 shadow-lg shadow-primary/10 relative overflow-hidden"
                        : ""
                    }`}
                  >
                    {isSignalEngine && (
                      <div className="absolute top-4 right-4">
                        <Badge className="rounded-full bg-primary/20 text-primary border-primary/30 text-[10px] uppercase tracking-wider px-2 py-0.5">Flagship</Badge>
                      </div>
                    )}
                    <div className={`mb-10 flex h-14 w-14 items-center justify-center rounded-2xl text-primary ${
                      isSignalEngine ? "bg-primary/20" : "bg-primary/14"
                    }`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-4 text-base text-muted-foreground">{feature.description}</p>
                    {isSignalEngine && (
                      <button
                        onClick={() => setLocation("/simulator")}
                        className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        Try the Signal Engine <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="workflow" className="section-shell">
          <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                How the workflow works
              </div>
              <h2>A smoother way to move from ideas to action.</h2>
              <p className="lead-copy">
                Vortextrade is designed to help you know what to look at first, what deserves closer attention, and what to review before you place a trade.
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

        {/* DEMO SECTION */}
        <section id="demo" className="section-shell">
          <div className="container grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className="space-y-4">
              <div className="eyebrow">
                <Star className="h-4 w-4 text-primary" />
                Platform tour
              </div>
              <h2>See every feature in action — live, right here.</h2>
              <p className="lead-copy">
                Explore the Signal Engine, live signals, paper-trading simulator, and alert system. Click any tab to jump to a feature.
              </p>
              <div className="premium-card p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What you can explore</p>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  {[
                    { label: "Signal Engine", desc: "Auto-trade a basket of stocks for 1, 3, or 7 days." },
                    { label: "Live Signals", desc: "AI-ranked buy and sell setups updated daily." },
                    { label: "Simulator", desc: "Paper-trade with £10,000 virtual capital, risk-free." },
                    { label: "Alerts", desc: "Get notified the moment a signal triggers on your watchlist." },
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p><span className="font-semibold text-foreground">{item.label}</span> — {item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <FeatureShowcase />
          </div>
        </section>

        {/* FAQ SECTION - NEW */}
        <section className="section-shell">
          <div className="container max-w-3xl">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Common Questions</h2>
                <p className="text-muted-foreground">Everything you need to know about Vortextrade</p>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div key={index} className="premium-card overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors text-left"
                    >
                      <h3 className="font-semibold text-foreground pr-4">{item.question}</h3>
                      <ChevronDown
                        className={`h-5 w-5 text-primary shrink-0 transition-transform ${
                          expandedFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedFaq === index && (
                      <div className="border-t border-border/50 px-6 py-4 bg-primary/5">
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
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

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary inline mr-2" />
                Plan availability and billing are being prepared. You can explore the current workspace without a payment commitment.
              </p>
            </div>
          </div>
        </section>

        {/* COMPLIANCE & CONTACT SECTION - NEW */}
        <section className="section-shell bg-primary/5">
          <div className="container max-w-3xl">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Important: Please Read Before Trading</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Risk Disclosure</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Trading stocks involves significant risk of loss. Past performance does not guarantee future results. Vortextrade signals are designed as decision support tools, not as investment advice or recommendations. You are responsible for all trading decisions and outcomes.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Key Risks</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span><strong>Market Risk:</strong> Stock prices can fall unexpectedly due to market conditions beyond anyone's control.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span><strong>Signal Risk:</strong> Even high-confidence signals can fail. No algorithm is 100% accurate.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span><strong>Emotional Risk:</strong> Trading can be emotionally taxing. Overconfidence or panic can lead to poor decisions.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Our Commitment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We are transparent about these risks. We do not promise profits. We do not guarantee returns. We do not encourage overtrading or excessive risk-taking. We provide tools to help you make better decisions. The rest is your responsibility.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* REGULATORY DISCLAIMER BAR */}
        <footer className="bg-muted/60 border-t border-border">
          <div className="container max-w-5xl py-6">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              <strong className="text-foreground">Regulatory Disclaimer:</strong> Vortextrade is not authorised or regulated by the Financial Conduct Authority (FCA) or any other financial regulatory body. The information, signals, and tools provided on this platform are for <strong className="text-foreground">educational and informational purposes only</strong> and do not constitute financial advice, investment advice, or a personal recommendation to buy or sell any security. Past performance is not a reliable indicator of future results. The value of investments can go down as well as up, and you may get back less than you invest. Always do your own research and seek independent financial advice from a qualified, FCA-authorised adviser before making any investment decision. Vortextrade accepts no liability for any financial loss arising from use of this platform.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
