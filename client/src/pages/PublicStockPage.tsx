/**
 * Public stock ticker page — /stocks/:ticker
 *
 * Fully ungated, SEO-indexed page showing the last 30 days of AI signals
 * for a specific stock. Designed to rank for queries like
 * "AAPL AI trading signals" or "NVDA buy sell signal today".
 */

import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  BarChart3,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

function SignalRow({
  type,
  confidenceScore,
  priceAtSignal,
  createdAt,
  analysis,
  isLocked,
}: {
  type: "buy" | "sell" | "hold";
  confidenceScore: number;
  priceAtSignal: string | null;
  createdAt: Date;
  analysis: string | null;
  isLocked: boolean;
}) {
  const isBuy = type === "buy";
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-700/50 last:border-0">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isBuy ? "bg-emerald-500/15" : "bg-rose-500/15"
        }`}
      >
        {isBuy ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-rose-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={
              isBuy
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-bold uppercase"
                : "bg-rose-500/15 text-rose-400 border-rose-500/30 text-xs font-bold uppercase"
            }
          >
            {type.toUpperCase()}
          </Badge>
          <span className="text-slate-400 text-xs">
            {new Date(createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {priceAtSignal && (
            <span className="text-slate-400 text-xs">
              @ ${parseFloat(priceAtSignal).toFixed(2)}
            </span>
          )}
        </div>
        {analysis && !isLocked && (
          <p className="text-slate-400 text-xs mt-1 line-clamp-2">{analysis}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-slate-400 text-xs mb-0.5">Confidence</p>
        <p
          className={`text-sm font-bold ${
            isLocked
              ? "text-slate-500"
              : confidenceScore >= 80
              ? "text-emerald-400"
              : confidenceScore >= 65
              ? "text-amber-400"
              : "text-rose-400"
          }`}
        >
          {isLocked ? "≤60%" : `${confidenceScore}%`}
        </p>
      </div>
    </div>
  );
}

export default function PublicStockPage() {
  const [location] = useLocation();
  const params = useParams<{ ticker: string }>();
  const ticker = (params.ticker || "").toUpperCase();
  const { user } = useAuth();

  const { data, isLoading } = trpc.publicSignals.getForTicker.useQuery(ticker, {
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });

  const stock = data?.stock;
  const signals = data?.signals ?? [];

  const buyCount = signals.filter((s) => s.type === "buy").length;
  const sellCount = signals.filter((s) => s.type === "sell").length;
  const latestSignal = signals[0];

  const pageTitle = stock
    ? `${ticker} AI Trading Signals — Buy or Sell? | Vortextrade`
    : `${ticker} Trading Signals | Vortextrade`;

  const pageDesc = stock
    ? `AI-generated buy and sell signals for ${stock.name} (${ticker}). ${buyCount} buy signals and ${sellCount} sell signals in the last 30 days. Free to view.`
    : `AI-generated trading signals for ${ticker} on Vortextrade.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta
          property="og:url"
          content={`https://vortextrade.manus.space/stocks/${ticker}`}
        />
        <link
          rel="canonical"
          href={`https://vortextrade.manus.space/stocks/${ticker}`}
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0f1e]">
        <PublicSiteHeader currentPath={location} />

        <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
            <a href="/signals/today" className="hover:text-slate-300 transition-colors">
              Today's Signals
            </a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300">{ticker}</span>
          </nav>

          {/* Stock header */}
          {isLoading ? (
            <div className="space-y-3 mb-8">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-5 w-72" />
            </div>
          ) : !stock ? (
            <div className="text-center py-20">
              <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                {ticker} not found
              </h1>
              <p className="text-slate-400 mb-6">
                We don't currently track signals for {ticker}. Add it to your
                watchlist after signing up and we'll start generating signals.
              </p>
              <Button
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                Sign up free
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      {ticker}
                    </h1>
                    <p className="text-slate-400 mt-1">{stock.name}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-slate-700/60 text-slate-300 border-slate-600 text-xs">
                        {stock.exchange}
                      </Badge>
                      {stock.sector && (
                        <Badge className="bg-slate-700/60 text-slate-300 border-slate-600 text-xs">
                          {stock.sector}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {latestSignal && (
                    <div className="text-right">
                      <p className="text-slate-400 text-xs mb-1">Latest signal</p>
                      <Badge
                        className={
                          latestSignal.type === "buy"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-sm font-bold uppercase px-3 py-1"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/30 text-sm font-bold uppercase px-3 py-1"
                        }
                      >
                        {latestSignal.type === "buy" ? (
                          <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 mr-1" />
                        )}
                        {latestSignal.type.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  {
                    label: "Signals (30d)",
                    value: signals.length,
                    icon: <BarChart3 className="h-4 w-4 text-cyan-400" />,
                  },
                  {
                    label: "Buy signals",
                    value: buyCount,
                    icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
                  },
                  {
                    label: "Sell signals",
                    value: sellCount,
                    icon: <TrendingDown className="h-4 w-4 text-rose-400" />,
                  },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    className="bg-slate-800/50 border-slate-700/60"
                  >
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        {stat.icon}
                        <span className="text-slate-400 text-xs">{stat.label}</span>
                      </div>
                      <p className="text-white text-xl font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Signal history */}
              <Card className="bg-slate-800/40 border-slate-700/60 mb-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Signal history — last 30 days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {signals.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>No signals in the last 30 days.</p>
                    </div>
                  ) : (
                    signals.map((signal) => (
                      <SignalRow
                        key={signal.id}
                        type={signal.type}
                        confidenceScore={signal.confidenceScore}
                        priceAtSignal={signal.priceAtSignal}
                        createdAt={signal.createdAt}
                        analysis={signal.analysis}
                        isLocked={!user && signal.confidenceScore > 60}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* SEO content block */}
              <Card className="bg-slate-800/20 border-slate-700/40 mb-8">
                <CardContent className="pt-5 pb-5">
                  <h2 className="text-white font-semibold mb-2 text-base">
                    About {ticker} AI signals
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Vortextrade generates AI-powered buy and sell signals for{" "}
                    {stock.name} ({ticker}) using technical analysis indicators
                    including RSI, MACD, Bollinger Bands, and volume patterns.
                    Signals are refreshed every 15 minutes during market hours.
                    Each signal includes a confidence score (0–100%) to help you
                    assess signal strength before acting.
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed mt-3">
                    To receive real-time alerts when a new {ticker} signal fires,{" "}
                    <a
                      href={getLoginUrl()}
                      className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                    >
                      sign up free
                    </a>{" "}
                    and add {ticker} to your watchlist. Free accounts receive up to
                    3 signals per day; Pro members receive unlimited signals with
                    instant push and email notifications.
                  </p>
                </CardContent>
              </Card>

              {/* CTA */}
              {!user && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
                  <h3 className="text-white font-bold text-lg mb-2">
                    Get real-time {ticker} alerts
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Sign up free to get instant alerts when a new {ticker} signal
                    fires — no credit card required.
                  </p>
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6"
                    onClick={() => { window.location.href = getLoginUrl(); }}
                  >
                    Start free
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
