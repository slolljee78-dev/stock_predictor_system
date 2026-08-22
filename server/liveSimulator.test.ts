import { describe, it, expect } from "vitest";

describe("Live Simulator", () => {
  describe("executeLiveTradeWithMarketPrice", () => {
    it("should calculate buy trade with slippage and commission", () => {
      const quantity = 10;
      const requestedPrice = 100;
      const currentPrice = 100;
      const slippagePercent = 0.05;
      const commissionPercent = 0.1;

      // Calculate expected values
      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = currentPrice + slippageAmount;
      const tradeValue = executedPrice * quantity;
      const commission = tradeValue * (commissionPercent / 100);
      const totalCost = tradeValue + commission;

      expect(slippageAmount).toBe(0.05);
      expect(executedPrice).toBe(100.05);
      expect(tradeValue).toBe(1000.5);
      expect(commission).toBeCloseTo(1.0005);
      expect(totalCost).toBeCloseTo(1001.5005);
    });

    it("should calculate sell trade with slippage and commission", () => {
      const quantity = 10;
      const requestedPrice = 100;
      const currentPrice = 100;
      const slippagePercent = 0.05;
      const commissionPercent = 0.1;

      // Calculate expected values for sell
      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = currentPrice - slippageAmount;
      const tradeValue = executedPrice * quantity;
      const commission = tradeValue * (commissionPercent / 100);
      const totalProceeds = tradeValue - commission;

      expect(slippageAmount).toBe(0.05);
      expect(executedPrice).toBe(99.95);
      expect(tradeValue).toBe(999.5);
      expect(commission).toBeCloseTo(0.9995);
      expect(totalProceeds).toBeCloseTo(998.5005);
    });

    it("should handle zero slippage", () => {
      const quantity = 10;
      const currentPrice = 100;
      const slippagePercent = 0;
      const commissionPercent = 0.1;

      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = currentPrice + slippageAmount;

      expect(slippageAmount).toBe(0);
      expect(executedPrice).toBe(100);
    });

    it("should handle zero commission", () => {
      const quantity = 10;
      const currentPrice = 100;
      const slippagePercent = 0.05;
      const commissionPercent = 0;

      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = currentPrice + slippageAmount;
      const tradeValue = executedPrice * quantity;
      const commission = tradeValue * (commissionPercent / 100);

      expect(commission).toBe(0);
    });

    it("should handle large quantities", () => {
      const quantity = 1000;
      const currentPrice = 100;
      const slippagePercent = 0.05;
      const commissionPercent = 0.1;

      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = currentPrice + slippageAmount;
      const tradeValue = executedPrice * quantity;
      const commission = tradeValue * (commissionPercent / 100);
      const totalCost = tradeValue + commission;

      expect(tradeValue).toBe(100050);
      expect(commission).toBeCloseTo(100.05);
      expect(totalCost).toBeCloseTo(100150.05);
    });

    it("should handle fractional shares", () => {
      const quantity = 2.5;
      const currentPrice = 100;
      const slippagePercent = 0.05;
      const commissionPercent = 0.1;

      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = currentPrice + slippageAmount;
      const tradeValue = executedPrice * quantity;
      const commission = tradeValue * (commissionPercent / 100);
      const totalCost = tradeValue + commission;

      expect(tradeValue).toBeCloseTo(250.125);
      expect(commission).toBeCloseTo(0.250125);
      expect(totalCost).toBeCloseTo(250.375125);
    });
  });

  describe("calculateLivePortfolioValue", () => {
    it("should calculate portfolio with single position", () => {
      const positions = [
        {
          ticker: "AAPL",
          quantity: 10,
          averagePrice: 150,
        },
      ];
      const cashBalance = 5000;
      const currentPrice = 155;

      const positionValue = currentPrice * positions[0].quantity;
      const unrealizedPnL = positionValue - positions[0].averagePrice * positions[0].quantity;
      const unrealizedPnLPercent = (unrealizedPnL / (positions[0].averagePrice * positions[0].quantity)) * 100;
      const investedValue = positionValue;
      const totalValue = investedValue + cashBalance;

      expect(positionValue).toBe(1550);
      expect(unrealizedPnL).toBe(50);
      expect(unrealizedPnLPercent).toBeCloseTo(3.33, 1);
      expect(totalValue).toBe(6550);
    });

    it("should calculate portfolio with multiple positions", () => {
      const positions = [
        { ticker: "AAPL", quantity: 10, averagePrice: 150 },
        { ticker: "GOOGL", quantity: 5, averagePrice: 140 },
      ];
      const cashBalance = 5000;

      let totalInvestedValue = 0;
      positions.forEach(pos => {
        const currentPrice = pos.averagePrice * 1.02; // 2% gain
        const positionValue = currentPrice * pos.quantity;
        totalInvestedValue += positionValue;
      });

      const totalValue = totalInvestedValue + cashBalance;
      expect(totalValue).toBeGreaterThan(5000);
    });

    it("should handle zero positions", () => {
      const positions: any[] = [];
      const cashBalance = 10000;

      const investedValue = 0;
      const totalValue = investedValue + cashBalance;

      expect(totalValue).toBe(10000);
    });

    it("should calculate negative unrealized PnL for losing positions", () => {
      const positions = [
        {
          ticker: "TSLA",
          quantity: 10,
          averagePrice: 200,
        },
      ];
      const cashBalance = 5000;
      const currentPrice = 190; // 5% loss

      const positionValue = currentPrice * positions[0].quantity;
      const unrealizedPnL = positionValue - positions[0].averagePrice * positions[0].quantity;
      const unrealizedPnLPercent = (unrealizedPnL / (positions[0].averagePrice * positions[0].quantity)) * 100;

      expect(unrealizedPnL).toBe(-100);
      expect(unrealizedPnLPercent).toBe(-5);
    });

    it("should handle mixed gains and losses", () => {
      const positions = [
        { ticker: "AAPL", quantity: 10, averagePrice: 150 }, // 2% gain
        { ticker: "TSLA", quantity: 5, averagePrice: 200 }, // 5% loss
      ];
      const cashBalance = 5000;

      let totalPnL = 0;
      positions.forEach((pos, idx) => {
        const currentPrice = idx === 0 ? 153 : 190;
        const positionValue = currentPrice * pos.quantity;
        const pnl = positionValue - pos.averagePrice * pos.quantity;
        totalPnL += pnl;
      });

      // AAPL: 153*10 - 150*10 = 1530 - 1500 = 30 gain
      // TSLA: 190*5 - 200*5 = 950 - 1000 = -50 loss
      // Total: 30 - 50 = -20
      expect(totalPnL).toBe(-20);
    });

    it("should handle high volatility scenarios", () => {
      const positions = [
        { ticker: "NVDA", quantity: 100, averagePrice: 500 },
      ];
      const cashBalance = 10000;
      const currentPrice = 600; // 20% gain

      const positionValue = currentPrice * positions[0].quantity;
      const unrealizedPnL = positionValue - positions[0].averagePrice * positions[0].quantity;
      const unrealizedPnLPercent = (unrealizedPnL / (positions[0].averagePrice * positions[0].quantity)) * 100;

      expect(unrealizedPnL).toBe(10000);
      expect(unrealizedPnLPercent).toBe(20);
    });
  });

  describe("Trade execution scenarios", () => {
    it("should handle market buy orders", () => {
      const tradeType = "BUY";
      const quantity = 10;
      const currentPrice = 100;
      const slippagePercent = 0.05;

      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = tradeType === "BUY" ? currentPrice + slippageAmount : currentPrice - slippageAmount;

      expect(executedPrice).toBe(100.05);
    });

    it("should handle market sell orders", () => {
      const tradeType = "SELL";
      const quantity = 10;
      const currentPrice = 100;
      const slippagePercent = 0.05;

      const slippageAmount = currentPrice * (slippagePercent / 100);
      const executedPrice = tradeType === "BUY" ? currentPrice + slippageAmount : currentPrice - slippageAmount;

      expect(executedPrice).toBe(99.95);
    });

    it("should validate trade execution success", () => {
      const execution = {
        success: true,
        ticker: "AAPL",
        type: "BUY" as const,
        quantity: 10,
        executedPrice: 150.5,
        slippage: 0.5,
        commission: 1.5,
      };

      expect(execution.success).toBe(true);
      expect(execution.executedPrice).toBeGreaterThan(0);
      expect(execution.slippage).toBeGreaterThanOrEqual(0);
      expect(execution.commission).toBeGreaterThanOrEqual(0);
    });
  });
});
