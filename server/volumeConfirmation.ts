/**
 * Volume Confirmation for Trading Signals
 * 
 * Validates trading signals by checking if they're supported by above-average volume.
 * High-volume moves are more likely to be genuine trends vs. noise.
 */

export interface VolumeData {
  volume: number;
  avgVolume20Day: number;
  avgVolume50Day: number;
  price: number;
  previousClose: number;
}

export interface VolumeConfirmationResult {
  isConfirmed: boolean;
  volumeRatio: number; // Current volume / 20-day average
  volumeStrength: 'very_weak' | 'weak' | 'normal' | 'strong' | 'very_strong';
  confidence: number; // 0-1, how confident we are in the signal based on volume
  reason: string;
}

/**
 * Check if signal is confirmed by volume
 * 
 * Rules:
 * - Buy signal needs volume > 1.2x average (at least 20% above average)
 * - Sell signal needs volume > 1.5x average (at least 50% above average)
 * - Breakout signals need volume > 2x average
 */
export function confirmSignalWithVolume(
  signalType: 'buy' | 'sell' | 'hold' | 'breakout',
  volumeData: VolumeData
): VolumeConfirmationResult {
  const volumeRatio = volumeData.volume / volumeData.avgVolume20Day;
  const priceChange = ((volumeData.price - volumeData.previousClose) / volumeData.previousClose) * 100;

  let isConfirmed = false;
  let minVolumeRatio = 1.0;
  let confidence = 0;
  let reason = '';

  switch (signalType) {
    case 'buy':
      // Buy signals should have above-average volume on up days
      if (priceChange > 0) {
        minVolumeRatio = 1.2; // 20% above average
        isConfirmed = volumeRatio >= minVolumeRatio;
        confidence = Math.min((volumeRatio - 1.0) / 0.5, 1); // Scale to 0-1
        reason = isConfirmed
          ? `Buy signal confirmed: volume ${(volumeRatio * 100).toFixed(0)}% of average on up day`
          : `Buy signal weak: volume only ${(volumeRatio * 100).toFixed(0)}% of average`;
      } else {
        // Buy signals on down days are weaker
        minVolumeRatio = 1.5;
        isConfirmed = volumeRatio >= minVolumeRatio;
        confidence = Math.min((volumeRatio - 1.0) / 0.7, 1) * 0.5; // Half confidence on down day
        reason = isConfirmed
          ? `Buy signal confirmed despite down day: high volume ${(volumeRatio * 100).toFixed(0)}%`
          : `Buy signal weak: down day with low volume`;
      }
      break;

    case 'sell':
      // Sell signals should have above-average volume on down days
      if (priceChange < 0) {
        minVolumeRatio = 1.3; // 30% above average
        isConfirmed = volumeRatio >= minVolumeRatio;
        confidence = Math.min((volumeRatio - 1.0) / 0.6, 1);
        reason = isConfirmed
          ? `Sell signal confirmed: volume ${(volumeRatio * 100).toFixed(0)}% of average on down day`
          : `Sell signal weak: volume only ${(volumeRatio * 100).toFixed(0)}% of average`;
      } else {
        // Sell signals on up days are weaker
        minVolumeRatio = 2.0;
        isConfirmed = volumeRatio >= minVolumeRatio;
        confidence = Math.min((volumeRatio - 1.0) / 1.0, 1) * 0.3; // Low confidence on up day
        reason = isConfirmed
          ? `Sell signal confirmed despite up day: very high volume ${(volumeRatio * 100).toFixed(0)}%`
          : `Sell signal weak: up day with low volume`;
      }
      break;

    case 'breakout':
      // Breakouts need very high volume
      minVolumeRatio = 2.0; // 100% above average
      isConfirmed = volumeRatio >= minVolumeRatio;
      confidence = Math.min((volumeRatio - 1.0) / 1.5, 1);
      reason = isConfirmed
        ? `Breakout confirmed: volume ${(volumeRatio * 100).toFixed(0)}% of average`
        : `Breakout weak: volume only ${(volumeRatio * 100).toFixed(0)}% of average`;
      break;

    case 'hold':
      // Hold signals don't require volume confirmation
      isConfirmed = true;
      confidence = 0.5;
      reason = 'Hold signal: no volume confirmation needed';
      break;
  }

  const volumeStrength = getVolumeStrength(volumeRatio);

  return {
    isConfirmed,
    volumeRatio,
    volumeStrength,
    confidence: Math.max(0, Math.min(1, confidence)),
    reason,
  };
}

/**
 * Classify volume strength
 */
function getVolumeStrength(volumeRatio: number): 'very_weak' | 'weak' | 'normal' | 'strong' | 'very_strong' {
  if (volumeRatio < 0.7) return 'very_weak';
  if (volumeRatio < 0.9) return 'weak';
  if (volumeRatio < 1.3) return 'normal';
  if (volumeRatio < 2.0) return 'strong';
  return 'very_strong';
}

/**
 * Adjust signal confidence based on volume
 * Use this to modify existing signal confidence scores
 */
export function adjustConfidenceByVolume(
  baseConfidence: number,
  volumeData: VolumeData,
  signalType: 'buy' | 'sell' | 'hold' | 'breakout'
): number {
  const confirmation = confirmSignalWithVolume(signalType, volumeData);

  if (!confirmation.isConfirmed) {
    // Reduce confidence if volume doesn't confirm
    return baseConfidence * 0.7;
  }

  // Boost confidence if volume confirms
  const volumeBoost = confirmation.confidence * 0.15; // Max 15% boost
  return Math.min(1, baseConfidence + volumeBoost);
}

/**
 * Get volume analysis for display
 */
export function getVolumeAnalysis(volumeData: VolumeData): {
  volumeRatio: number;
  volumeStrength: string;
  analysis: string;
} {
  const volumeRatio = volumeData.volume / volumeData.avgVolume20Day;
  const volumeStrength = getVolumeStrength(volumeRatio);

  let analysis = '';
  if (volumeRatio < 0.7) {
    analysis = 'Very low volume - signal may be unreliable';
  } else if (volumeRatio < 0.9) {
    analysis = 'Below-average volume - signal confidence reduced';
  } else if (volumeRatio < 1.3) {
    analysis = 'Normal volume - signal is neutral on volume';
  } else if (volumeRatio < 2.0) {
    analysis = 'Above-average volume - signal is supported';
  } else {
    analysis = 'Very high volume - strong signal confirmation';
  }

  return {
    volumeRatio,
    volumeStrength,
    analysis,
  };
}

/**
 * Calculate volume trend
 * Returns whether volume is increasing or decreasing
 */
export function getVolumeTrend(volumeData: VolumeData): 'increasing' | 'decreasing' | 'stable' {
  const ratio20 = volumeData.volume / volumeData.avgVolume20Day;
  const ratio50 = volumeData.volume / volumeData.avgVolume50Day;

  if (ratio20 > 1.2 && ratio50 > 1.1) {
    return 'increasing';
  } else if (ratio20 < 0.8 && ratio50 < 0.9) {
    return 'decreasing';
  }
  return 'stable';
}
