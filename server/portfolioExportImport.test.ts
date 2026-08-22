import { describe, it, expect } from "vitest";
import {
  exportPortfolioToJSON,
  exportPortfolioToCSV,
  importPortfolioFromJSON,
  validatePortfolioData,
  generatePortfolioFilename,
} from "./portfolioExportImport";

describe("Portfolio Export/Import", () => {
  const mockPortfolio = {
    name: "Test Portfolio",
    description: "A test portfolio",
    startingCapital: 10000,
    currentCapital: 11247,
    totalReturn: 1247,
    winRate: 65,
    sharpeRatio: 120,
    maxDrawdown: 35,
    totalTrades: 12,
    winningTrades: 8,
    profitFactor: 180,
    status: "active" as const,
    startDate: new Date("2026-01-01"),
    endDate: undefined,
  };

  const mockTrades = [
    {
      date: "2026-01-15",
      ticker: "AAPL",
      type: "BUY" as const,
      quantity: 10,
      price: 150.5,
      pnl: 15,
      pnlPercent: 1.0,
    },
    {
      date: "2026-01-20",
      ticker: "MSFT",
      type: "SELL" as const,
      quantity: 5,
      price: 320.2,
      pnl: 8,
      pnlPercent: 0.5,
    },
  ];

  it("should export portfolio to JSON format", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);

    expect(exported.name).toBe("Test Portfolio");
    expect(exported.startingCapital).toBe(10000);
    expect(exported.currentCapital).toBe(11247);
    expect(exported.trades).toHaveLength(2);
    expect(exported.metadata.version).toBe("1.0");
    expect(exported.metadata.exportedAt).toBeDefined();
  });

  it("should export portfolio to CSV format", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    const csv = exportPortfolioToCSV(exported);

    expect(csv).toContain("Portfolio Export");
    expect(csv).toContain("Test Portfolio");
    expect(csv).toContain("Trade History");
    expect(csv).toContain("AAPL");
    expect(csv).toContain("MSFT");
    expect(csv).toContain("BUY");
    expect(csv).toContain("SELL");
  });

  it("should import portfolio from valid JSON", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    const json = JSON.stringify(exported);
    const imported = importPortfolioFromJSON(json);

    expect(imported.name).toBe("Test Portfolio");
    expect(imported.startingCapital).toBe(10000);
    expect(imported.trades).toHaveLength(2);
  });

  it("should throw error on invalid JSON", () => {
    expect(() => importPortfolioFromJSON("invalid json")).toThrow();
  });

  it("should throw error on missing required fields", () => {
    const invalidData = JSON.stringify({ startingCapital: 10000 });
    expect(() => importPortfolioFromJSON(invalidData)).toThrow("missing or invalid name");
  });

  it("should validate portfolio data correctly", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    const result = validatePortfolioData(exported);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect invalid win rate", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    exported.winRate = 150; // Invalid: > 100
    const result = validatePortfolioData(exported);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Win rate must be between 0 and 100");
  });

  it("should detect negative starting capital", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    exported.startingCapital = -1000;
    const result = validatePortfolioData(exported);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Starting capital must be greater than 0");
  });

  it("should detect winning trades > total trades", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    exported.winningTrades = 20; // > totalTrades (12)
    const result = validatePortfolioData(exported);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Winning trades must be between 0 and total trades");
  });

  it("should generate correct filename for JSON export", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    const filename = generatePortfolioFilename(exported, "json");

    expect(filename).toContain("portfolio_");
    expect(filename).toContain("test_portfolio");
    expect(filename).toMatch(/\.json$/);
  });

  it("should generate correct filename for CSV export", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    const filename = generatePortfolioFilename(exported, "csv");

    expect(filename).toContain("portfolio_");
    expect(filename).toContain("test_portfolio");
    expect(filename).toMatch(/\.csv$/);
  });

  it("should handle portfolio with no end date", () => {
    const exported = exportPortfolioToJSON(mockPortfolio, mockTrades);
    expect(exported.endDate).toBeUndefined();
  });

  it("should handle portfolio with end date", () => {
    const portfolioWithEnd = { ...mockPortfolio, endDate: new Date("2026-03-31") };
    const exported = exportPortfolioToJSON(portfolioWithEnd, mockTrades);
    expect(exported.endDate).toBeDefined();
  });
});
