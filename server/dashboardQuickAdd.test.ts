import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const dashboardSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/Dashboard.tsx"),
  "utf8"
);
const simulatorSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/TradingSimulator.tsx"),
  "utf8"
);
const autoTraderSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/components/SimulatorAutoTrader.tsx"),
  "utf8"
);

describe("dashboard Quick add", () => {
  it("submits the selected quick-add stock directly instead of relying on search results", () => {
    expect(dashboardSource).toContain("const handleQuickAddStock = async (stock: QuickAddStock)");
    expect(dashboardSource).toContain("await handleAddStock(stock);");
    expect(dashboardSource).toContain("onClick={() => void handleQuickAddStock(stock)}");
    expect(dashboardSource).not.toContain("searchStocksQuery.data?.find((s) => s.ticker === ticker)");
  });

  it("keeps the Quick add action accessible and communicates its result", () => {
    expect(dashboardSource).toContain("aria-label={isInWatchlist ? `${stock.ticker} is already in your watchlist`");
    expect(dashboardSource).toContain("added to your watchlist.");
    expect(dashboardSource).toContain('role={watchlistFeedback.tone === "error" ? "alert" : "status"}');
  });

  it("creates a clear post-add route into the stock detail and Signal Engine", () => {
    expect(dashboardSource).toContain("const [recentlyAddedTicker, setRecentlyAddedTicker]");
    expect(dashboardSource).toContain("setRecentlyAddedTicker(input.ticker?.toUpperCase() ?? null);");
    expect(dashboardSource).toContain("is now on your watchlist");
    expect(dashboardSource).toContain("Open Signal Engine");
    expect(dashboardSource).toContain("View {recentlyAddedStock.ticker}");
  });

  it("forwards the complete current watchlist to Signal Engine instead of retaining an older basket", () => {
    expect(simulatorSource).toContain("const watchlistQuery = trpc.watchlist.list.useQuery");
    expect(simulatorSource).toContain("watchlist={watchlist}");
    expect(autoTraderSource).toContain("const activeUniverseTickers = hasWatchlistUniverse ? watchlistTickers : selectedTickers;");
    expect(autoTraderSource).toContain("universeTickers: activeUniverseTickers,");
    expect(autoTraderSource).toContain("Every stock you add to your watchlist is kept in this Signal Engine universe.");
  });
});
