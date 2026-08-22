import { executeLiveTradeWithMarketPrice } from "./liveSimulator";
import { fetchMultipleMarketData } from "./realtimeMarketData";
import { generateRealtimeSignal } from "./realtimeSignalGenerator";
import { getTradingStocks } from "./stockDataFetcher";
import {
  DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
  DEFAULT_AUTO_TRADING_MAX_TRADES_PER_ROUND,
  DEFAULT_AUTO_TRADING_MIN_CONFIDENCE,
  DEFAULT_AUTO_TRADING_POSITION_SIZE_PERCENT,
  DEFAULT_AUTO_TRADING_UNIVERSE_SIZE,
  planAutoTradingRound,
  selectAutoTradingUniverse,
} from "./simulatorAutoTrading";

export interface AutoTradingRoundPosition {
  ticker: string;
  quantity: number;
  averagePrice: number;
}

export interface ExecutedAutoTrade {
  ticker: string;
  name: string;
  sector: string;
  type: "BUY" | "SELL";
  quantity: number;
  requestedPrice: number;
  executedPrice: number;
  executionTime: string;
  slippage: number;
  commission: number;
  totalCost: number;
  priceSource: "live" | "fallback";
  confidence: number;
  reasoning: string;
}

export interface AutoTradingRoundResponse {
  runAt: string;
  selectedUniverse: Array<{
    ticker: string;
    name: string;
    sector: string;
    exchange: string;
    type: string;
  }>;
  scannedCount: number;
  scannedTickers: string[];
  nextScanOffset: number;
  actionableSignals: Array<{
    ticker: string;
    name: string;
    sector: string;
    signalType: "buy" | "sell" | "hold";
    confidence: number;
    currentPrice: number;
    reasoning?: string;
  }>;
  diagnostics: {
    marketDataAvailable: number;
    marketDataUnavailable: number;
    directionalSignals: number;
    holdSignals: number;
    belowConfidenceSignals: number;
    requiredConfidence: number;
    closestSignal: {
      ticker: string;
      signalType: "buy" | "sell" | "hold";
      confidence: number;
      reasoning?: string;
    } | null;
  };
  executedTrades: ExecutedAutoTrade[];
}

export async function executeAutoTradingRound(input: {
  positions: AutoTradingRoundPosition[];
  cashBalance: number;
  desiredUniverseSize?: number;
  universeTickers?: string[];
  minConfidence?: number;
  maxTradesPerRound?: number;
  positionSizePercent?: number;
  maxOpenPositions?: number;
  scanBatchSize?: number;
  scanOffset?: number;
  slippagePercent?: number;
  commissionPercent?: number;
}): Promise<AutoTradingRoundResponse> {
  const stocks = getTradingStocks();
  const desiredUniverseSize = typeof input.desiredUniverseSize === "number"
    ? input.desiredUniverseSize
    : DEFAULT_AUTO_TRADING_UNIVERSE_SIZE;

  const selectedUniverse = selectAutoTradingUniverse(
    stocks,
    desiredUniverseSize,
    Array.isArray(input.universeTickers) ? input.universeTickers : [],
  );

  const positions = Array.isArray(input.positions) ? input.positions : [];
  const scanBatchSize = typeof input.scanBatchSize === "number"
    ? Math.max(1, Math.min(input.scanBatchSize, selectedUniverse.length || 1))
    : Math.min(4, selectedUniverse.length || 1);
  const scanOffset = typeof input.scanOffset === "number" ? input.scanOffset : 0;
  const scanTargets = selectedUniverse.length > 0
    ? Array.from({ length: scanBatchSize }, (_, index) => selectedUniverse[(scanOffset + index) % selectedUniverse.length])
    : [];
  const trackedTickers = Array.from(new Set([
    ...scanTargets.map((stock) => stock.ticker),
    ...positions.map((position) => position.ticker),
  ]));

  const marketDataMap = await fetchMultipleMarketData(trackedTickers);
  const universeByTicker = new Map(selectedUniverse.map((stock) => [stock.ticker.toUpperCase(), stock]));

  const signals = trackedTickers.flatMap((ticker) => {
    const marketData = marketDataMap.get(ticker);
    if (!marketData) {
      return [];
    }

    const stock = universeByTicker.get(ticker.toUpperCase()) ?? stocks.find((item) => item.ticker === ticker);
    const signal = generateRealtimeSignal(marketData);

    return [{
      ticker,
      name: stock?.name ?? ticker,
      sector: stock?.sector ?? "Unknown",
      signalType: signal.signalType,
      confidence: signal.confidence,
      currentPrice: marketData.price.close,
      reasoning: signal.reasoning,
    }];
  });

  const plannedRound = planAutoTradingRound({
    signals,
    positions,
    cashBalance: typeof input.cashBalance === "number" ? input.cashBalance : 0,
    config: {
      minConfidence: typeof input.minConfidence === "number" ? input.minConfidence : DEFAULT_AUTO_TRADING_MIN_CONFIDENCE,
      maxTradesPerRound: typeof input.maxTradesPerRound === "number" ? input.maxTradesPerRound : DEFAULT_AUTO_TRADING_MAX_TRADES_PER_ROUND,
      positionSizePercent: typeof input.positionSizePercent === "number" ? input.positionSizePercent : DEFAULT_AUTO_TRADING_POSITION_SIZE_PERCENT,
      maxOpenPositions: typeof input.maxOpenPositions === "number" ? input.maxOpenPositions : DEFAULT_AUTO_TRADING_MAX_OPEN_POSITIONS,
    },
  });

  const requiredConfidence = typeof input.minConfidence === "number"
    ? input.minConfidence
    : DEFAULT_AUTO_TRADING_MIN_CONFIDENCE;
  const directionalSignals = signals.filter((signal) => signal.signalType !== "hold");
  const closestSignal = [...directionalSignals]
    .sort((left, right) => right.confidence - left.confidence)[0]
    ?? [...signals].sort((left, right) => right.confidence - left.confidence)[0]
    ?? null;

  const executedTrades: ExecutedAutoTrade[] = [];

  for (const action of plannedRound.actions) {
    const execution = await executeLiveTradeWithMarketPrice(
      action.ticker,
      action.type,
      action.quantity,
      action.requestedPrice,
      typeof input.slippagePercent === "number" ? input.slippagePercent : 0.05,
      typeof input.commissionPercent === "number" ? input.commissionPercent : 0.1,
    );

    if (!execution.success) {
      continue;
    }

    executedTrades.push({
      ticker: action.ticker,
      name: action.name,
      sector: action.sector,
      type: action.type,
      quantity: action.quantity,
      requestedPrice: execution.requestedPrice,
      executedPrice: execution.executedPrice,
      executionTime: execution.executionTime,
      slippage: execution.slippage,
      commission: execution.commission,
      totalCost: execution.totalCost,
      priceSource: execution.priceSource,
      confidence: action.confidence,
      reasoning: action.reasoning,
    });
  }

  return {
    runAt: new Date().toISOString(),
    selectedUniverse,
    scannedCount: trackedTickers.length,
    scannedTickers: trackedTickers,
    nextScanOffset: selectedUniverse.length > 0 ? (scanOffset + scanBatchSize) % selectedUniverse.length : 0,
    actionableSignals: plannedRound.actionableSignals,
    diagnostics: {
      marketDataAvailable: signals.length,
      marketDataUnavailable: Math.max(0, trackedTickers.length - signals.length),
      directionalSignals: directionalSignals.length,
      holdSignals: signals.filter((signal) => signal.signalType === "hold").length,
      belowConfidenceSignals: directionalSignals.filter((signal) => signal.confidence < requiredConfidence).length,
      requiredConfidence,
      closestSignal: closestSignal
        ? {
            ticker: closestSignal.ticker,
            signalType: closestSignal.signalType,
            confidence: closestSignal.confidence,
            reasoning: closestSignal.reasoning,
          }
        : null,
    },
    executedTrades,
  };
}
