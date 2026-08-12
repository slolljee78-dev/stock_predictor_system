import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Zap, Bell, BarChart2, Play, Pause, ChevronRight } from "lucide-react";

type ShowcaseScreen = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  content: React.ReactNode;
};

function SignalEngineScreen() {
  const [active, setActive] = useState(0);
  const stocks = ["AAPL", "NVDA", "TSLA", "AMZN", "MSFT"];
  const signals = [
    { type: "BUY", conf: 87, rsi: 42, macd: "bullish" },
    { type: "BUY", conf: 79, rsi: 38, macd: "bullish" },
    { type: "SELL", conf: 72, rsi: 68, macd: "bearish" },
    { type: "BUY", conf: 65, rsi: 44, macd: "neutral" },
    { type: "SELL", conf: 61, rsi: 71, macd: "bearish" },
  ];

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % stocks.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      {/* Timer selector */}
      <div className="flex gap-2 mb-4">
        {["1 Day", "3 Days", "7 Days"].map((t, i) => (
          <button
            key={t}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              i === 1
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Stock list */}
      <div className="space-y-2">
        {stocks.map((ticker, i) => {
          const sig = signals[i];
          const isBuy = sig.type === "BUY";
          return (
            <div
              key={ticker}
              className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-500 ${
                i === active
                  ? "bg-primary/15 border border-primary/30 scale-[1.02]"
                  : "bg-white/5 border border-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {isBuy ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{ticker}</p>
                  <p className="text-xs text-muted-foreground">RSI {sig.rsi} · MACD {sig.macd}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {sig.type}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{sig.conf}% conf</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Auto-trade CTA */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-primary/20 to-cyan-500/10 border border-primary/20 p-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary">Signal Engine Active</p>
          <p className="text-xs text-muted-foreground">Auto-trading 5 stocks · 3-day run</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-semibold">LIVE</span>
        </div>
      </div>
    </div>
  );
}

function SignalsDashboardScreen() {
  const signals = [
    { ticker: "NVDA", type: "BUY", conf: 87, price: "£124.50", change: "+2.3%" },
    { ticker: "AAPL", type: "BUY", conf: 79, price: "£218.90", change: "+1.1%" },
    { ticker: "TSLA", type: "SELL", conf: 72, price: "£248.20", change: "-1.8%" },
    { ticker: "MSFT", type: "BUY", conf: 68, price: "£415.30", change: "+0.7%" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Top Signals</p>
        <span className="text-xs text-primary font-semibold">4 active</span>
      </div>
      {signals.map((s) => {
        const isBuy = s.type === "BUY";
        return (
          <div key={s.ticker} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:bg-white/8 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {s.ticker.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold">{s.ticker}</p>
                <p className="text-xs text-muted-foreground">{s.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-xs font-bold ${isBuy ? "text-emerald-400" : "text-red-400"}`}>{s.type}</p>
                <p className="text-xs text-muted-foreground">{s.conf}%</p>
              </div>
              <span className={`text-xs font-semibold ${s.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{s.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimulatorScreen() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 2)), 80);
    return () => clearInterval(t);
  }, []);

  const pnl = ((progress / 100) * 1240).toFixed(0);
  const winRate = Math.min(65, 45 + Math.floor(progress / 5));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">+£{pnl}</p>
          <p className="text-xs text-muted-foreground mt-1">Paper P&L</p>
        </div>
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{winRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
        </div>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>3-day run progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div><p className="font-bold text-foreground">8</p><p className="text-muted-foreground">Trades</p></div>
          <div><p className="font-bold text-emerald-400">5W</p><p className="text-muted-foreground">Wins</p></div>
          <div><p className="font-bold text-red-400">3L</p><p className="text-muted-foreground">Losses</p></div>
        </div>
      </div>
    </div>
  );
}

function AlertsScreen() {
  const alerts = [
    { ticker: "NVDA", msg: "RSI crossed below 40 — buy signal triggered", time: "2 min ago", type: "buy" },
    { ticker: "TSLA", msg: "Price target reached — sell signal active", time: "18 min ago", type: "sell" },
    { ticker: "AAPL", msg: "MACD bullish crossover detected", time: "1 hr ago", type: "buy" },
    { ticker: "AMZN", msg: "Confidence score moved to 78% (was 61%)", time: "2 hr ago", type: "info" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Alerts</p>
        <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">4</span>
      </div>
      {alerts.map((a) => (
        <div key={a.ticker + a.time} className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3">
          <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${a.type === "buy" ? "bg-emerald-400" : a.type === "sell" ? "bg-red-400" : "bg-primary"}`} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">{a.ticker}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.msg}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const screens: ShowcaseScreen[] = [
  {
    id: "engine",
    label: "Signal Engine",
    icon: Zap,
    description: "Set the engine to auto-trade a basket of stocks for 1, 3, or 7 days. Walk away and come back to results.",
    content: <SignalEngineScreen />,
  },
  {
    id: "signals",
    label: "Live Signals",
    icon: TrendingUp,
    description: "Today's top buy and sell signals ranked by AI confidence score. Know exactly which setups to review first.",
    content: <SignalsDashboardScreen />,
  },
  {
    id: "simulator",
    label: "Simulator",
    icon: BarChart2,
    description: "Paper-trade any signal with £10,000 virtual capital. Validate your thesis before committing real money.",
    content: <SimulatorScreen />,
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: Bell,
    description: "Get notified the moment a signal triggers on any stock in your watchlist. Never miss a setup again.",
    content: <AlertsScreen />,
  },
];

export function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setActive((p) => (p + 1) % screens.length), 4000);
    return () => clearInterval(t);
  }, [playing]);

  const screen = screens[active];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border/50 bg-black/20 px-2 pt-2">
        {screens.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => { setActive(i); setPlaying(false); }}
              className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                i === active
                  ? "bg-card text-foreground border border-b-0 border-border/50 -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 pr-3 pb-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="hidden sm:inline">{playing ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Description */}
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <screen.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{screen.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{screen.description}</p>
          </div>
        </div>

        {/* Animated screen content */}
        <div key={screen.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {screen.content}
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {screens.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setPlaying(false); }}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-1.5 bg-white/20"}`}
              />
            ))}
          </div>
          <button
            onClick={() => { setActive((active + 1) % screens.length); setPlaying(false); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Next <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
