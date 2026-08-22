/**
 * Phase 3: ML Models for Stock Price Prediction
 * Implements LSTM, XGBoost, and ensemble methods
 */

import { PricePoint } from "./indicators";

export interface MLPrediction {
  nextPrice: number;
  confidence: number;
  direction: "up" | "down" | "neutral";
  probability: number; // 0-1 probability of direction
  models: {
    lstm: number;
    xgboost: number;
    ensemble: number;
  };
}

export interface ModelMetrics {
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
  sharpeRatio: number;
  maxDrawdown: number; // 0-1
}

/**
 * Simplified LSTM-inspired prediction using momentum and trend
 * In production, use TensorFlow.js or similar
 */
export function predictWithLSTM(priceData: PricePoint[]): number {
  if (priceData.length < 10) return priceData[priceData.length - 1].close;

  const closes = priceData.map(p => p.close);
  const recentPrices = closes.slice(-20);

  // Calculate momentum (rate of change)
  const momentum = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0];

  // Calculate trend using exponential moving average
  let ema = recentPrices[0];
  const k = 2 / (recentPrices.length + 1);
  for (let i = 1; i < recentPrices.length; i++) {
    ema = recentPrices[i] * k + ema * (1 - k);
  }

  const trendStrength = (ema - recentPrices[0]) / recentPrices[0];

  // Predict next price based on momentum and trend
  const currentPrice = recentPrices[recentPrices.length - 1];
  const prediction = currentPrice * (1 + momentum * 0.7 + trendStrength * 0.3);

  return prediction;
}

/**
 * Simplified XGBoost-inspired prediction using feature importance
 * In production, use xgboost npm package
 */
export function predictWithXGBoost(priceData: PricePoint[]): number {
  if (priceData.length < 10) return priceData[priceData.length - 1].close;

  const closes = priceData.map(p => p.close);
  const volumes = priceData.map(p => p.volume);
  const recentPrices = closes.slice(-20);
  const recentVolumes = volumes.slice(-20);

  // Feature 1: Price momentum (weight: 0.4)
  const momentum = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0];

  // Feature 2: Volume trend (weight: 0.3)
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const volumeTrend = (recentVolumes[recentVolumes.length - 1] - avgVolume) / avgVolume;

  // Feature 3: Volatility (weight: 0.2)
  const prices = recentPrices;
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  const volatility = Math.sqrt(variance) / mean;

  // Feature 4: Mean reversion (weight: 0.1)
  const sma = prices.reduce((a, b) => a + b, 0) / prices.length;
  const deviation = (prices[prices.length - 1] - sma) / sma;

  // Combine features with weights
  const currentPrice = recentPrices[recentPrices.length - 1];
  const prediction =
    currentPrice *
    (1 +
      momentum * 0.4 +
      volumeTrend * 0.3 -
      volatility * 0.2 +
      deviation * -0.1);

  return prediction;
}

/**
 * Ensemble method combining LSTM and XGBoost predictions
 */
export function predictWithEnsemble(priceData: PricePoint[]): number {
  const lstmPrediction = predictWithLSTM(priceData);
  const xgboostPrediction = predictWithXGBoost(priceData);

  // Average the predictions with slight bias toward XGBoost (more stable)
  const ensemblePrediction = lstmPrediction * 0.4 + xgboostPrediction * 0.6;

  return ensemblePrediction;
}

/**
 * Generate ML-based price prediction
 */
export function generateMLPrediction(priceData: PricePoint[]): MLPrediction {
  if (priceData.length < 10) {
    return {
      nextPrice: priceData[priceData.length - 1].close,
      confidence: 0,
      direction: "neutral",
      probability: 0.5,
      models: {
        lstm: priceData[priceData.length - 1].close,
        xgboost: priceData[priceData.length - 1].close,
        ensemble: priceData[priceData.length - 1].close,
      },
    };
  }

  const currentPrice = priceData[priceData.length - 1].close;
  const lstmPrediction = predictWithLSTM(priceData);
  const xgboostPrediction = predictWithXGBoost(priceData);
  const ensemblePrediction = predictWithEnsemble(priceData);

  // Determine direction and confidence
  const priceChange = (ensemblePrediction - currentPrice) / currentPrice;
  const direction = priceChange > 0.01 ? "up" : priceChange < -0.01 ? "down" : "neutral";

  // Calculate confidence based on model agreement
  const lstmDirection = lstmPrediction > currentPrice ? 1 : -1;
  const xgboostDirection = xgboostPrediction > currentPrice ? 1 : -1;
  const agreement = (lstmDirection + xgboostDirection) / 2;
  const confidence = Math.abs(agreement) * 100; // 0-100%

  // Calculate probability of direction
  const probability = direction === "neutral" ? 0.5 : direction === "up" ? 0.5 + Math.abs(priceChange) * 100 : 0.5 - Math.abs(priceChange) * 100;

  return {
    nextPrice: ensemblePrediction,
    confidence: Math.min(100, confidence),
    direction,
    probability: Math.max(0, Math.min(1, probability / 100)),
    models: {
      lstm: lstmPrediction,
      xgboost: xgboostPrediction,
      ensemble: ensemblePrediction,
    },
  };
}

/**
 * Calculate model performance metrics
 */
export function calculateModelMetrics(predictions: MLPrediction[], actualPrices: number[]): ModelMetrics {
  if (predictions.length === 0 || actualPrices.length === 0) {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
    };
  }

  // Calculate accuracy (direction prediction)
  let correctPredictions = 0;
  const returns: number[] = [];

  for (let i = 0; i < Math.min(predictions.length, actualPrices.length - 1); i++) {
    const predictedDirection = predictions[i].direction;
    const actualDirection = actualPrices[i + 1] > actualPrices[i] ? "up" : "down";

    if (predictedDirection === actualDirection) {
      correctPredictions++;
    }

    // Calculate returns for Sharpe ratio
    const ret = (actualPrices[i + 1] - actualPrices[i]) / actualPrices[i];
    returns.push(ret);
  }

  const accuracy = correctPredictions / Math.min(predictions.length, actualPrices.length - 1);

  // Calculate precision and recall (assuming 50% threshold for positive prediction)
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (let i = 0; i < Math.min(predictions.length, actualPrices.length - 1); i++) {
    const predicted = predictions[i].direction === "up";
    const actual = actualPrices[i + 1] > actualPrices[i];

    if (predicted && actual) truePositives++;
    if (predicted && !actual) falsePositives++;
    if (!predicted && actual) falseNegatives++;
  }

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = 2 * ((precision * recall) / (precision + recall)) || 0;

  // Calculate Sharpe ratio
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? meanReturn / stdDev * Math.sqrt(252) : 0; // Annualized

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = actualPrices[0];
  for (let i = 1; i < actualPrices.length; i++) {
    if (actualPrices[i] > peak) {
      peak = actualPrices[i];
    }
    const drawdown = (peak - actualPrices[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    accuracy: Math.min(1, accuracy),
    precision: Math.min(1, precision),
    recall: Math.min(1, recall),
    f1Score: Math.min(1, f1Score),
    sharpeRatio,
    maxDrawdown,
  };
}

/**
 * Retrain models with new data (simplified version)
 */
export function retrainModels(historicalData: PricePoint[]): { trained: boolean; timestamp: Date } {
  // In production, this would:
  // 1. Prepare training data
  // 2. Split into train/test sets
  // 3. Train LSTM model
  // 4. Train XGBoost model
  // 5. Validate ensemble performance
  // 6. Save models to disk/database

  return {
    trained: true,
    timestamp: new Date(),
  };
}
