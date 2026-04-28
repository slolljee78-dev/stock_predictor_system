export interface AutoTradingUniverseStock {
  ticker: string;
  name: string;
  type: string;
  exchange: string;
  sector: string;
}

export interface AutoTradingSignalSnapshot {
  ticker: string;
  name: string;
  sector: string;
  signalType: "buy" | "sell" | "hold";
  confidence: number;
  currentPrice: number;
  reasoning?: string;
}

export interface AutoTradingPositionSnapshot {
  ticker: string;
  quantity: number;
  averagePrice: number;
}

export interface AutoTradingPlanConfig {
  minConfidence: number;
  maxTradesPerRound: number;
  positionSizePercent: number;
  maxOpenPositions: number;
}

export interface PlannedAutoTrade {
  ticker: string;
  name: string;
  sector: string;
  type: "BUY" | "SELL";
  quantity: number;
  requestedPrice: number;
  confidence: number;
  reasoning: string;
}

export interface PlannedAutoTradingRound {
  actions: PlannedAutoTrade[];
  actionableSignals: AutoTradingSignalSnapshot[];
}

export const DEFAULT_AUTO_TRADING_UNIVERSE_SIZE = 12;
export const DEFAULT_AUTO_TRADING_MAX_TRADES_PER_ROUND = 2;
export const DEFAULT_AUTO_TRADING_MIN_CONFIDENCE = 70;
export const DEFAULT_AUTO_TRADING_POSITION_SIZE_PERCENT = 20;
export const DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS = 8;

export function selectAutoTradingUniverse(
  stocks: AutoTradingUniverseStock[],
  desiredSize: number = DEFAULT_AUTO_TRADING_UNIVERSE_SIZE,
  lockedTickers: string[] = [],
  randomSource: () => number = Math.random,
): AutoTradingUniverseStock[] {
  const normalizedDesiredSize = Math.max(1, Math.min(desiredSize, stocks.length));
  const byTicker = new Map(stocks.map((stock) => [stock.ticker.toUpperCase(), stock]));
  const lockedUniverse = lockedTickers
    .map((ticker) => byTicker.get(ticker.toUpperCase()))
    .filter((stock): stock is AutoTradingUniverseStock => Boolean(stock));

  if (lockedUniverse.length > 0) {
    return lockedUniverse.slice(0, normalizedDesiredSize);
  }

  const shuffled = [...stocks];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomSource() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, normalizedDesiredSize);
}

export function planAutoTradingRound(params: {
  signals: AutoTradingSignalSnapshot[];
  positions: AutoTradingPositionSnapshot[];
  cashBalance: number;
  config?: Partial<AutoTradingPlanConfig>;
}): PlannedAutoTradingRound {
  const config: AutoTradingPlanConfig = {
    minConfidence: params.config?.minConfidence ?? DEFAULT_AUTO_TRADING_MIN_CONFIDENCE,
    maxTradesPerRound: params.config?.maxTradesPerRound ?? DEFAULT_AUTO_TRADING_MAX_TRADES_PER_ROUND,
    positionSizePercent: params.config?.positionSizePercent ?? DEFAULT_AUTO_TRADING_POSITION_SIZE_PERCENT,
    maxOpenPositions: params.config?.maxOpenPositions ?? DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
  };

  const heldPositions = new Map(
    params.positions.map((position) => [position.ticker.toUpperCase(), position]),
  );

  const actionableSignals = params.signals.filter(
    (signal) => signal.confidence >= config.minConfidence && signal.signalType !== "hold" && signal.currentPrice > 0,
  );

  const actions: PlannedAutoTrade[] = [];

  const sellCandidates = actionableSignals
    .filter((signal) => signal.signalType === "sell" && heldPositions.has(signal.ticker.toUpperCase()))
    .sort((left, right) => right.confidence - left.confidence);

  let estimatedCash = params.cashBalance;
  let projectedOpenPositions = params.positions.length;

  for (const signal of sellCandidates) {
    if (actions.length >= config.maxTradesPerRound) {
      break;
    }

    const heldPosition = heldPositions.get(signal.ticker.toUpperCase());
    if (!heldPosition || heldPosition.quantity <= 0) {
      continue;
    }

    actions.push({
      ticker: signal.ticker,
      name: signal.name,
      sector: signal.sector,
      type: "SELL",
      quantity: heldPosition.quantity,
      requestedPrice: signal.currentPrice,
      confidence: signal.confidence,
      reasoning: signal.reasoning ?? `Auto-exit triggered by a ${signal.confidence}% sell signal.`,
    });

    estimatedCash += heldPosition.quantity * signal.currentPrice;
    projectedOpenPositions = Math.max(0, projectedOpenPositions - 1);
    heldPositions.delete(signal.ticker.toUpperCase());
  }

  const buyCandidates = actionableSignals
    .filter((signal) => signal.signalType === "buy" && !heldPositions.has(signal.ticker.toUpperCase()))
    .sort((left, right) => right.confidence - left.confidence);

  for (const signal of buyCandidates) {
    if (actions.length >= config.maxTradesPerRound || projectedOpenPositions >= config.maxOpenPositions) {
      break;
    }

    const targetAllocation = estimatedCash * (config.positionSizePercent / 100);
    const quantity = Math.floor(targetAllocation / signal.currentPrice);

    if (quantity <= 0) {
      continue;
    }

    actions.push({
      ticker: signal.ticker,
      name: signal.name,
      sector: signal.sector,
      type: "BUY",
      quantity,
      requestedPrice: signal.currentPrice,
      confidence: signal.confidence,
      reasoning: signal.reasoning ?? `Auto-entry triggered by a ${signal.confidence}% buy signal.`,
    });

    estimatedCash -= quantity * signal.currentPrice;
    projectedOpenPositions += 1;
    heldPositions.set(signal.ticker.toUpperCase(), {
      ticker: signal.ticker,
      quantity,
      averagePrice: signal.currentPrice,
    });
  }

  return {
    actions,
    actionableSignals,
  };
}
