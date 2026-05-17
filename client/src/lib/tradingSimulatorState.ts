export type TradePriceSource = "live" | "fallback";

export interface PendingOrder {
  id: number;
  ticker: string;
  type: "buy" | "sell";
  orderType: "limit" | "stop-loss";
  quantity: number;
  limitPrice?: number; // For limit orders
  stopPrice?: number; // For stop-loss orders
  createdAt: string;
  status: "pending" | "cancelled";
}

export interface SimulatorPosition {
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface SimulatorTrade {
  id: number;
  ticker: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  executedAt?: string;
  priceSource: TradePriceSource;
  origin?: "manual" | "auto";
  confidence?: number;
  reasoning?: string;
  riskProfile?: "conservative" | "balanced" | "aggressive";
  orderType?: "market" | "limit" | "stop-loss"; // market (default), limit (buy/sell at or better price), stop-loss (sell if price drops below)
  limitPrice?: number; // For limit orders: buy at or below this price, sell at or above
  stopPrice?: number; // For stop-loss orders: trigger price to sell
  status?: "pending" | "filled" | "cancelled"; // pending for limit/stop orders waiting to execute
}

export interface SimulatorPortfolio {
  id: number;
  name: string;
  initialCapital: number;
  currentValue: number;
  cash: number;
  totalReturn: number;
  totalReturnPercent: number;
  positions: SimulatorPosition[];
  trades: SimulatorTrade[];
  pendingOrders?: PendingOrder[]; // Limit and stop-loss orders waiting to execute
}

export interface TradingSimulatorState {
  portfolios: SimulatorPortfolio[];
  selectedPortfolioId: number;
}

export const TRADING_SIMULATOR_STORAGE_KEY = "stock-predictor-trading-simulator-state";

const DEFAULT_PORTFOLIOS: SimulatorPortfolio[] = [
  {
    id: 1,
    name: "Core Strategy",
    initialCapital: 10000,
    currentValue: 11247,
    cash: 5000,
    totalReturn: 1247,
    totalReturnPercent: 12.47,
    positions: [
      {
        ticker: "AAPL",
        quantity: 10,
        entryPrice: 180.5,
        currentPrice: 185.2,
        unrealizedPnL: 47,
        unrealizedPnLPercent: 2.6,
      },
      {
        ticker: "NVDA",
        quantity: 5,
        entryPrice: 890,
        currentPrice: 892.5,
        unrealizedPnL: 12.5,
        unrealizedPnLPercent: 0.28,
      },
    ],
    trades: [
      {
        id: 1,
        ticker: "AAPL",
        type: "buy",
        quantity: 10,
        price: 180.5,
        date: "2026-04-11 09:30",
        executedAt: "2026-04-11T09:30:00.000Z",
        priceSource: "live",
        origin: "manual",
      },
      {
        id: 2,
        ticker: "NVDA",
        type: "buy",
        quantity: 5,
        price: 890,
        date: "2026-04-11 10:15",
        executedAt: "2026-04-11T10:15:00.000Z",
        priceSource: "live",
        origin: "manual",
      },
    ],
  },
];

export function createEmptyPortfolio(id: number, name: string, initialCapital: number = 10000): SimulatorPortfolio {
  return {
    id,
    name,
    initialCapital,
    currentValue: initialCapital,
    cash: initialCapital,
    totalReturn: 0,
    totalReturnPercent: 0,
    positions: [],
    trades: [],
  };
}

export function createDefaultTradingSimulatorState(): TradingSimulatorState {
  return {
    portfolios: DEFAULT_PORTFOLIOS.map((portfolio) => ({
      ...portfolio,
      positions: portfolio.positions.map((position) => ({ ...position })),
      trades: portfolio.trades.map((trade) => ({ ...trade })),
    })),
    selectedPortfolioId: DEFAULT_PORTFOLIOS[0].id,
  };
}

function isPosition(value: unknown): value is SimulatorPosition {
  return typeof value === "object" && value !== null &&
    typeof (value as SimulatorPosition).ticker === "string" &&
    typeof (value as SimulatorPosition).quantity === "number" &&
    typeof (value as SimulatorPosition).entryPrice === "number" &&
    typeof (value as SimulatorPosition).currentPrice === "number" &&
    typeof (value as SimulatorPosition).unrealizedPnL === "number" &&
    typeof (value as SimulatorPosition).unrealizedPnLPercent === "number";
}

function normalizeTrade(value: unknown): SimulatorTrade | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const trade = value as Partial<SimulatorTrade>;
  if (
    typeof trade.id !== "number" ||
    typeof trade.ticker !== "string" ||
    (trade.type !== "buy" && trade.type !== "sell") ||
    typeof trade.quantity !== "number" ||
    typeof trade.price !== "number" ||
    typeof trade.date !== "string" ||
    (trade.priceSource !== "live" && trade.priceSource !== "fallback")
  ) {
    return null;
  }

  return {
    id: trade.id,
    ticker: trade.ticker,
    type: trade.type,
    quantity: trade.quantity,
    price: trade.price,
    date: trade.date,
    executedAt: typeof trade.executedAt === "string" ? trade.executedAt : undefined,
    priceSource: trade.priceSource,
    origin: trade.origin === "auto" ? "auto" : "manual",
    confidence: typeof trade.confidence === "number" ? trade.confidence : undefined,
    reasoning: typeof trade.reasoning === "string" ? trade.reasoning : undefined,
    riskProfile:
      trade.riskProfile === "conservative" || trade.riskProfile === "balanced" || trade.riskProfile === "aggressive"
        ? trade.riskProfile
        : undefined,
  };
}

function isPortfolio(value: unknown): value is SimulatorPortfolio {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const portfolio = value as SimulatorPortfolio;
  return typeof portfolio.id === "number" &&
    typeof portfolio.name === "string" &&
    typeof portfolio.initialCapital === "number" &&
    typeof portfolio.currentValue === "number" &&
    typeof portfolio.cash === "number" &&
    typeof portfolio.totalReturn === "number" &&
    typeof portfolio.totalReturnPercent === "number" &&
    Array.isArray(portfolio.positions) &&
    portfolio.positions.every(isPosition) &&
    Array.isArray(portfolio.trades) &&
    portfolio.trades.every((trade) => normalizeTrade(trade) !== null);
}

export function normalizeTradingSimulatorState(value: unknown): TradingSimulatorState {
  const fallback = createDefaultTradingSimulatorState();

  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const candidate = value as Partial<TradingSimulatorState>;
  const portfolios = Array.isArray(candidate.portfolios)
    ? candidate.portfolios
        .filter(isPortfolio)
        .map((portfolio) => ({
          ...portfolio,
          positions: portfolio.positions.map((position) => ({ ...position })),
          trades: portfolio.trades
            .map((trade) => normalizeTrade(trade))
            .filter((trade): trade is SimulatorTrade => trade !== null),
        }))
    : [];

  if (portfolios.length === 0) {
    return fallback;
  }

  const selectedPortfolioId = portfolios.some((portfolio) => portfolio.id === candidate.selectedPortfolioId)
    ? (candidate.selectedPortfolioId as number)
    : portfolios[0].id;

  return {
    portfolios,
    selectedPortfolioId,
  };
}

export function loadTradingSimulatorState(storage?: Pick<Storage, "getItem">): TradingSimulatorState {
  if (!storage) {
    return createDefaultTradingSimulatorState();
  }

  try {
    const raw = storage.getItem(TRADING_SIMULATOR_STORAGE_KEY);
    if (!raw) {
      return createDefaultTradingSimulatorState();
    }

    return normalizeTradingSimulatorState(JSON.parse(raw));
  } catch {
    return createDefaultTradingSimulatorState();
  }
}

export function saveTradingSimulatorState(
  state: TradingSimulatorState,
  storage?: Pick<Storage, "setItem">
) {
  if (!storage) {
    return;
  }

  storage.setItem(TRADING_SIMULATOR_STORAGE_KEY, JSON.stringify(state));
}

export function getSelectedPortfolio(state: TradingSimulatorState): SimulatorPortfolio {
  return state.portfolios.find((portfolio) => portfolio.id === state.selectedPortfolioId) ?? state.portfolios[0];
}

export function getTradePriceSourceLabel(priceSource: TradePriceSource): string {
  return priceSource === "live" ? "Live market price" : "Manual fallback price";
}
