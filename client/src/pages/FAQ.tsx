import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getPublicAudienceState, getPublicPrimaryAction } from "@/lib/publicSite";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  featured?: boolean;
};

const faqItems: FAQItem[] = [
  {
    id: "top-1",
    category: "Before you start",
    featured: true,
    question: "What does Stock Predictor actually do for a Trading 212 investor?",
    answer:
      "It turns a large watchlist into a cleaner daily workflow. Instead of checking every chart yourself, you see ranked buy and sell ideas, review their confidence, and move into simulator or validation views before acting.",
  },
  {
    id: "top-2",
    category: "Before you start",
    featured: true,
    question: "Do I need trading experience to use it?",
    answer:
      "No. The product is designed to help beginners and active self-directed investors review opportunities faster. Signals are intended to improve decision quality, not replace judgment.",
  },
  {
    id: "top-3",
    category: "Pricing & billing",
    featured: true,
    question: "Is there a trial before I subscribe?",
    answer:
      "Yes. Paid plans include a 7-day trial so you can assess the workflow before committing to a subscription.",
  },
  {
    id: "top-4",
    category: "Pricing & billing",
    featured: true,
    question: "Can I cancel or change plans later?",
    answer:
      "Yes. You can cancel whenever you like or move between plans as your workflow changes. Access remains active through the remainder of your current paid period.",
  },
  {
    id: "signals-1",
    category: "Signals & methodology",
    question: "How often are signals updated?",
    answer:
      "Signals are refreshed as new market data arrives. The product is designed to surface the strongest opportunities quickly rather than overwhelm you with constant noise.",
  },
  {
    id: "signals-2",
    category: "Signals & methodology",
    question: "What does the confidence score mean?",
    answer:
      "Confidence indicates how strongly the ranking model favours a setup relative to others in the same workflow. It is intended as a prioritisation tool, not a guarantee.",
  },
  {
    id: "signals-3",
    category: "Signals & methodology",
    question: "Are signals meant to be followed automatically?",
    answer:
      "No. Signals are decision support. You should still review the setup, consider your own risk tolerance, and use the simulator or validation tools before committing capital.",
  },
  {
    id: "signals-4",
    category: "Signals & methodology",
    question: "How does the platform help reduce bad decisions?",
    answer:
      "The workflow is built around ranking, watchlist focus, alerts, and validation. That structure is meant to reduce scatter, shorten review time, and encourage more deliberate decisions.",
  },
  {
    id: "platform-1",
    category: "Platform & access",
    question: "Is the platform available on mobile?",
    answer:
      "Yes. The product is designed to work well on phone screens so you can review signals, plans, and settings without needing a desktop-only workflow.",
  },
  {
    id: "platform-2",
    category: "Platform & access",
    question: "What is included in the simulator and validation views?",
    answer:
      "They help you pressure-test ideas before acting with real capital. The simulator supports practice workflows, while validation helps you review outcomes and build confidence over time.",
  },
  {
    id: "platform-3",
    category: "Platform & access",
    question: "Does the platform focus on a specific audience?",
    answer:
      "Yes. The language, workflows, and plan structure are tailored to Trading 212-style investors who want a cleaner signal review process rather than a generic trading terminal.",
  },
  {
    id: "billing-1",
    category: "Pricing & billing",
    question: "What happens after checkout?",
    answer:
      "After secure checkout, your account is upgraded and the relevant product access is reflected in the workspace tied to your sign-in.",
  },
  {
    id: "billing-2",
    category: "Pricing & billing",
    question: "Which plan should I choose?",
    answer:
      "Starter is for simple daily review, Pro is for active users who want faster alerting and broader coverage, and Elite is for advanced workflows with exports and deeper validation tooling.",
  },
  {
    id: "trust-1",
    category: "Trust & responsible use",
    question: "Does the platform guarantee profits?",
    answer:
      "No. The platform is intended to improve review quality and workflow clarity. Market outcomes are uncertain, and users should apply their own judgment and risk controls.",
  },
  {
    id: "trust-2",
    category: "Trust & responsible use",
    question: "How should I use signals responsibly?",
    answer:
      "Treat signals as ranked ideas to investigate. Use position sizing, your own risk limits, and validation tools before acting on any opportunity.",
  },
  {
    id: "trust-3",
    category: "Trust & responsible use",
    question: "Is Stock Predictor regulated by the FCA or giving financial advice?",
    answer:
      "No. Stock Predictor is decision-support software for self-directed investors. It does not provide personal financial advice, it is not regulated by the FCA, and it should be used alongside your own research, judgment, and risk controls.",
  },
  {
    id: "trust-4",
    category: "Trust & responsible use",
    question: "Why does the product emphasise validation and simulation?",
    answer:
      "Because the product is designed to support better decisions, not impulsive ones. Validation helps you review what is working, and simulation helps you practice without immediate capital risk.",
  },
];

const categories = [
  "All questions",
  ...Array.from(new Set(faqItems.map((item) => item.category))),
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All questions");
  const [openItemIds, setOpenItemIds] = useState<string[]>(faqItems.filter((item) => item.featured).map((item) => item.id));
  const productAction = getPublicPrimaryAction(getPublicAudienceState(isAuthenticated), "header");

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = activeCategory === "All questions" || item.category === activeCategory;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const featuredItems = faqItems.filter((item) => item.featured);

  const toggleItem = (id: string) => {
    setOpenItemIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  };

  return (
    <div className="app-shell min-h-screen overflow-x-hidden pb-20 page-enter">
      <div className="hero-orb left-[-8rem] top-[-3rem] h-72 w-72 bg-primary/35" />
      <div className="hero-orb right-[-7rem] top-24 h-80 w-80 bg-accent/25" />

      <PublicSiteHeader currentPath="/faq" />

      <main className="focus:outline-none">
        <section className="relative overflow-hidden pt-0">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="container relative py-10 md:py-16 lg:py-20">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div className="space-y-6">
                <div className="eyebrow">
                  <CircleHelp className="h-4 w-4 text-primary" />
                  Answers before you subscribe
                </div>
                <div className="space-y-4">
                  <h1 className="display-title max-w-5xl text-balance leading-tight">
                    Get clear answers on <span className="gradient-text">pricing, workflow, and responsible use.</span>
                  </h1>
                  <p className="lead-copy max-w-3xl">
                    This FAQ is designed to help you understand what the product does, who it is for, how plans differ, and how to use signals with a calmer decision process.
                  </p>
                  <div className="max-w-3xl rounded-3xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-50/90 shadow-[0_20px_50px_rgba(245,158,11,0.12)]">
                    <p className="font-semibold uppercase tracking-[0.16em] text-amber-200">Important risk notice</p>
                    <p className="mt-2 leading-6 text-amber-50/85">
                      Stock Predictor provides market analysis, ranking tools, and paper-trading workflows for educational decision support. It does not provide financial advice or personal investment recommendations, and it is not regulated by the FCA.
                    </p>
                  </div>
                </div>
                <div className="relative max-w-xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search questions, plans, alerts, simulator…"
                    className="h-12 rounded-full border-border/70 bg-background/55 pl-11"
                  />
                </div>
              </div>

              <div className="premium-card p-6 md:p-7">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Top questions before you start</p>
                <div className="mt-5 space-y-4">
                  {featuredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="w-full rounded-2xl border border-border/70 bg-background/35 px-4 py-4 text-left transition hover:border-primary/30 hover:bg-background/45"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.question}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform ${openItemIds.includes(item.id) ? "rotate-180" : ""}`} />
                      </div>
                      {openItemIds.includes(item.id) ? (
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell pt-0 md:pt-4">
          <div className="container space-y-6">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === category ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(59,130,246,0.28)]" : "border border-border/70 bg-background/45 text-muted-foreground hover:border-primary/25 hover:text-foreground"}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <article key={item.id} className="premium-card overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/85">{item.category}</p>
                      <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">{item.question}</h2>
                    </div>
                    <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-primary transition-transform ${openItemIds.includes(item.id) ? "rotate-180" : ""}`} />
                  </button>
                  {openItemIds.includes(item.id) ? (
                    <div className="border-t border-border/70 px-6 py-5 text-sm leading-7 text-muted-foreground">
                      {item.answer}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            {filteredItems.length === 0 ? (
              <div className="premium-card p-8 text-center">
                <p className="text-lg font-semibold text-foreground">No matching questions found</p>
                <p className="mt-2 text-muted-foreground">Try a simpler search term or switch back to all questions.</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section-shell">
          <div className="container grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Still deciding?
              </div>
              <h2>Review the plans or continue into the product when you are ready</h2>
              <p className="lead-copy">
                If you already understand the workflow, the next best step is to compare plans or move into the workspace and see the product structure directly.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLocation("/pricing")}
                className="premium-card p-6 text-left transition hover:border-primary/25 hover:shadow-[0_18px_40px_rgba(59,130,246,0.14)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">Compare plans</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  See which tier fits your review speed, market coverage, and validation needs.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (productAction.target === "dashboard") {
                    setLocation("/dashboard");
                    return;
                  }

                  window.location.href = getLoginUrl();
                }}
                className="premium-card p-6 text-left transition hover:border-primary/25 hover:shadow-[0_18px_40px_rgba(59,130,246,0.14)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{productAction.label}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {productAction.target === "dashboard"
                    ? "Return to your dashboard and continue your current workflow."
                    : "Sign in and move directly into your signal workspace when you are ready to start."}
                </p>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
