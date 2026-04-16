/**
 * Portfolio Export/Import Service
 * Handles exporting and importing portfolio data in JSON format
 */

export interface ExportedPortfolio {
  name: string;
  description?: string;
  startingCapital: number;
  currentCapital: number;
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winningTrades: number;
  profitFactor: number;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate?: string;
  trades: ExportedTrade[];
  metadata: {
    exportedAt: string;
    version: string;
  };
}

export interface ExportedTrade {
  date: string;
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  pnl: number;
  pnlPercent: number;
}

/**
 * Export portfolio to JSON format
 */
export function exportPortfolioToJSON(
  portfolio: {
    name: string;
    description?: string;
    startingCapital: number;
    currentCapital: number;
    totalReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalTrades: number;
    winningTrades: number;
    profitFactor: number;
    status: "active" | "paused" | "completed";
    startDate: Date;
    endDate?: Date;
  },
  trades: Array<{
    date: string;
    ticker: string;
    type: "BUY" | "SELL";
    quantity: number;
    price: number;
    pnl: number;
    pnlPercent: number;
  }>
): ExportedPortfolio {
  return {
    name: portfolio.name,
    description: portfolio.description,
    startingCapital: portfolio.startingCapital,
    currentCapital: portfolio.currentCapital,
    totalReturn: portfolio.totalReturn,
    winRate: portfolio.winRate,
    sharpeRatio: portfolio.sharpeRatio,
    maxDrawdown: portfolio.maxDrawdown,
    totalTrades: portfolio.totalTrades,
    winningTrades: portfolio.winningTrades,
    profitFactor: portfolio.profitFactor,
    status: portfolio.status,
    startDate: portfolio.startDate.toISOString(),
    endDate: portfolio.endDate?.toISOString(),
    trades,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: "1.0",
    },
  };
}

/**
 * Export portfolio to CSV format
 */
export function exportPortfolioToCSV(
  portfolio: ExportedPortfolio
): string {
  const lines: string[] = [];

  // Header section
  lines.push("Portfolio Export");
  lines.push(`Name,${portfolio.name}`);
  lines.push(`Description,${portfolio.description || ""}`);
  lines.push(`Starting Capital,${portfolio.startingCapital}`);
  lines.push(`Current Capital,${portfolio.currentCapital}`);
  lines.push(`Total Return %,${portfolio.totalReturn}`);
  lines.push(`Win Rate %,${portfolio.winRate}`);
  lines.push(`Sharpe Ratio,${portfolio.sharpeRatio}`);
  lines.push(`Max Drawdown %,${portfolio.maxDrawdown}`);
  lines.push(`Total Trades,${portfolio.totalTrades}`);
  lines.push(`Winning Trades,${portfolio.winningTrades}`);
  lines.push(`Profit Factor,${portfolio.profitFactor}`);
  lines.push(`Status,${portfolio.status}`);
  lines.push(`Start Date,${portfolio.startDate}`);
  lines.push(`End Date,${portfolio.endDate || ""}`);
  lines.push(`Exported At,${portfolio.metadata.exportedAt}`);
  lines.push("");

  // Trades section
  lines.push("Trade History");
  lines.push("Date,Ticker,Type,Quantity,Price,P&L,P&L %");
  for (const trade of portfolio.trades) {
    lines.push(
      `${trade.date},${trade.ticker},${trade.type},${trade.quantity},${trade.price},${trade.pnl},${trade.pnlPercent}`
    );
  }

  return lines.join("\n");
}

/**
 * Import portfolio from JSON
 */
export function importPortfolioFromJSON(
  jsonData: string
): ExportedPortfolio {
  try {
    const data = JSON.parse(jsonData);

    // Validate required fields
    if (!data.name || typeof data.name !== "string") {
      throw new Error("Invalid portfolio: missing or invalid name");
    }

    if (
      data.startingCapital === undefined ||
      typeof data.startingCapital !== "number"
    ) {
      throw new Error("Invalid portfolio: missing or invalid startingCapital");
    }

    if (
      data.currentCapital === undefined ||
      typeof data.currentCapital !== "number"
    ) {
      throw new Error("Invalid portfolio: missing or invalid currentCapital");
    }

    if (!Array.isArray(data.trades)) {
      throw new Error("Invalid portfolio: trades must be an array");
    }

    return data as ExportedPortfolio;
  } catch (error) {
    throw new Error(
      `Failed to import portfolio: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate imported portfolio data
 */
export function validatePortfolioData(
  portfolio: ExportedPortfolio
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!portfolio.name || portfolio.name.trim().length === 0) {
    errors.push("Portfolio name is required");
  }

  if (portfolio.startingCapital <= 0) {
    errors.push("Starting capital must be greater than 0");
  }

  if (portfolio.currentCapital < 0) {
    errors.push("Current capital cannot be negative");
  }

  if (portfolio.winRate < 0 || portfolio.winRate > 100) {
    errors.push("Win rate must be between 0 and 100");
  }

  if (portfolio.maxDrawdown < 0 || portfolio.maxDrawdown > 100) {
    errors.push("Max drawdown must be between 0 and 100");
  }

  if (portfolio.totalTrades < 0) {
    errors.push("Total trades cannot be negative");
  }

  if (portfolio.winningTrades < 0 || portfolio.winningTrades > portfolio.totalTrades) {
    errors.push("Winning trades must be between 0 and total trades");
  }

  if (!Array.isArray(portfolio.trades)) {
    errors.push("Trades must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate download filename for portfolio
 */
export function generatePortfolioFilename(
  portfolio: ExportedPortfolio,
  format: "json" | "csv"
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizedName = portfolio.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `portfolio_${sanitizedName}_${timestamp}.${format}`;
}
