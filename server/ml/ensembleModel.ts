/**
 * Ensemble Model - Combines LSTM and XGBoost Predictions
 * 
 * Implements an ensemble method that combines predictions from multiple
 * models (LSTM, XGBoost) to improve accuracy and robustness.
 * 
 * Features:
 * - Weighted averaging of model predictions
 * - Dynamic weight adjustment based on model performance
 * - Confidence aggregation
 * - Model disagreement detection
 */

import { getLSTMModel, type LSTMPrediction } from "./lstmModel";
import { getXGBoostModel, type XGBoostPrediction, type FeatureSet } from "./xgboostModel";

export interface EnsemblePrediction {
  symbol: string;
  timestamp: number;
  currentPrice: number;
  predictedPrice: number;
  predictedMove: number;
  confidence: number;
  direction: "UP" | "DOWN" | "NEUTRAL";
  modelAgreement: number;
  lstmPrediction: LSTMPrediction | null;
  xgboostPrediction: XGBoostPrediction | null;
  priceTarget: number;
  stopLoss: number;
  recommendedAction: "BUY" | "SELL" | "HOLD";
}

export interface ModelWeights {
  lstm: number;
  xgboost: number;
}

/**
 * Ensemble Model combining LSTM and XGBoost
 */
export class EnsembleModel {
  private lstmModel = getLSTMModel();
  private xgboostModel = getXGBoostModel();
  private modelWeights: ModelWeights = {
    lstm: 0.5,
    xgboost: 0.5,
  };
  private modelPerformance: Record<string, number> = {
    lstm: 0.5,
    xgboost: 0.5,
  };
  private predictionHistory: Array<{
    predicted: number;
    actual: number;
    model: string;
  }> = [];

  /**
   * Make ensemble prediction
   */
  predict(
    symbol: string,
    currentPrice: number,
    priceHistory: number[],
    indicators: {
      rsi: number;
      macd: number;
      bollingerBandPosition: number;
      volumeRatio: number;
    },
    features: FeatureSet
  ): EnsemblePrediction {
    const lstmResult = this.lstmModel.predict(priceHistory, indicators);
    const xgboostResult = this.xgboostModel.predict(features);

    const lstmWeight = this.modelWeights.lstm;
    const xgboostWeight = this.modelWeights.xgboost;

    const lstmPrice = lstmResult.predictedPrice;
    const xgboostMove = xgboostResult.predictedMove;
    const xgboostPrice = currentPrice * (1 + xgboostMove);

    const ensemblePredictedPrice =
      lstmPrice * lstmWeight + xgboostPrice * xgboostWeight;

    const ensembleConfidence =
      lstmResult.confidence * lstmWeight +
      xgboostResult.confidence * xgboostWeight;

    const priceDiff = Math.abs(lstmPrice - xgboostPrice);
    const avgPrice = (lstmPrice + xgboostPrice) / 2;
    const priceDeviation = priceDiff / avgPrice;
    const modelAgreement = Math.max(0, 1 - priceDeviation);

    const predictedMove = (ensemblePredictedPrice - currentPrice) / currentPrice;
    let direction: "UP" | "DOWN" | "NEUTRAL" = "NEUTRAL";
    if (predictedMove > 0.01) direction = "UP";
    else if (predictedMove < -0.01) direction = "DOWN";

    const priceTarget = currentPrice + (ensemblePredictedPrice - currentPrice) * 1.5;
    const stopLoss =
      currentPrice - Math.abs(ensemblePredictedPrice - currentPrice) * 0.5;

    let recommendedAction: "BUY" | "SELL" | "HOLD" = "HOLD";
    if (
      direction === "UP" &&
      ensembleConfidence > 0.6 &&
      modelAgreement > 0.7
    ) {
      recommendedAction = "BUY";
    } else if (
      direction === "DOWN" &&
      ensembleConfidence > 0.6 &&
      modelAgreement > 0.7
    ) {
      recommendedAction = "SELL";
    }

    return {
      symbol,
      timestamp: Date.now(),
      currentPrice,
      predictedPrice: ensemblePredictedPrice,
      predictedMove,
      confidence: ensembleConfidence,
      direction,
      modelAgreement,
      lstmPrediction: {
        symbol,
        timestamp: Date.now(),
        currentPrice,
        predictedPrice: lstmPrice,
        confidence: lstmResult.confidence,
        direction: lstmResult.direction,
        priceTarget: lstmPrice * 1.05,
        stopLoss: lstmPrice * 0.95,
        timeframe: "1D",
      },
      xgboostPrediction: {
        symbol,
        timestamp: Date.now(),
        predictedMove: xgboostMove,
        confidence: xgboostResult.confidence,
        featureImportance: {},
        topFeatures: [],
      },
      priceTarget,
      stopLoss,
      recommendedAction,
    };
  }

  /**
   * Update model weights based on prediction accuracy
   */
  updateWeights(actualMove: number, predictions: EnsemblePrediction): void {
    const lstmError = Math.abs(
      (predictions.lstmPrediction?.predictedPrice || predictions.currentPrice) -
        (predictions.currentPrice * (1 + actualMove))
    );
    const xgboostError = Math.abs(
      (predictions.currentPrice * (1 + (predictions.xgboostPrediction?.predictedMove || 0))) -
        (predictions.currentPrice * (1 + actualMove))
    );

    const totalError = Math.max(lstmError + xgboostError, 0.001);
    this.modelPerformance.lstm =
      (this.modelPerformance.lstm * 0.9 + (1 - lstmError / totalError) * 0.1);
    this.modelPerformance.xgboost =
      (this.modelPerformance.xgboost * 0.9 + (1 - xgboostError / totalError) * 0.1);

    const totalPerformance =
      this.modelPerformance.lstm + this.modelPerformance.xgboost;
    this.modelWeights.lstm = this.modelPerformance.lstm / totalPerformance;
    this.modelWeights.xgboost = this.modelPerformance.xgboost / totalPerformance;
  }

  /**
   * Get model weights
   */
  getWeights(): ModelWeights {
    return { ...this.modelWeights };
  }

  /**
   * Get model performance metrics
   */
  getPerformance(): Record<string, number> {
    return { ...this.modelPerformance };
  }

  /**
   * Add prediction to history for analysis
   */
  recordPrediction(
    predicted: number,
    actual: number,
    model: string
  ): void {
    this.predictionHistory.push({ predicted, actual, model });
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory = this.predictionHistory.slice(-1000);
    }
  }

  /**
   * Calculate ensemble accuracy
   */
  calculateAccuracy(): number {
    if (this.predictionHistory.length === 0) return 0;

    let correct = 0;
    this.predictionHistory.forEach(({ predicted, actual }) => {
      const predictedDirection = predicted > 0 ? 1 : -1;
      const actualDirection = actual > 0 ? 1 : -1;
      if (predictedDirection === actualDirection) correct++;
    });

    return correct / this.predictionHistory.length;
  }

  /**
   * Get ensemble model info
   */
  getModelInfo() {
    return {
      name: "Ensemble Model v1.0",
      models: ["LSTM", "XGBoost"],
      weights: this.modelWeights,
      performance: this.modelPerformance,
      accuracy: this.calculateAccuracy(),
      predictionCount: this.predictionHistory.length,
    };
  }
}

let modelInstance: EnsembleModel | null = null;

export function getEnsembleModel(): EnsembleModel {
  if (!modelInstance) {
    modelInstance = new EnsembleModel();
  }
  return modelInstance;
}

export async function predictWithEnsemble(
  symbol: string,
  currentPrice: number,
  priceHistory: number[],
  indicators: {
    rsi: number;
    macd: number;
    bollingerBandPosition: number;
    volumeRatio: number;
  },
  features: FeatureSet
): Promise<EnsemblePrediction> {
  const model = getEnsembleModel();
  return model.predict(symbol, currentPrice, priceHistory, indicators, features);
}

