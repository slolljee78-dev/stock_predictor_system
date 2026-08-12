/**
 * Free Signal Strength Calculator — /tools/signal-calculator
 *
 * A fully ungated, SEO-friendly interactive tool that lets visitors
 * calculate a simple signal strength score from their own technical
 * indicator readings. Designed to rank for queries like
 * "trading signal strength calculator" and drive sign-ups.
 */

import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  ArrowUpRight,
  Info,
  BarChart3,
  Activity,
} from "lucide-react";

interface Indicator {
  id: string;
  label: string;
  description: string;
  weight: number; // 0-1 weight in final score
  value: number; // 0-100 slider value (50 = neutral)
  bullishLabel: string;
  bearishLabel: string;
}

const DEFAULT_INDICATORS: Indicator[] = [
  {
    id: "rsi",
    label: "RSI (14)",
    description: "Relative Strength Index. Below 30 = oversold (bullish), above 70 = overbought (bearish).",
    weight: 0.25,
    value: 50,
    bullishLabel: "Oversold (<30)",
    bearishLabel: "Overbought (>70)",
  },
  {
    id: "macd",
    label: "MACD",
    description: "Moving Average Convergence/Divergence. Positive histogram = bullish momentum.",
    weight: 0.25,
    value: 50,
    bullishLabel: "Bullish crossover",
    bearishLabel: "Bearish crossover",
  },
  {
    id: "volume",
    label: "Volume",
    description: "Volume relative to 20-day average. High volume confirms signal strength.",
    weight: 0.20,
    value: 50,
    bullishLabel: "High (>150% avg)",
    bearishLabel: "Low (<50% avg)",
  },
  {
    id: "trend",
    label: "Price vs 50-day MA",
    description: "Price position relative to the 50-day moving average.",
    weight: 0.15,
    value: 50,
    bullishLabel: "Above 50MA",
    bearishLabel: "Below 50MA",
  },
  {
    id: "bollinger",
    label: "Bollinger Bands",
    description: "Price position within Bollinger Bands. Near lower band = potential buy; near upper = potential sell.",
    weight: 0.15,
    value: 50,
    bullishLabel: "Near lower band",
    bearishLabel: "Near upper band",
  },
];

function getSignalVerdict(score: number): {
  label: string;
  colour: string;
  bgColour: string;
  icon: React.ReactNode;
  description: string;
} {
  if (score >= 75) {
    return {
      label: "Strong Buy",
      colour: "text-emerald-400",
      bgColour: "bg-emerald-500/15 border-emerald-500/30",
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      description: "Multiple indicators align bullishly. High-confidence buy signal territory.",
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate Buy",
      colour: "text-emerald-300",
      bgColour: "bg-emerald-500/10 border-emerald-500/20",
      icon: <TrendingUp className="h-4 w-4 text-emerald-300" />,
      description: "More bullish than bearish signals. Consider a smaller position size.",
    };
  }
  if (score >= 45) {
    return {
      label: "Neutral",
      colour: "text-slate-300",
      bgColour: "bg-slate-700/40 border-slate-600/40",
      icon: <Minus className="h-4 w-4 text-slate-300" />,
      description: "Mixed signals. Wait for a clearer setup before entering.",
    };
  }
  if (score >= 30) {
    return {
      label: "Moderate Sell",
      colour: "text-rose-300",
      bgColour: "bg-rose-500/10 border-rose-500/20",
      icon: <TrendingDown className="h-4 w-4 text-rose-300" />,
      description: "More bearish than bullish signals. Consider reducing exposure.",
    };
  }
  return {
    label: "Strong Sell",
    colour: "text-rose-400",
    bgColour: "bg-rose-500/15 border-rose-500/30",
    icon: <TrendingDown className="h-5 w-5 text-rose-400" />,
    description: "Multiple indicators align bearishly. High-confidence sell signal territory.",
  };
}

export default function SignalCalculator() {
  const [location] = useLocation();
  const [indicators, setIndicators] = useState<Indicator[]>(DEFAULT_INDICATORS);

  const score = useMemo(() => {
    const weighted = indicators.reduce((acc, ind) => {
      // Normalise slider value (0-100) to a -1 to +1 scale, then weight it
      const normalised = (ind.value - 50) / 50; // -1 (bearish) to +1 (bullish)
      return acc + normalised * ind.weight;
    }, 0);
    // Map from -1..+1 to 0..100
    return Math.round(((weighted + 1) / 2) * 100);
  }, [indicators]);

  const verdict = getSignalVerdict(score);

  function updateIndicator(id: string, value: number) {
    setIndicators((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, value } : ind))
    );
  }

  function resetAll() {
    setIndicators(DEFAULT_INDICATORS.map((ind) => ({ ...ind, value: 50 })));
  }

  return (
    <>
      <Helmet>
        <title>Free Signal Strength Calculator — Trading 212 | Vortextrade</title>
        <meta
          name="description"
          content="Free trading signal strength calculator. Enter your RSI, MACD, volume, and moving average readings to get an instant buy/sell signal score. No sign-up required."
        />
        <meta
          property="og:title"
          content="Free Signal Strength Calculator | Vortextrade"
        />
        <meta
          property="og:description"
          content="Calculate a weighted signal strength score from your technical indicators in seconds. Free, no account needed."
        />
        <link
          rel="canonical"
          href="https://vortextrade.manus.space/tools/signal-calculator"
        />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Signal Strength Calculator",
          "url": "https://vortextrade.manus.space/tools/signal-calculator",
          "description": "Free trading signal strength calculator using RSI, MACD, volume, and moving average indicators.",
          "applicationCategory": "FinanceApplication",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0f1e]">
        <PublicSiteHeader currentPath={location} />

        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 font-medium mb-5">
              <Zap className="h-3.5 w-3.5" />
              Free tool · No sign-up required
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Signal Strength Calculator
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Enter your technical indicator readings and get an instant
              weighted buy/sell signal score. Based on the same methodology
              used by Vortextrade's AI.
            </p>
          </div>

          {/* Score display */}
          <Card className={`border mb-8 ${verdict.bgColour}`}>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {verdict.icon}
                <span className={`text-2xl font-bold ${verdict.colour}`}>
                  {verdict.label}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-2 w-48 rounded-full bg-slate-700/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      score >= 60
                        ? "bg-emerald-500"
                        : score >= 45
                        ? "bg-slate-400"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={`text-3xl font-bold tabular-nums ${verdict.colour}`}>
                  {score}
                </span>
                <span className="text-slate-500 text-sm">/100</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                {verdict.description}
              </p>
            </CardContent>
          </Card>

          {/* Indicators */}
          <Card className="bg-slate-800/40 border-slate-700/60 mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Indicator readings
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetAll}
                  className="border-slate-600 text-slate-400 hover:text-white bg-transparent text-xs h-7"
                >
                  Reset all
                </Button>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Drag each slider from bearish (left) to bullish (right)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {indicators.map((ind) => (
                <div key={ind.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                          {ind.label}
                        </span>
                        <Badge className="bg-slate-700/60 text-slate-400 border-slate-600 text-xs">
                          {Math.round(ind.weight * 100)}% weight
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        {ind.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 text-xs w-24 text-right shrink-0">
                      {ind.bearishLabel}
                    </span>
                    <Slider
                      value={[ind.value]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={([v]) => updateIndicator(ind.id, v)}
                      className="flex-1"
                    />
                    <span className="text-emerald-400 text-xs w-24 shrink-0">
                      {ind.bullishLabel}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="bg-slate-800/20 border-slate-700/40 mb-8">
            <CardContent className="pt-5 pb-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                How the score is calculated
              </h2>
              <div className="space-y-2 text-slate-400 text-sm leading-relaxed">
                <p>
                  Each indicator is assigned a weight based on its typical
                  predictive power. RSI and MACD each carry 25% of the total
                  score; volume confirmation adds 20%; price vs 50-day MA and
                  Bollinger Band position each contribute 15%.
                </p>
                <p>
                  A score above 60 suggests a buy signal; below 40 suggests a
                  sell signal; 40–60 is neutral territory. These thresholds
                  mirror the methodology used by Vortextrade's AI engine.
                </p>
                <p>
                  For automated signals that refresh every 15 minutes across
                  hundreds of stocks,{" "}
                  <a
                    href={getLoginUrl()}
                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                  >
                    sign up free
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
            <h3 className="text-white font-bold text-lg mb-2">
              Let the AI calculate signals for you
            </h3>
            <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
              Vortextrade automatically generates signals for 200+ stocks every
              15 minutes. Free accounts get 3 signals per day.
            </p>
            <Button
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6"
              onClick={() => { window.location.href = getLoginUrl(); }}
            >
              Start free — no card required
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
