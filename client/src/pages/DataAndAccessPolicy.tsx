import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { Badge } from "@/components/ui/badge";
import { Clock3, Database, ShieldCheck, Sparkles } from "lucide-react";

const policySections = [
  {
    icon: Clock3,
    title: "Freshness and availability",
    body: "Vortextrade combines cached market quotes, historical price data, technical calculations, and scheduled signal checks. Refresh timing can vary by data source, market hours, provider availability, and account workflow. A displayed timestamp is the reference point for a specific result; it is not a promise that every view updates continuously.",
  },
  {
    icon: Database,
    title: "How market data is used",
    body: "Prices and indicators are used to support educational analysis and paper-trading simulations. If a provider is delayed, unavailable, or returns incomplete data, Vortextrade should show an unavailable or stale-data state rather than present the result as current. Historical results and simulations are not a guarantee of future performance.",
  },
  {
    icon: Sparkles,
    title: "Signals and automated runs",
    body: "Signals are model-generated research prompts, not personalised investment advice. Signal Engine timed runs select and paper-trade simulated candidates under configured rules. They do not place broker orders, connect to Trading 212, or execute trades with customer funds.",
  },
  {
    icon: ShieldCheck,
    title: "Account and plan access",
    body: "Creating an account gives access to the current free workspace and any features explicitly shown as available. Features labelled as paid require an active paid-plan entitlement. Paid subscriptions and checkout are currently in launch-preview mode and cannot be purchased through Vortextrade until a future announcement confirms that checkout is live.",
  },
];

export default function DataAndAccessPolicy() {
  return (
    <div className="app-shell min-h-screen overflow-x-hidden pb-20 page-enter">
      <div className="hero-orb left-[-8rem] top-[-3rem] h-72 w-72 bg-primary/30" />
      <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/20" />
      <PublicSiteHeader currentPath="/data-and-access" />

      <main className="focus:outline-none">
        <section className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0 opacity-55" />
          <div className="container relative py-12 md:py-18 lg:py-22">
            <div className="max-w-4xl space-y-6">
              <Badge className="rounded-full border-primary/30 bg-primary/10 px-4 py-2 text-primary" variant="outline">
                Product transparency policy
              </Badge>
              <h1 className="display-title text-balance leading-tight">
                Data freshness, access, and <span className="gradient-text">product scope.</span>
              </h1>
              <p className="lead-copy max-w-3xl">
                This page is the authoritative reference for how Vortextrade presents market data, signal timing, account access, and paper-trading automation.
              </p>
              <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 text-sm leading-6 text-amber-50/90">
                <p className="font-semibold uppercase tracking-[0.16em] text-amber-200">Important risk notice</p>
                <p className="mt-2 text-amber-50/85">Vortextrade provides educational market analysis and simulated workflows. It is not financial advice, does not make personal recommendations, and does not execute real trades.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-12 md:pb-20">
          <div className="grid gap-5 md:grid-cols-2">
            {policySections.map((section) => {
              const Icon = section.icon;
              return (
                <article key={section.title} className="premium-card h-full p-6 md:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">{section.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-border/70 bg-card/45 p-6 text-sm leading-6 text-muted-foreground md:p-7">
            <h2 className="text-lg font-bold text-foreground">What to do when data looks out of date</h2>
            <p className="mt-2">Check the result timestamp and refresh the page. If the state remains unavailable, wait for the next provider refresh rather than relying on an older quote or simulated result. Do not use Vortextrade data as the sole basis for an investment decision.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
