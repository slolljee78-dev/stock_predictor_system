import type { SimulatorPortfolio, SimulatorTrade } from "./tradingSimulatorState";

export interface AutoExecutedTrade {
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  executedPrice: number;
  executionTime: string;
  totalCost: number;
  priceSource: "live" | "fallback";
  confidence: number;
  reasoning: string;
  origin?: "manual" | "auto";
  riskProfile?: "conservative" | "balanced" | "aggressive";
}

function formatExecutionTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Auto trade";
  }

  return parsed.toLocaleString();
}

function createSimulatorTrade(id: number, trade: AutoExecutedTrade): SimulatorTrade {
  return {
    id,
    ticker: trade.ticker,
    type: trade.type === "BUY" ? "buy" : "sell",
    quantity: trade.quantity,
    price: trade.executedPrice,
    date: formatExecutionTime(trade.executionTime),
    executedAt: trade.executionTime,
    priceSource: trade.priceSource,
    origin: trade.origin ?? "auto",
    confidence: trade.confidence,
    reasoning: trade.reasoning,
    riskProfile: trade.riskProfile,
  };
}

export function applyAutoExecutedTrades(
  portfolio: SimulatorPortfolio,
  executedTrades: AutoExecutedTrade[],
): SimulatorPortfolio {
  if (executedTrades.length === 0) {
    return portfolio;
  }

  let nextPortfolio: SimulatorPortfolio = {
    ...portfolio,
    positions: portfolio.positions.map((position) => ({ ...position })),
    trades: portfolio.trades.map((trade) => ({ ...trade })),
  };
  let nextTradeId = nextPortfolio.trades.length > 0
    ? Math.max(...nextPortfolio.trades.map((trade) => trade.id)) + 1
    : 1;

  for (const trade of executedTrades) {
    const existingPosition = nextPortfolio.positions.find((position) => position.ticker === trade.ticker);

    if (trade.type === "BUY") {
      if (existingPosition) {
        const totalCostBasis = existingPosition.entryPrice * existingPosition.quantity + trade.executedPrice * trade.quantity;
        const totalQuantity = existingPosition.quantity + trade.quantity;
        const averagePrice = totalCostBasis / totalQuantity;

        nextPortfolio.positions = nextPortfolio.positions.map((position) =>
          position.ticker === trade.ticker
            ? {
                ...position,
                quantity: totalQuantity,
                entryPrice: averagePrice,
                currentPrice: trade.executedPrice,
                unrealizedPnL: (trade.executedPrice - averagePrice) * totalQuantity,
                unrealizedPnLPercent: averagePrice > 0 ? ((trade.executedPrice - averagePrice) / averagePrice) * 100 : 0,
              }
            : position,
        );
      } else {
        nextPortfolio.positions = [
          ...nextPortfolio.positions,
          {
            ticker: trade.ticker,
            quantity: trade.quantity,
            entryPrice: trade.executedPrice,
            currentPrice: trade.executedPrice,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
          },
        ];
      }

      nextPortfolio.cash -= trade.totalCost;
    } else if (existingPosition) {
      const remainingQuantity = existingPosition.quantity - trade.quantity;
      if (remainingQuantity <= 0) {
        nextPortfolio.positions = nextPortfolio.positions.filter((position) => position.ticker !== trade.ticker);
      } else {
        nextPortfolio.positions = nextPortfolio.positions.map((position) =>
          position.ticker === trade.ticker
            ? {
                ...position,
                quantity: remainingQuantity,
                currentPrice: trade.executedPrice,
                unrealizedPnL: (trade.executedPrice - position.entryPrice) * remainingQuantity,
                unrealizedPnLPercent: position.entryPrice > 0 ? ((trade.executedPrice - position.entryPrice) / position.entryPrice) * 100 : 0,
              }
            : position,
        );
      }

      nextPortfolio.cash += trade.totalCost;
    }

    nextPortfolio.trades = [createSimulatorTrade(nextTradeId, trade), ...nextPortfolio.trades];
    nextTradeId += 1;
  }

  const investedValue = nextPortfolio.positions.reduce(
    (sum, position) => sum + position.currentPrice * position.quantity,
    0,
  );
  nextPortfolio.currentValue = nextPortfolio.cash + investedValue;
  nextPortfolio.totalReturn = nextPortfolio.currentValue - nextPortfolio.initialCapital;
  nextPortfolio.totalReturnPercent = nextPortfolio.initialCapital > 0
    ? (nextPortfolio.totalReturn / nextPortfolio.initialCapital) * 100
    : 0;

  return nextPortfolio;
}
