import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Database, FlaskConical, ShieldAlert, Sigma } from "lucide-react";
import { Helmet } from "react-helmet-async";

const sections = [
  {
    icon: Database,
    title: "Inputs and timing",
    body: "The current signal workflow uses available daily OHLCV market data from the configured provider integration. Coverage, refresh timing, and data completeness can vary with market hours, provider availability, and rate limits. A timestamp describes the data point used for a result; it is not a live-price guarantee.",
  },
  {
    icon: Sigma,
    title: "Technical rule set",
    body: "The implemented rules evaluate RSI (14-period), MACD (12/26-period), 20- and 50-period simple moving averages, and 20-period Bollinger Bands. These inputs produce directional buy, sell, or hold context. A hold outcome is expected when directional evidence is mixed or incomplete.",
  },
  {
    icon: BarChart3,
    title: "Confidence meaning",
    body: "Confidence is a capped score for the directional agreement of the implemented indicator rules. It is not a probability of profit, a forecast, or a recommendation tailored to an individual. Missing inputs reduce the available evidence rather than being filled with made-up values.",
  },
  {
    icon: FlaskConical,
    title: "Simulator evidence",
    body: "Signal Engine and simulator outcomes are paper-trading records. They use virtual capital and recorded quote or fallback-estimate pricing. They do not represent executed broker trades, and they should not be treated as an audited live-trading track record.",
  },
];

export default function Methodology() {
  return (
    <div className="app-shell min-h-screen overflow-x-hidden pb-20 page-enter">
      <Helmet>
        <title>Signal Methodology & Evidence | Vortextrade</title>
        <meta name="description" content="A transparent explanation of Vortextrade signal inputs, technical rules, confidence scoring, simulator scope, and performance-reporting limits." />
        <link rel="canonical" href="https://vortextrade.manus.space/methodology" />
      </Helmet>
      <div className="hero-orb left-[-8rem] top-[-3rem] h-72 w-72 bg-primary/30" />
      <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/20" />
      <PublicSiteHeader currentPath="/methodology" />

      <main className="focus:outline-none">
        <section className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0 opacity-55" />
          <div className="container relative py-12 md:py-18 lg:py-22">
            <div className="max-w-4xl space-y-6">
              <Badge className="rounded-full border-primary/30 bg-primary/10 px-4 py-2 text-primary" variant="outline">Methodology and evidence</Badge>
              <h1 className="display-title text-balance leading-tight">How Vortextrade turns data into <span className="gradient-text">signal context.</span></h1>
              <p className="lead-copy max-w-3xl">This page explains the currently implemented methodology and the limits on what its outputs can demonstrate. It is intended to make the product easier to evaluate, not to persuade anyone to trade.</p>
              <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 text-sm leading-6 text-amber-50/90">
                <p className="font-semibold uppercase tracking-[0.16em] text-amber-200">Performance-reporting status</p>
                <p className="mt-2 text-amber-50/85">Vortextrade does not currently publish an independently audited live-trading performance record or a backtest-performance headline. Any workspace performance view is a personal paper-trading or validation record, not evidence of future results.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-12 md:pb-20">
          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return <article key={section.title} className="premium-card h-full p-6 md:p-7"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">{section.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p></article>;
            })}
          </div>
          <div className="mt-6 rounded-3xl border border-border/70 bg-card/45 p-6 text-sm leading-6 text-muted-foreground md:p-7">
            <div className="flex gap-3"><ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="text-lg font-bold text-foreground">What would be needed for public performance evidence</h2><p className="mt-2">Before publishing any future aggregate performance report, Vortextrade should retain timestamped inputs, fixed entry and exit assumptions, transaction-cost assumptions, data-source labels, and a clear separation between paper, backtest, and live execution. Until then, no simulator or signal-activity metric should be read as a verified return claim.</p></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
