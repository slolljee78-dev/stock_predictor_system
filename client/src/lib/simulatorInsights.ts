import type { SimulatorPortfolio, SimulatorTrade } from "./tradingSimulatorState";

export type SimulatorTradeOrigin = "manual" | "auto";
export type SimulatorRiskProfileId = "conservative" | "balanced" | "aggressive";
export type TradeHistoryFilter = "all" | SimulatorTradeOrigin;

export interface SimulatorRiskProfile {
  id: SimulatorRiskProfileId;
  label: string;
  description: string;
  minConfidence: number;
  maxTradesPerRound: number;
  positionSizePercent: number;
  intervalSeconds: number;
}

export interface ClosedTradeInsight {
  ticker: string;
  origin: SimulatorTradeOrigin;
  quantity: number;
  realizedPnL: number;
  openedAt?: string;
  closedAt?: string;
  holdingMinutes: number | null;
}

export interface SimulatorPerformanceSummary {
  totalTrades: number;
  manualTrades: number;
  autoTrades: number;
  closedTrades: number;
  winningTrades: number;
  winRate: number;
  realizedPnL: number;
  unrealizedPnL: number;
  averageHoldingMinutes: number | null;
  bestTrade: ClosedTradeInsight | null;
  worstTrade: ClosedTradeInsight | null;
}

export const SIMULATOR_RISK_PROFILES: Record<SimulatorRiskProfileId, SimulatorRiskProfile> = {
  conservative: {
    id: "conservative",
    label: "Conservative",
    description: "Higher conviction, smaller sizing, and slower auto-runs for steadier paper trading.",
    minConfidence: 82,
    maxTradesPerRound: 1,
    positionSizePercent: 12,
    intervalSeconds: 120,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    description: "A middle ground between selectivity, activity, and position size.",
    minConfidence: 72,
    maxTradesPerRound: 2,
    positionSizePercent: 18,
    intervalSeconds: 60,
  },
  aggressive: {
    id: "aggressive",
    label: "Aggressive",
    description: "Lower threshold, more trades, and larger position sizes for faster experimentation.",
    minConfidence: 64,
    maxTradesPerRound: 3,
    positionSizePercent: 26,
    intervalSeconds: 30,
  },
};

function parseTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTradeOrigin(trade: SimulatorTrade): SimulatorTradeOrigin {
  return trade.origin === "auto" ? "auto" : "manual";
}

export function getRiskProfile(profileId: SimulatorRiskProfileId): SimulatorRiskProfile {
  return SIMULATOR_RISK_PROFILES[profileId] ?? SIMULATOR_RISK_PROFILES.balanced;
}

export function filterTradesByOrigin(trades: SimulatorTrade[], filter: TradeHistoryFilter): SimulatorTrade[] {
  if (filter === "all") {
    return trades;
  }

  return trades.filter((trade) => getTradeOrigin(trade) === filter);
}

export function calculateSimulatorPerformanceSummary(portfolio: SimulatorPortfolio): SimulatorPerformanceSummary {
  const chronologicalTrades = [...portfolio.trades]
    .map((trade, index) => ({ trade, index }))
    .sort((left, right) => {
      const leftTimestamp = parseTimestamp(left.trade.executedAt)?.getTime() ?? 0;
      const rightTimestamp = parseTimestamp(right.trade.executedAt)?.getTime() ?? 0;
      if (leftTimestamp === rightTimestamp) {
        return left.index - right.index;
      }
      return leftTimestamp - rightTimestamp;
    })
    .map((entry) => entry.trade);

  const openLots = new Map<string, Array<{ quantity: number; price: number; openedAt?: string; origin: SimulatorTradeOrigin }>>();
  const closedTrades: ClosedTradeInsight[] = [];

  for (const trade of chronologicalTrades) {
    const origin = getTradeOrigin(trade);
    const tickerLots = openLots.get(trade.ticker) ?? [];

    if (trade.type === "buy") {
      tickerLots.push({
        quantity: trade.quantity,
        price: trade.price,
        openedAt: trade.executedAt,
        origin,
      });
      openLots.set(trade.ticker, tickerLots);
      continue;
    }

    let remainingQuantity = trade.quantity;
    while (remainingQuantity > 0 && tickerLots.length > 0) {
      const lot = tickerLots[0];
      const matchedQuantity = Math.min(remainingQuantity, lot.quantity);
      const realizedPnL = (trade.price - lot.price) * matchedQuantity;
      const openedAt = parseTimestamp(lot.openedAt);
      const closedAt = parseTimestamp(trade.executedAt);
      const holdingMinutes = openedAt && closedAt
        ? Math.max(0, Math.round((closedAt.getTime() - openedAt.getTime()) / 60000))
        : null;

      closedTrades.push({
        ticker: trade.ticker,
        origin,
        quantity: matchedQuantity,
        realizedPnL,
        openedAt: lot.openedAt,
        closedAt: trade.executedAt,
        holdingMinutes,
      });

      lot.quantity -= matchedQuantity;
      remainingQuantity -= matchedQuantity;

      if (lot.quantity <= 0) {
        tickerLots.shift();
      }
    }

    if (tickerLots.length > 0) {
      openLots.set(trade.ticker, tickerLots);
    } else {
      openLots.delete(trade.ticker);
    }
  }

  const realizedPnL = closedTrades.reduce((sum, trade) => sum + trade.realizedPnL, 0);
  const unrealizedPnL = portfolio.positions.reduce((sum, position) => sum + position.unrealizedPnL, 0);
  const winningTrades = closedTrades.filter((trade) => trade.realizedPnL > 0).length;
  const averageHoldingMinutes = closedTrades.length > 0
    ? Math.round(
        closedTrades
          .filter((trade) => trade.holdingMinutes !== null)
          .reduce((sum, trade) => sum + (trade.holdingMinutes ?? 0), 0) /
          Math.max(1, closedTrades.filter((trade) => trade.holdingMinutes !== null).length)
      )
    : null;

  const sortedClosedTrades = [...closedTrades].sort((left, right) => right.realizedPnL - left.realizedPnL);

  return {
    totalTrades: portfolio.trades.length,
    manualTrades: portfolio.trades.filter((trade) => getTradeOrigin(trade) === "manual").length,
    autoTrades: portfolio.trades.filter((trade) => getTradeOrigin(trade) === "auto").length,
    closedTrades: closedTrades.length,
    winningTrades,
    winRate: closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0,
    realizedPnL,
    unrealizedPnL,
    averageHoldingMinutes,
    bestTrade: sortedClosedTrades[0] ?? null,
    worstTrade: sortedClosedTrades.length > 0 ? sortedClosedTrades[sortedClosedTrades.length - 1] : null,
  };
}

export function formatHoldingTime(value: number | null): string {
  if (value === null) {
    return "Not enough closed trades yet";
  }

  if (value < 60) {
    return `${value}m average hold`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (minutes === 0) {
    return `${hours}h average hold`;
  }

  return `${hours}h ${minutes}m average hold`;
}
