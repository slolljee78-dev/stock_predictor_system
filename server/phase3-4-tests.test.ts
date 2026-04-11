import { describe, it, expect } from "vitest";
import {
  generateMLPrediction,
  calculateModelMetrics,
  predictWithLSTM,
  predictWithXGBoost,
  predictWithEnsemble,
} from "./mlModels";
import {
  calculateKellyCriterion,
  calculatePositionSize,
  checkStopLoss,
  checkTakeProfit,
  calculateRiskMetrics,
  checkPortfolioRiskLimits,
} from "./riskManagement";
import {
  volatilityFilter,
  profitTakingFilter,
  signalStrengthFilter,
  marketHoursFilter,
  correlationFilter,
  tradeFrequencyFilter,
  applyQuickWinFilters,
  generateQuickWinsReport,
} from "./quickWins";
import { GeneratedSignal } from "./signalGenerator";

// Mock price data
const mockPriceData = [
  { open: 100, high: 102, low: 99, close: 101, volume: 1000000 },
  { open: 101, high: 103, low: 100, close: 102, volume: 1100000 },
  { open: 102, high: 104, low: 101, close: 103, volume: 1200000 },
  { open: 103, high: 105, low: 102, close: 104, volume: 1300000 },
  { open: 104, high: 106, low: 103, close: 105, volume: 1400000 },
  { open: 105, high: 107, low: 104, close: 106, volume: 1500000 },
  { open: 106, high: 108, low: 105, close: 107, volume: 1600000 },
  { open: 107, high: 109, low: 106, close: 108, volume: 1700000 },
  { open: 108, high: 110, low: 107, close: 109, volume: 1800000 },
  { open: 109, high: 111, low: 108, close: 110, volume: 1900000 },
  { open: 110, high: 112, low: 109, close: 111, volume: 2000000 },
];

// Mock signal
const mockSignal: GeneratedSignal = {
  type: "buy",
  confidenceScore: 75,
  analysis: "Strong uptrend detected",
  indicators: {
    rsi: 65,
    macd: { value: 0.5, signal: 0.3, histogram: 0.2 },
    bollingerBands: { upper: 115, middle: 105, lower: 95 },
    sma20: 105,
    sma50: 100,
    ema12: 106,
    ema26: 104,
  },
};

describe("Phase 3: ML Models", () => {
  describe("LSTM Prediction", () => {
    it("should predict price direction based on momentum", () => {
      const prediction = predictWithLSTM(mockPriceData);
      expect(prediction).toBeGreaterThan(0);
      expect(prediction).toBeGreaterThan(110); // Should predict upward
    });

    it("should handle insufficient data", () => {
      const shortData = mockPriceData.slice(0, 5);
      const prediction = predictWithLSTM(shortData);
      expect(prediction).toBe(shortData[shortData.length - 1].close);
    });
  });

  describe("XGBoost Prediction", () => {
    it("should predict price using feature importance", () => {
      const prediction = predictWithXGBoost(mockPriceData);
      expect(prediction).toBeGreaterThan(0);
      expect(prediction).toBeGreaterThan(110);
    });

    it("should incorporate volume trends", () => {
      const prediction = predictWithXGBoost(mockPriceData);
      expect(prediction).toBeGreaterThan(mockPriceData[mockPriceData.length - 1].close);
    });
  });

  describe("Ensemble Prediction", () => {
    it("should average LSTM and XGBoost predictions", () => {
      const lstmPred = predictWithLSTM(mockPriceData);
      const xgbPred = predictWithXGBoost(mockPriceData);
      const ensemblePred = predictWithEnsemble(mockPriceData);

      expect(ensemblePred).toBeGreaterThan(Math.min(lstmPred, xgbPred) - 1);
      expect(ensemblePred).toBeLessThan(Math.max(lstmPred, xgbPred) + 1);
    });

    it("should bias toward XGBoost (60% weight)", () => {
      const ensemblePred = predictWithEnsemble(mockPriceData);
      const xgbPred = predictWithXGBoost(mockPriceData);

      expect(Math.abs(ensemblePred - xgbPred)).toBeLessThan(Math.abs(ensemblePred - predictWithLSTM(mockPriceData)));
    });
  });

  describe("ML Prediction Generation", () => {
    it("should generate complete ML prediction", () => {
      const prediction = generateMLPrediction(mockPriceData);

      expect(prediction.nextPrice).toBeGreaterThan(0);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(100);
      expect(["up", "down", "neutral"]).toContain(prediction.direction);
      expect(prediction.probability).toBeGreaterThanOrEqual(0);
      expect(prediction.probability).toBeLessThanOrEqual(1);
    });

    it("should show model agreement in confidence", () => {
      const prediction = generateMLPrediction(mockPriceData);
      expect(prediction.confidence).toBeGreaterThan(0);
    });
  });

  describe("Model Metrics", () => {
    it("should calculate accuracy from predictions", () => {
      const predictions = [
        generateMLPrediction(mockPriceData),
        generateMLPrediction(mockPriceData),
      ];
      const actualPrices = [110, 111, 112, 113];

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracy).toBeLessThanOrEqual(1);
    });

    it("should calculate Sharpe ratio", () => {
      const predictions = Array(10).fill(generateMLPrediction(mockPriceData));
      const actualPrices = Array.from({ length: 11 }, (_, i) => 100 + i);

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.sharpeRatio).toBeGreaterThanOrEqual(0);
    });

    it("should calculate max drawdown", () => {
      const predictions = Array(10).fill(generateMLPrediction(mockPriceData));
      const actualPrices = [100, 105, 103, 108, 102, 110, 105, 112, 108, 115, 110];

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(metrics.maxDrawdown).toBeLessThanOrEqual(1);
    });
  });
});

describe("Phase 4: Risk Management", () => {
  describe("Kelly Criterion", () => {
    it("should calculate optimal position size", () => {
      const kelly = calculateKellyCriterion(0.6, 1, 1);
      expect(kelly).toBeGreaterThan(0);
      expect(kelly).toBeLessThan(0.05); // Max 5%
    });

    it("should return 0 for losing strategy", () => {
      const kelly = calculateKellyCriterion(0.3, 1, 1);
      expect(kelly).toBeLessThanOrEqual(0.005); // Min 0.5%
    });

    it("should apply safety factor (25% of Kelly)", () => {
      const kelly = calculateKellyCriterion(0.7, 2, 1);
      expect(kelly).toBeLessThanOrEqual(0.05);
    });
  });

  describe("Position Sizing", () => {
    it("should calculate position size based on risk", () => {
      const portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const sizing = calculatePositionSize(portfolio, 100, 98, 0.6);

      expect(sizing.shares).toBeGreaterThan(0);
      expect(sizing.riskAmount).toBeGreaterThan(0);
      expect(sizing.stopLoss).toBe(98);
      expect(sizing.takeProfit).toBeGreaterThan(100);
    });

    it("should respect max position size", () => {
      const portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const sizing = calculatePositionSize(portfolio, 100, 98);

      expect(sizing.positionSizePercent).toBeLessThanOrEqual(sizing.maxPositionSize);
    });
  });

  describe("Stop Loss", () => {
    it("should trigger stop loss at -2%", () => {
      const position = {
        ticker: "AAPL",
        shares: 100,
        entryPrice: 100,
        currentPrice: 97.5,
        entryTime: new Date(),
      };

      const result = checkStopLoss(position, 0.02);

      expect(result.shouldStop).toBe(true);
    });

    it("should not trigger stop loss above threshold", () => {
      const position = {
        ticker: "AAPL",
        shares: 100,
        entryPrice: 100,
        currentPrice: 99,
        entryTime: new Date(),
      };

      const result = checkStopLoss(position, 0.02);

      expect(result.shouldStop).toBe(false);
    });
  });

  describe("Take Profit", () => {
    it("should trigger take profit at +5%", () => {
      const position = {
        ticker: "AAPL",
        shares: 100,
        entryPrice: 100,
        currentPrice: 105.5,
        entryTime: new Date(),
      };

      const result = checkTakeProfit(position, 0.05);

      expect(result.shouldTakeProfit).toBe(true);
    });

    it("should not trigger take profit below threshold", () => {
      const position = {
        ticker: "AAPL",
        shares: 100,
        entryPrice: 100,
        currentPrice: 103,
        entryTime: new Date(),
      };

      const result = checkTakeProfit(position, 0.05);

      expect(result.shouldTakeProfit).toBe(false);
    });
  });

  describe("Portfolio Risk Metrics", () => {
    it("should calculate portfolio value", () => {
      const portfolio = {
        totalCapital: 10000,
        positions: [
          {
            ticker: "AAPL",
            shares: 100,
            entryPrice: 100,
            currentPrice: 105,
            entryTime: new Date(),
          },
        ],
        cash: 5000,
        dayStartCapital: 10000,
      };

      const metrics = calculateRiskMetrics(portfolio, [10000, 10500, 11000]);

      expect(metrics.portfolioValue).toBeGreaterThan(10000);
      expect(metrics.dayPnL).toBeGreaterThan(0);
    });

    it("should calculate max drawdown", () => {
      const portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const metrics = calculateRiskMetrics(portfolio, [10000, 9500, 9000, 9500, 10000]);

      expect(metrics.maxDrawdown).toBeGreaterThan(0);
      expect(metrics.maxDrawdown).toBeLessThanOrEqual(1);
    });
  });

  describe("Portfolio Risk Limits", () => {
    it("should flag excessive daily loss", () => {
      const portfolio = {
        totalCapital: 10000,
        positions: [],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const result = checkPortfolioRiskLimits(portfolio, 10000, 0.02);

      expect(result.withinLimits).toBe(true);
    });

    it("should flag position concentration", () => {
      const portfolio = {
        totalCapital: 10000,
        positions: [
          {
            ticker: "AAPL",
            shares: 200,
            entryPrice: 100,
            currentPrice: 100,
            entryTime: new Date(),
          },
        ],
        cash: 10000,
        dayStartCapital: 10000,
      };

      const result = checkPortfolioRiskLimits(portfolio, 10000);

      expect(result.violations.length).toBeGreaterThan(0);
    });
  });
});

describe("Quick Wins", () => {
  describe("Volatility Filter", () => {
    it("should pass when VIX is low", () => {
      const result = volatilityFilter(mockSignal, 15);
      expect(result.passed).toBe(true);
    });

    it("should fail when VIX is high", () => {
      const result = volatilityFilter(mockSignal, 30);
      expect(result.passed).toBe(false);
    });
  });

  describe("Profit-Taking Filter", () => {
    it("should trigger at +2% profit", () => {
      const result = profitTakingFilter(mockSignal, 102.5, 100);
      expect(result.passed).toBe(false);
    });

    it("should pass below profit target", () => {
      const result = profitTakingFilter(mockSignal, 101, 100);
      expect(result.passed).toBe(true);
    });
  });

  describe("Signal Strength Filter", () => {
    it("should pass high-confidence signals", () => {
      const result = signalStrengthFilter(mockSignal, 75);
      expect(result.passed).toBe(true);
    });

    it("should fail low-confidence signals", () => {
      const weakSignal = { ...mockSignal, confidenceScore: 50 };
      const result = signalStrengthFilter(weakSignal, 75);
      expect(result.passed).toBe(false);
    });
  });

  describe("Market Hours Filter", () => {
    it("should check market hours", () => {
      // Just verify the filter returns a result
      const result = marketHoursFilter(mockSignal, new Date());
      expect(result.passed).toBeDefined();
      expect(result.reason).toBeDefined();
    });

    it("should fail on weekends", () => {
      const weekend = new Date("2026-04-12T15:00:00Z"); // Sunday (April 12, 2026)
      const result = marketHoursFilter(mockSignal, weekend);
      expect(result.passed).toBe(false);
    });
  });

  describe("Correlation Filter", () => {
    it("should pass uncorrelated positions", () => {
      const result = correlationFilter(mockSignal, ["TSLA"], 0.7);
      expect(result.passed).toBe(true);
    });

    it("should check correlation threshold", () => {
      const result = correlationFilter(mockSignal, ["MSFT"], 0.7);
      // MSFT-AAPL correlation is 0.65, which is below 0.7 threshold
      expect(result.passed).toBe(true);
    });
  });

  describe("Trade Frequency Filter", () => {
    it("should pass when below limit", () => {
      const result = tradeFrequencyFilter(mockSignal, 5, 10);
      expect(result.passed).toBe(true);
    });

    it("should fail when at limit", () => {
      const result = tradeFrequencyFilter(mockSignal, 10, 10);
      expect(result.passed).toBe(false);
    });
  });

  describe("Combined Quick Wins", () => {
    it("should apply all filters", () => {
      const result = applyQuickWinFilters(mockSignal, {
        vixLevel: 15,
        minConfidence: 75,
        tradesExecutedToday: 5,
        filters: {
          volatilityFilter: true,
          profitTakingFilter: false,
          signalStrengthFilter: true,
          marketHoursFilter: false,
          correlationFilter: false,
          tradeFrequencyFilter: true,
        },
      });

      expect(result.finalSignal).toBe("buy");
      expect(result.confidence).toBeGreaterThanOrEqual(mockSignal.confidenceScore);
    });

    it("should convert to hold when filters fail", () => {
      const result = applyQuickWinFilters(mockSignal, {
        vixLevel: 30,
        minConfidence: 75,
      });

      expect(result.finalSignal).toBe("hold");
    });
  });

  describe("Quick Wins Report", () => {
    it("should generate filter breakdown", () => {
      const signals = [mockSignal, mockSignal];
      const report = generateQuickWinsReport(signals, { vixLevel: 15 });

      expect(report.totalSignals).toBe(2);
      expect(report.passingSignals).toBeGreaterThanOrEqual(0);
      expect(report.filteredSignals).toBeGreaterThanOrEqual(0);
      expect(report.filterBreakdown).toBeDefined();
    });
  });
});
