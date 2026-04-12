import { describe, it, expect, beforeEach } from "vitest";
import { getLSTMModel } from "./lstmModel";
import { getXGBoostModel } from "./xgboostModel";
import { getEnsembleModel } from "./ensembleModel";
import { getRiskManagementEngine } from "./riskManagement";
import { getPerformanceFiltersEngine, type MarketConditions } from "./performanceFilters";

describe("LSTM Model", () => {
  let model = getLSTMModel();

  beforeEach(() => {
    model = getLSTMModel();
  });

  it("should predict price movement with reasonable confidence", () => {
    const priceHistory = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5);
    const indicators = {
      rsi: 65,
      macd: 0.5,
      bollingerBandPosition: 0.7,
      volumeRatio: 1.2,
    };

    const result = model.predict(priceHistory, indicators);

    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.direction).toMatch(/UP|DOWN|NEUTRAL/);
    expect(result.predictedPrice).toBeGreaterThan(0);
  });

  it("should handle insufficient data gracefully", () => {
    const shortHistory = [100, 101, 102];
    const indicators = { rsi: 50, macd: 0, bollingerBandPosition: 0.5, volumeRatio: 1 };

    const result = model.predict(shortHistory, indicators);

    expect(result.confidence).toBeLessThan(0.5);
    expect(result.direction).toBe("NEUTRAL");
  });

  it("should calculate model metrics correctly", () => {
    const predictions = [100.5, 101.2, 99.8, 102.1];
    const actuals = [100.8, 101.0, 100.2, 102.0];

    const metrics = model.calculateMetrics(predictions, actuals);

    expect(metrics.mse).toBeGreaterThan(0);
    expect(metrics.rmse).toBeGreaterThan(0);
    expect(metrics.mae).toBeGreaterThan(0);
    expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(metrics.accuracy).toBeLessThanOrEqual(1);
  });

  it("should return model info", () => {
    const info = model.getModelInfo();

    expect(info.name).toBe("LSTM Price Predictor v1.0");
    expect(info.lookbackWindow).toBe(30);
    expect(info.parameters).toBeGreaterThan(0);
  });
});

describe("XGBoost Model", () => {
  let model = getXGBoostModel();

  beforeEach(() => {
    model = getXGBoostModel();
  });

  it("should predict price movement with feature importance", () => {
    const features = {
      rsi: 65,
      macd: 0.5,
      bollingerBandPosition: 0.7,
      volumeRatio: 1.2,
      priceVelocity: 0.02,
      volatility: 0.15,
      trendStrength: 0.8,
      supportDistance: 0.05,
      resistanceDistance: 0.1,
      marketSentiment: 0.6,
    };

    const result = model.predict(features);

    expect(result.predictedMove).toBeGreaterThanOrEqual(-0.1);
    expect(result.predictedMove).toBeLessThanOrEqual(0.1);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("should provide feature importance ranking", () => {
    const topFeatures = model.getTopFeatures(5);

    expect(topFeatures.length).toBeLessThanOrEqual(5);
    expect(topFeatures[0].importance).toBeGreaterThanOrEqual(topFeatures[1]?.importance || 0);
  });

  it("should update feature importance based on accuracy", () => {
    const features = {
      rsi: 65,
      macd: 0.5,
      bollingerBandPosition: 0.7,
      volumeRatio: 1.2,
      priceVelocity: 0.02,
      volatility: 0.15,
      trendStrength: 0.8,
      supportDistance: 0.05,
      resistanceDistance: 0.1,
      marketSentiment: 0.6,
    };

    const initialImportance = model.getFeatureImportance();
    model.updateFeatureImportance(features, 0.02, 0.02);
    const updatedImportance = model.getFeatureImportance();

    expect(Object.keys(updatedImportance).length).toBe(Object.keys(initialImportance).length);
  });

  it("should return model info", () => {
    const info = model.getModelInfo();

    expect(info.name).toBe("XGBoost Price Predictor v1.0");
    expect(info.numTrees).toBe(100);
    expect(info.numFeatures).toBeGreaterThan(0);
  });
});

describe("Ensemble Model", () => {
  let model = getEnsembleModel();

  beforeEach(() => {
    model = getEnsembleModel();
  });

  it("should combine LSTM and XGBoost predictions", () => {
    const priceHistory = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5);
    const indicators = {
      rsi: 65,
      macd: 0.5,
      bollingerBandPosition: 0.7,
      volumeRatio: 1.2,
    };
    const features = {
      rsi: 65,
      macd: 0.5,
      bollingerBandPosition: 0.7,
      volumeRatio: 1.2,
      priceVelocity: 0.02,
      volatility: 0.15,
      trendStrength: 0.8,
      supportDistance: 0.05,
      resistanceDistance: 0.1,
      marketSentiment: 0.6,
    };

    const result = model.predict("AAPL", 100, priceHistory, indicators, features);

    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.modelAgreement).toBeGreaterThanOrEqual(0);
    expect(result.modelAgreement).toBeLessThanOrEqual(1);
    expect(result.recommendedAction).toMatch(/BUY|SELL|HOLD/);
  });

  it("should track model weights", () => {
    const weights = model.getWeights();

    expect(weights.lstm + weights.xgboost).toBeCloseTo(1, 2);
  });

  it("should calculate ensemble accuracy", () => {
    const accuracy = model.calculateAccuracy();

    expect(accuracy).toBeGreaterThanOrEqual(0);
    expect(accuracy).toBeLessThanOrEqual(1);
  });

  it("should return model info", () => {
    const info = model.getModelInfo();

    expect(info.name).toBe("Ensemble Model v1.0");
    expect(info.models).toContain("LSTM");
    expect(info.models).toContain("XGBoost");
  });
});

describe("Risk Management Engine", () => {
  let engine = getRiskManagementEngine();

  beforeEach(() => {
    engine = getRiskManagementEngine();
  });

  it("should calculate Kelly Criterion correctly", () => {
    const result = engine.calculateKellyCriterion(0.6, 1.5, 1, 10000);

    expect(result.optimalFraction).toBeGreaterThan(0);
    expect(result.optimalFraction).toBeLessThanOrEqual(0.25);
    expect(result.recommendedPositionSize).toBeGreaterThan(0);
    expect(result.maxPositionValue).toBeLessThanOrEqual(1000);
  });

  it("should calculate portfolio volatility", () => {
    const returns = [0.01, -0.02, 0.015, -0.01, 0.02];
    const volatility = engine.calculateVolatility(returns);

    expect(volatility).toBeGreaterThan(0);
  });

  it("should calculate Sharpe Ratio", () => {
    const returns = [0.01, 0.02, -0.01, 0.015, 0.025];
    const sharpeRatio = engine.calculateSharpeRatio(returns);

    expect(sharpeRatio).toBeDefined();
  });

  it("should calculate max drawdown", () => {
    const prices = [100, 105, 103, 110, 95, 100, 108];
    const maxDrawdown = engine.calculateMaxDrawdown(prices);

    expect(maxDrawdown).toBeGreaterThan(0);
    expect(maxDrawdown).toBeLessThanOrEqual(1);
  });

  it("should calculate VaR and CVaR", () => {
    const returns = Array.from({ length: 100 }, () => (Math.random() - 0.5) * 0.1);
    const var95 = engine.calculateVaR(returns, 0.95);
    const cvar95 = engine.calculateCVaR(returns, 0.95);

    expect(var95).toBeLessThan(0);
    expect(cvar95).toBeLessThan(var95);
  });

  it("should assess position risk", () => {
    const position = engine.assessPositionRisk(
      "AAPL",
      100,
      100,
      102,
      10000,
      99,
      105
    );

    expect(position.symbol).toBe("AAPL");
    expect(position.unrealizedPL).toBeGreaterThan(0);
    expect(position.riskRewardRatio).toBeGreaterThan(0);
  });

  it("should detect risk violations", () => {
    const position = {
      symbol: "AAPL",
      quantity: 100,
      entryPrice: 100,
      currentPrice: 102,
      positionValue: 10200,
      unrealizedPL: 200,
      percentOfPortfolio: 0.15,
      riskPercentage: 0.02,
      recommendedStopLoss: 99,
      recommendedTakeProfit: 105,
      riskRewardRatio: 2,
    };

    const violations = engine.checkRiskViolations(position, 10000, 300);

    expect(Array.isArray(violations)).toBe(true);
  });
});

describe("Performance Filters Engine", () => {
  let engine = getPerformanceFiltersEngine();

  beforeEach(() => {
    engine = getPerformanceFiltersEngine();
  });

  it("should apply volatility filter", () => {
    const result = engine.applyVolatilityFilter(0.8, 30);

    expect(result.confidence).toBeLessThan(0.8);
    expect(result.reason).toBeDefined();
  });

  it("should apply market hours filter", () => {
    const result = engine.applyMarketHoursFilter(0.8, Date.now());

    expect(result.confidence).toBeDefined();
  });

  it("should apply signal strength filter", () => {
    const result = engine.applySignalStrengthFilter(0.8);

    expect(result.shouldTrade).toBe(true);
  });

  it("should apply correlation filter", () => {
    const positions = [{ symbol: "MSFT", correlation: 0.8 }];
    const result = engine.applyCorrelationFilter("AAPL", 0.8, positions);

    expect(result.confidence).toBeLessThan(0.8);
  });

  it("should calculate profit targets", () => {
    const targets = engine.calculateProfitTargets(100, 0.8);

    expect(targets.length).toBeGreaterThan(0);
    expect(targets[0]).toBeGreaterThan(100);
  });

  it("should calculate stop loss", () => {
    const stopLoss = engine.calculateStopLoss(100, 0.15);

    expect(stopLoss).toBeLessThan(100);
  });

  it("should apply all filters", () => {
    const marketConditions: MarketConditions = {
      vixLevel: 20,
      marketTrend: "BULLISH",
      volatility: 0.15,
      isMarketHours: true,
      dayOfWeek: 3,
      timeOfDay: 14,
    };

    const result = engine.applyAllFilters(
      "AAPL",
      0.8,
      100,
      marketConditions,
      []
    );

    expect(result.symbol).toBe("AAPL");
    expect(result.filteredConfidence).toBeDefined();
    expect(result.shouldTrade).toBeDefined();
  });

  it("should reset daily counter", () => {
    engine.resetDailyCounter();
    const stats = engine.getFilterStats();

    expect(stats.tradesExecutedToday).toBe(0);
  });
});
