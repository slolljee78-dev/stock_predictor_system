export type TradePriceSource = "live" | "fallback";

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
  priceSource: TradePriceSource;
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
        priceSource: "live",
      },
      {
        id: 2,
        ticker: "NVDA",
        type: "buy",
        quantity: 5,
        price: 890,
        date: "2026-04-11 10:15",
        priceSource: "live",
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

function isTrade(value: unknown): value is SimulatorTrade {
  return typeof value === "object" && value !== null &&
    typeof (value as SimulatorTrade).id === "number" &&
    typeof (value as SimulatorTrade).ticker === "string" &&
    ((value as SimulatorTrade).type === "buy" || (value as SimulatorTrade).type === "sell") &&
    typeof (value as SimulatorTrade).quantity === "number" &&
    typeof (value as SimulatorTrade).price === "number" &&
    typeof (value as SimulatorTrade).date === "string" &&
    (((value as SimulatorTrade).priceSource === "live") || ((value as SimulatorTrade).priceSource === "fallback"));
}

function isPortfolio(value: unknown): value is SimulatorPortfolio {
  return typeof value === "object" && value !== null &&
    typeof (value as SimulatorPortfolio).id === "number" &&
    typeof (value as SimulatorPortfolio).name === "string" &&
    typeof (value as SimulatorPortfolio).initialCapital === "number" &&
    typeof (value as SimulatorPortfolio).currentValue === "number" &&
    typeof (value as SimulatorPortfolio).cash === "number" &&
    typeof (value as SimulatorPortfolio).totalReturn === "number" &&
    typeof (value as SimulatorPortfolio).totalReturnPercent === "number" &&
    Array.isArray((value as SimulatorPortfolio).positions) &&
    (value as SimulatorPortfolio).positions.every(isPosition) &&
    Array.isArray((value as SimulatorPortfolio).trades) &&
    (value as SimulatorPortfolio).trades.every(isTrade);
}

export function normalizeTradingSimulatorState(value: unknown): TradingSimulatorState {
  const fallback = createDefaultTradingSimulatorState();

  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const candidate = value as Partial<TradingSimulatorState>;
  const portfolios = Array.isArray(candidate.portfolios) ? candidate.portfolios.filter(isPortfolio) : [];

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
