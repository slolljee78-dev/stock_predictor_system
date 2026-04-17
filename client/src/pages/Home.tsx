import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
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
import { MobileMenuDrawer } from "@/components/MobileMenuDrawer";

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
    title: "Build a focused watchlist",
    body: "Add the shares you actually care about and keep your workspace centred on the names that matter to you.",
  },
  {
    step: "02",
    title: "Review the daily signal pulse",
    body: "Use AI-ranked buy and sell ideas as a starting point, then inspect the stock detail page for context and confidence.",
  },
  {
    step: "03",
    title: "Pressure-test ideas before acting",
    body: "Use the simulator and validation views to practice, compare outcomes, and build conviction before committing capital.",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

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

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-2 py-4 px-4 md:px-6 max-w-full">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-3 text-left flex-1 min-w-0"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90">Stock Predictor</p>
              <p className="text-sm text-muted-foreground truncate">Premium AI signals for Trading 212</p>
            </div>
          </button>

          <div className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#workflow" className="transition hover:text-foreground">How it works</a>
            <a href="#demo" className="transition hover:text-foreground">Platform tour</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            <a href="/faq" className="transition hover:text-foreground">FAQ</a>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 md:hidden">
            <MobileMenuDrawer />
          </div>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                className="pill-button pill-button-primary h-10 px-4 text-xs sm:h-12 sm:px-5 sm:text-sm md:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">Open dashboard</span>
                <span className="sm:hidden">Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button asChild className="pill-button pill-button-primary h-10 px-4 text-xs sm:h-12 sm:px-5 sm:text-sm md:text-base whitespace-nowrap">
                <a href={getLoginUrl()}>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="focus:outline-none">
        <section className="relative overflow-hidden pt-4 md:pt-0">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="container relative py-16 md:py-24 lg:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div className="space-y-8">
                <div className="eyebrow">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Premium trading intelligence for retail investors
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/85">Stock Predictor</p>
                    <h1 className="display-title max-w-5xl text-balance">
                      Stop guessing. <span className="gradient-text">Trade with a clearer signal stack.</span>
                    </h1>
                  </div>

                  <p className="lead-copy">
                    Stock Predictor gives Trading 212 investors a calmer, sharper workflow: build focused watchlists, review AI-ranked opportunities, and validate ideas with a premium dashboard that feels built for real decisions.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  {isAuthenticated ? (
                    <Button
                      onClick={() => setLocation("/dashboard")}
                      size="lg"
                      className="pill-button pill-button-primary h-14 px-7 text-base"
                    >
                      Go to my dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="pill-button pill-button-primary h-14 px-7 text-base">
                      <a href={getLoginUrl()}>
                        Start free
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
                    <div className="feature-card min-h-44">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <LineChart className="h-7 w-7 md:h-6 md:w-6" />
                        </div>
                        <Badge className="rounded-full bg-emerald-500/15 text-emerald-300 border-emerald-400/20 text-sm md:text-xs px-3 py-2 md:px-2 md:py-1">+18.4%</Badge>
                      </div>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">AI signal density</p>
                      <p className="mt-3 text-3xl md:text-3xl font-semibold tracking-tight">14 fresh setups</p>
                      <p className="mt-3 text-sm text-muted-foreground">Morning momentum and reversal candidates ranked by confidence.</p>
                    </div>

                    <div className="feature-card min-h-44">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                          <ShieldCheck className="h-7 w-7 md:h-6 md:w-6" />
                        </div>
                        <Badge className="rounded-full bg-primary/15 text-primary border-primary/30 text-sm md:text-xs px-3 py-2 md:px-2 md:py-1">Risk controlled</Badge>
                      </div>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Portfolio discipline</p>
                      <p className="mt-3 text-3xl md:text-3xl font-semibold tracking-tight">92% coverage</p>
                      <p className="mt-3 text-sm text-muted-foreground">Watchlist alerts, simulator testing, and stock detail pages connected in one flow.</p>
                    </div>
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
              <h2>A premium product flow, not just a list of widgets.</h2>
              <p className="lead-copy">
                The redesign focuses on clarity. New users should understand what to do first, and experienced users should be able to move from signals to deeper inspection without friction.
              </p>
            </div>

            <div className="grid gap-4">
              {workflowSteps.map((step) => (
                <div key={step.step} className="premium-card p-6 md:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-base text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="section-shell">
          <div className="container grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className="space-y-4">
              <div className="eyebrow">
                <Star className="h-4 w-4 text-primary" />
                Product tour
              </div>
              <h2>Watch the platform walkthrough.</h2>
              <p className="lead-copy">
                This section is reserved for the full walkthrough video so prospects can immediately understand the watchlist flow, signal ranking, and stock inspection experience.
              </p>
              <div className="premium-card p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">What the tour should show</p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>• How to add a stock to a watchlist</li>
                  <li>• How to read active buy and sell signals</li>
                  <li>• How to inspect stock details before acting</li>
                  <li>• How to use the simulator for idea testing</li>
                </ul>
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
                    <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/stock_predictor_demo_09200f51.mp4" type="video/mp4" />
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
