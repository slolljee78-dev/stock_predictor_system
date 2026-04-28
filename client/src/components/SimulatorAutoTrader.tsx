import { useEffect, useMemo, useState } from "react";
import { Bot, Pause, Play, RefreshCw, Shuffle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AutoExecutedTrade } from "@/lib/simulatorAutoTrading";
import { getRiskProfile, SIMULATOR_RISK_PROFILES, type SimulatorRiskProfileId } from "@/lib/simulatorInsights";
import { trpc } from "@/lib/trpc";
import type { SimulatorPortfolio } from "@/lib/tradingSimulatorState";

interface UniverseStock {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  type: string;
}

interface ActionableSignal {
  ticker: string;
  name: string;
  sector: string;
  signalType: "buy" | "sell" | "hold";
  confidence: number;
  currentPrice: number;
  reasoning?: string;
}

interface AutoTradingRoundResponse {
  runAt: string;
  selectedUniverse: UniverseStock[];
  scannedCount: number;
  scannedTickers: string[];
  nextScanOffset: number;
  actionableSignals: ActionableSignal[];
  executedTrades: AutoExecutedTrade[];
}

interface SimulatorAutoTraderProps {
  portfolio: SimulatorPortfolio;
  onApplyTrades: (trades: AutoExecutedTrade[], summaryMessage: string) => void;
}

const DEFAULT_INTERVAL_SECONDS = 60;
const DEFAULT_RISK_PROFILE: SimulatorRiskProfileId = "balanced";

function formatLastRun(value: string | null) {
  if (!value) {
    return "No automated round has run yet";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "No automated round has run yet";
  }

  return `Last run ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function SimulatorAutoTrader({ portfolio, onApplyTrades }: SimulatorAutoTraderProps) {
  const universeQuery = trpc.simulator.getAutoTradingUniverse.useQuery();
  const autoRoundMutation = trpc.simulator.runAutoTradingRound.useMutation();

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [riskProfileId, setRiskProfileId] = useState<SimulatorRiskProfileId>(DEFAULT_RISK_PROFILE);
  const [universeSize, setUniverseSize] = useState(12);
  const [minConfidence, setMinConfidence] = useState(70);
  const [maxTradesPerRound, setMaxTradesPerRound] = useState(2);
  const [positionSizePercent, setPositionSizePercent] = useState(20);
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_INTERVAL_SECONDS);
  const [selectedUniverse, setSelectedUniverse] = useState<UniverseStock[]>([]);
  const [scanOffset, setScanOffset] = useState(0);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [lastRound, setLastRound] = useState<AutoTradingRoundResponse | null>(null);

  const activeRiskProfile = getRiskProfile(riskProfileId);

  useEffect(() => {
    const profile = getRiskProfile(riskProfileId);
    setMinConfidence(profile.minConfidence);
    setMaxTradesPerRound(profile.maxTradesPerRound);
    setPositionSizePercent(profile.positionSizePercent);
    setIntervalSeconds(profile.intervalSeconds);
  }, [riskProfileId]);

  const positionSnapshot = useMemo(
    () => portfolio.positions.map((position) => ({
      ticker: position.ticker,
      quantity: position.quantity,
      averagePrice: position.entryPrice,
    })),
    [portfolio.positions],
  );

  const runRound = async (reshuffle: boolean = false) => {
    const response = await autoRoundMutation.mutateAsync({
      positions: positionSnapshot,
      cashBalance: portfolio.cash,
      desiredUniverseSize: universeSize,
      universeTickers: reshuffle ? [] : selectedUniverse.map((stock) => stock.ticker),
      minConfidence,
      maxTradesPerRound,
      positionSizePercent,
      maxOpenPositions: 8,
      scanBatchSize: 4,
      scanOffset: reshuffle ? 0 : scanOffset,
    }) as AutoTradingRoundResponse;

    setSelectedUniverse(response.selectedUniverse);
    setScanOffset(response.nextScanOffset);
    setLastRunAt(response.runAt);
    setLastRound(response);

    const buyCount = response.executedTrades.filter((trade) => trade.type === "BUY").length;
    const sellCount = response.executedTrades.filter((trade) => trade.type === "SELL").length;
    const summaryMessage = response.executedTrades.length > 0
      ? `Auto trader executed ${response.executedTrades.length} virtual trade${response.executedTrades.length === 1 ? "" : "s"} across ${response.scannedCount} scanned stocks (${buyCount} buys, ${sellCount} sells).`
      : `Auto trader scanned ${response.scannedCount} stocks and found no trade that met the current confidence and sizing rules.`;

    if (response.executedTrades.length > 0) {
      onApplyTrades(
        response.executedTrades.map((trade) => ({
          ...trade,
          origin: "auto",
          riskProfile: riskProfileId,
        })),
        summaryMessage,
      );
    }
  };

  useEffect(() => {
    if (!autoEnabled) {
      return;
    }

    const timer = window.setInterval(() => {
      void runRound();
    }, Math.max(15, intervalSeconds) * 1000);

    return () => window.clearInterval(timer);
  }, [
    autoEnabled,
    intervalSeconds,
    maxTradesPerRound,
    minConfidence,
    onApplyTrades,
    portfolio.cash,
    positionSizePercent,
    positionSnapshot,
    selectedUniverse,
    universeSize,
  ]);

  const actionableSignals = lastRound?.actionableSignals ?? [];
  const selectedUniverseText = selectedUniverse.length > 0
    ? `${selectedUniverse.length} stocks in the current random basket`
    : "A random basket will be chosen on the first run";

  return (
    <Card className="premium-card border-0 bg-transparent shadow-none lg:col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Auto Trader</CardTitle>
              <Badge variant="secondary" className="uppercase tracking-[0.2em] text-[11px]">
                beta
              </Badge>
            </div>
            <CardDescription>
              Let the simulator scan a broader random stock basket, then open or close virtual positions from live buy and sell signals while keeping the manual simulator available.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoEnabled ? "secondary" : "default"}
              onClick={async () => {
                if (autoEnabled) {
                  setAutoEnabled(false);
                  return;
                }
                setAutoEnabled(true);
                await runRound();
              }}
              disabled={autoRoundMutation.isPending}
            >
              {autoEnabled ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {autoEnabled ? "Stop auto mode" : "Start auto mode"}
            </Button>
            <Button
              variant="outline"
              onClick={() => void runRound()}
              disabled={autoRoundMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${autoRoundMutation.isPending ? "animate-spin" : ""}`} />
              Run now
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Risk profile</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.values(SIMULATOR_RISK_PROFILES).map((profile) => (
                <Button
                  key={profile.id}
                  type="button"
                  variant={profile.id === riskProfileId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRiskProfileId(profile.id)}
                  className="rounded-full"
                >
                  {profile.label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{activeRiskProfile.description}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium">Random basket size</label>
            <Input
              className="mt-1"
              type="number"
              min={6}
              max={25}
              value={universeSize}
              onChange={(event) => setUniverseSize(Number(event.target.value) || 12)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Min confidence %</label>
            <Input
              className="mt-1"
              type="number"
              min={60}
              max={95}
              value={minConfidence}
              onChange={(event) => setMinConfidence(Number(event.target.value) || 70)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max trades / round</label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              max={5}
              value={maxTradesPerRound}
              onChange={(event) => setMaxTradesPerRound(Number(event.target.value) || 2)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Position size %</label>
            <Input
              className="mt-1"
              type="number"
              min={5}
              max={40}
              value={positionSizePercent}
              onChange={(event) => setPositionSizePercent(Number(event.target.value) || 20)}
            />
          </div>
        </div>

        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="text-sm font-medium">Auto-run interval (seconds)</label>
            <Input
              className="mt-1"
              type="number"
              min={15}
              max={300}
              step={15}
              value={intervalSeconds}
              onChange={(event) => setIntervalSeconds(Number(event.target.value) || DEFAULT_INTERVAL_SECONDS)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void runRound(true)}
            disabled={autoRoundMutation.isPending}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            New random basket
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{selectedUniverseText}</p>
              <p className="text-sm text-muted-foreground">{formatLastRun(lastRunAt)}</p>
              <p className="text-xs text-muted-foreground">Each round scans a rotating batch so the basket can be larger without overwhelming the live market-data providers.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4" />
              {autoEnabled ? "Auto mode is actively scanning" : "Auto mode is idle"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedUniverse.length === 0 ? (
              <p className="text-sm text-muted-foreground">Run the auto trader to pick a fresh basket of companies from the broader universe.</p>
            ) : (
              selectedUniverse.map((stock) => (
                <Badge key={stock.ticker} variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                  {stock.ticker}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Universe available</p>
            <p className="mt-2 text-2xl font-semibold">{universeQuery.data?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Tradable companies and ETFs in the expanded simulator pool</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Actionable signals</p>
            <p className="mt-2 text-2xl font-semibold">{actionableSignals.length}</p>
            <p className="text-sm text-muted-foreground">Signals above your current confidence threshold in the latest scan</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Latest round</p>
            <p className="mt-2 text-2xl font-semibold">{lastRound?.executedTrades.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Virtual trades executed in the most recent automated pass</p>
            {lastRound?.scannedTickers?.length ? (
              <p className="mt-2 text-xs text-muted-foreground">Scanned now: {lastRound.scannedTickers.join(", ")}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <p className="font-medium">Latest high-conviction signals</p>
          </div>
          {actionableSignals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No buy or sell signals have crossed the current threshold yet.</p>
          ) : (
            <div className="space-y-2">
              {actionableSignals.slice(0, 6).map((signal) => (
                <div key={`${signal.ticker}-${signal.signalType}`} className="flex items-center justify-between gap-4 rounded-xl bg-secondary/30 px-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{signal.ticker}</p>
                    <p className="text-sm text-muted-foreground truncate">{signal.reasoning ?? `${signal.name} is showing a ${signal.signalType} setup.`}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={signal.signalType === "buy" ? "default" : "secondary"}>
                      {signal.signalType.toUpperCase()}
                    </Badge>
                    <p className="mt-2 text-sm text-muted-foreground">{signal.confidence}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
