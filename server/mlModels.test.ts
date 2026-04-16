import { describe, it, expect } from "vitest";
import {
  generateMLPrediction,
  calculateModelMetrics,
  retrainModels,
  predictWithLSTM,
  predictWithXGBoost,
  predictWithEnsemble,
} from "./mlModels";

interface PricePoint {
  date: Date;
  close: number;
  volume: number;
}

describe("ML Models", () => {
  // Generate test data
  const generatePriceData = (count: number, startPrice: number = 100): PricePoint[] => {
    const data: PricePoint[] = [];
    let price = startPrice;

    for (let i = 0; i < count; i++) {
      price = price * (1 + (Math.random() - 0.5) * 0.02); // Random walk
      data.push({
        date: new Date(Date.now() - (count - i) * 86400000),
        close: price,
        volume: 1000000 + Math.random() * 500000,
      });
    }

    return data;
  };

  describe("LSTM Prediction", () => {
    it("should predict next price based on momentum", () => {
      const data = generatePriceData(30, 100);
      const prediction = predictWithLSTM(data);

      expect(prediction).toBeGreaterThan(0);
      expect(typeof prediction).toBe("number");
    });

    it("should handle insufficient data", () => {
      const data = generatePriceData(5, 100);
      const prediction = predictWithLSTM(data);

      expect(prediction).toBe(data[data.length - 1].close);
    });

    it("should predict upward trend in uptrend", () => {
      const data: PricePoint[] = [];
      for (let i = 0; i < 20; i++) {
        data.push({
          date: new Date(),
          close: 100 + i * 2,
          volume: 1000000,
        });
      }

      const prediction = predictWithLSTM(data);
      expect(prediction).toBeGreaterThan(data[data.length - 1].close);
    });

    it("should predict downward trend in downtrend", () => {
      const data: PricePoint[] = [];
      for (let i = 0; i < 20; i++) {
        data.push({
          date: new Date(),
          close: 100 - i * 2,
          volume: 1000000,
        });
      }

      const prediction = predictWithLSTM(data);
      expect(prediction).toBeLessThan(data[data.length - 1].close);
    });
  });

  describe("XGBoost Prediction", () => {
    it("should predict next price using features", () => {
      const data = generatePriceData(30, 100);
      const prediction = predictWithXGBoost(data);

      expect(prediction).toBeGreaterThan(0);
      expect(typeof prediction).toBe("number");
    });

    it("should handle insufficient data", () => {
      const data = generatePriceData(5, 100);
      const prediction = predictWithXGBoost(data);

      expect(prediction).toBe(data[data.length - 1].close);
    });

    it("should incorporate volume information", () => {
      const data: PricePoint[] = [];
      for (let i = 0; i < 20; i++) {
        data.push({
          date: new Date(),
          close: 100,
          volume: i < 10 ? 1000000 : 5000000, // Volume spike in second half
        });
      }

      const prediction = predictWithXGBoost(data);
      expect(prediction).toBeGreaterThan(0);
    });
  });

  describe("Ensemble Prediction", () => {
    it("should average LSTM and XGBoost predictions", () => {
      const data = generatePriceData(30, 100);
      const lstm = predictWithLSTM(data);
      const xgboost = predictWithXGBoost(data);
      const ensemble = predictWithEnsemble(data);

      // Ensemble should be between LSTM and XGBoost
      const min = Math.min(lstm, xgboost);
      const max = Math.max(lstm, xgboost);

      expect(ensemble).toBeGreaterThanOrEqual(min * 0.95);
      expect(ensemble).toBeLessThanOrEqual(max * 1.05);
    });

    it("should handle insufficient data", () => {
      const data = generatePriceData(5, 100);
      const prediction = predictWithEnsemble(data);

      expect(prediction).toBe(data[data.length - 1].close);
    });
  });

  describe("ML Prediction Generation", () => {
    it("should generate ML prediction with direction", () => {
      const data = generatePriceData(30, 100);
      const prediction = generateMLPrediction(data);

      expect(prediction.nextPrice).toBeGreaterThan(0);
      expect(["up", "down", "neutral"]).toContain(prediction.direction);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(100);
      expect(prediction.probability).toBeGreaterThanOrEqual(0);
      expect(prediction.probability).toBeLessThanOrEqual(1);
    });

    it("should predict up direction in strong uptrend", () => {
      const data: PricePoint[] = [];
      for (let i = 0; i < 30; i++) {
        data.push({
          date: new Date(),
          close: 100 + i * 3,
          volume: 1000000,
        });
      }

      const prediction = generateMLPrediction(data);
      expect(prediction.direction).toBe("up");
      expect(prediction.confidence).toBeGreaterThan(50);
    });

    it("should predict down direction in strong downtrend", () => {
      const data: PricePoint[] = [];
      for (let i = 0; i < 30; i++) {
        data.push({
          date: new Date(),
          close: 100 - i * 3,
          volume: 1000000,
        });
      }

      const prediction = generateMLPrediction(data);
      expect(prediction.direction).toBe("down");
      expect(prediction.confidence).toBeGreaterThan(50);
    });

    it("should have all model predictions", () => {
      const data = generatePriceData(30, 100);
      const prediction = generateMLPrediction(data);

      expect(prediction.models.lstm).toBeGreaterThan(0);
      expect(prediction.models.xgboost).toBeGreaterThan(0);
      expect(prediction.models.ensemble).toBeGreaterThan(0);
    });

    it("should handle insufficient data", () => {
      const data = generatePriceData(5, 100);
      const prediction = generateMLPrediction(data);

      expect(prediction.nextPrice).toBe(data[data.length - 1].close);
      expect(prediction.confidence).toBe(0);
      expect(prediction.direction).toBe("neutral");
    });
  });

  describe("Model Metrics", () => {
    it("should calculate accuracy correctly", () => {
      const data = generatePriceData(50, 100);
      const predictions = data.slice(0, -1).map(() => generateMLPrediction(data));
      const actualPrices = data.map((d) => d.close);

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracy).toBeLessThanOrEqual(1);
    });

    it("should calculate precision and recall", () => {
      const data = generatePriceData(50, 100);
      const predictions = data.slice(0, -1).map(() => generateMLPrediction(data));
      const actualPrices = data.map((d) => d.close);

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.precision).toBeLessThanOrEqual(1);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeLessThanOrEqual(1);
    });

    it("should calculate F1 score", () => {
      const data = generatePriceData(50, 100);
      const predictions = data.slice(0, -1).map(() => generateMLPrediction(data));
      const actualPrices = data.map((d) => d.close);

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.f1Score).toBeGreaterThanOrEqual(0);
      expect(metrics.f1Score).toBeLessThanOrEqual(1);
    });

    it("should calculate Sharpe ratio", () => {
      const data = generatePriceData(50, 100);
      const predictions = data.slice(0, -1).map(() => generateMLPrediction(data));
      const actualPrices = data.map((d) => d.close);

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(typeof metrics.sharpeRatio).toBe("number");
    });

    it("should calculate max drawdown", () => {
      const data: PricePoint[] = [];
      for (let i = 0; i < 50; i++) {
        data.push({
          date: new Date(),
          close: 100 + (i < 25 ? i : 50 - i), // Peak at 25
          volume: 1000000,
        });
      }

      const predictions = data.slice(0, -1).map(() => generateMLPrediction(data));
      const actualPrices = data.map((d) => d.close);

      const metrics = calculateModelMetrics(predictions, actualPrices);

      expect(metrics.maxDrawdown).toBeGreaterThan(0);
      expect(metrics.maxDrawdown).toBeLessThanOrEqual(1);
    });

    it("should handle empty data", () => {
      const metrics = calculateModelMetrics([], []);

      expect(metrics.accuracy).toBe(0);
      expect(metrics.precision).toBe(0);
      expect(metrics.recall).toBe(0);
      expect(metrics.f1Score).toBe(0);
      expect(metrics.sharpeRatio).toBe(0);
      expect(metrics.maxDrawdown).toBe(0);
    });
  });

  describe("Model Retraining", () => {
    it("should retrain models successfully", () => {
      const data = generatePriceData(100, 100);
      const result = retrainModels(data);

      expect(result.trained).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should return current timestamp", () => {
      const data = generatePriceData(100, 100);
      const before = new Date();
      const result = retrainModels(data);
      const after = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });
  });
});
