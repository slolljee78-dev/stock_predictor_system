/**
 * Sentiment Indicator Component
 * Displays sentiment score and classification for a stock
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentIndicatorProps {
  sentimentScore: number; // -1 to 1
  confidence: number; // 0-100
  articleCount: number;
  classification?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  compact?: boolean;
}

export function SentimentIndicator({
  sentimentScore,
  confidence,
  articleCount,
  classification,
  compact = false,
}: SentimentIndicatorProps) {
  // Determine classification if not provided
  const getClassification = (score: number): SentimentIndicatorProps['classification'] => {
    if (score < -0.6) return 'very_negative';
    if (score < -0.2) return 'negative';
    if (score < 0.2) return 'neutral';
    if (score < 0.6) return 'positive';
    return 'very_positive';
  };

  const cls = classification || getClassification(sentimentScore);

  // Get color and icon based on classification
  const getStyleConfig = (classification: string | undefined) => {
    switch (classification) {
      case 'very_negative':
        return {
          color: 'bg-red-100 text-red-900',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-600',
          icon: TrendingDown,
          label: 'Very Negative',
          emoji: '⚠️',
        };
      case 'negative':
        return {
          color: 'bg-orange-100 text-orange-900',
          borderColor: 'border-orange-200',
          badgeColor: 'bg-orange-600',
          icon: TrendingDown,
          label: 'Negative',
          emoji: '📉',
        };
      case 'neutral':
        return {
          color: 'bg-gray-100 text-gray-900',
          borderColor: 'border-gray-200',
          badgeColor: 'bg-gray-600',
          icon: Minus,
          label: 'Neutral',
          emoji: '➡️',
        };
      case 'positive':
        return {
          color: 'bg-lime-100 text-lime-900',
          borderColor: 'border-lime-200',
          badgeColor: 'bg-lime-600',
          icon: TrendingUp,
          label: 'Positive',
          emoji: '📈',
        };
      case 'very_positive':
        return {
          color: 'bg-green-100 text-green-900',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-600',
          icon: TrendingUp,
          label: 'Very Positive',
          emoji: '🚀',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-900',
          borderColor: 'border-gray-200',
          badgeColor: 'bg-gray-600',
          icon: Minus,
          label: 'Unknown',
          emoji: '❓',
        };
    }
  };

  const style = getStyleConfig(cls);
  const Icon = style.icon;

  // Calculate percentage (0-100)
  const percentage = Math.round((sentimentScore + 1) / 2 * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{style.emoji}</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600">{style.label}</span>
          <span className="text-sm font-bold">{percentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border ${style.borderColor}`}>
      <CardContent className={`p-4 ${style.color}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{style.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm">Market Sentiment</h3>
                <p className="text-xs opacity-75">{articleCount} articles analyzed</p>
              </div>
            </div>
            <Icon className="w-5 h-5" />
          </div>

          {/* Sentiment Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Sentiment Score</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${style.badgeColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Classification Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {style.label}
            </Badge>
            <span className="text-xs font-medium opacity-75">
              Confidence: {confidence}%
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-current border-opacity-10">
            <div>
              <p className="opacity-75">Score</p>
              <p className="font-semibold">{sentimentScore.toFixed(2)}</p>
            </div>
            <div>
              <p className="opacity-75">Confidence</p>
              <p className="font-semibold">{confidence}%</p>
            </div>
            <div>
              <p className="opacity-75">Articles</p>
              <p className="font-semibold">{articleCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline Sentiment Badge - Compact version for lists
 */
export function SentimentBadge({
  sentimentScore,
  classification,
  showLabel = true,
}: {
  sentimentScore: number;
  classification?: string;
  showLabel?: boolean;
}) {
  const getClassification = (score: number): string => {
    if (score < -0.6) return 'very_negative';
    if (score < -0.2) return 'negative';
    if (score < 0.2) return 'neutral';
    if (score < 0.6) return 'positive';
    return 'very_positive';
  };

  const cls: string = classification || getClassification(sentimentScore);

  const config: Record<string, { emoji: string; color: string; label: string }> = {
    very_negative: { emoji: '⚠️', color: 'bg-red-100 text-red-700', label: 'Very Negative' },
    negative: { emoji: '📉', color: 'bg-orange-100 text-orange-700', label: 'Negative' },
    neutral: { emoji: '➡️', color: 'bg-gray-100 text-gray-700', label: 'Neutral' },
    positive: { emoji: '📈', color: 'bg-lime-100 text-lime-700', label: 'Positive' },
    very_positive: { emoji: '🚀', color: 'bg-green-100 text-green-700', label: 'Very Positive' },
  };

  const style = config[cls as keyof typeof config] || config.neutral;

  return (
    <Badge className={`${style.color} gap-1`}>
      <span>{style.emoji}</span>
      {showLabel && <span className="text-xs">{style.label}</span>}
    </Badge>
  );
}
