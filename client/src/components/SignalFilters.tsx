import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw } from 'lucide-react';

export interface SignalFilterOptions {
  signalType: 'all' | 'buy' | 'sell';
  minConfidence: number;
  rsiMin: number;
  rsiMax: number;
  macdFilter: 'all' | 'positive' | 'negative';
  priceChangeMin: number;
  priceChangeMax: number;
  sortBy: 'confidence' | 'price' | 'time' | 'rsi' | 'change';
}

export const DEFAULT_FILTERS: SignalFilterOptions = {
  signalType: 'all',
  minConfidence: 60,
  rsiMin: 0,
  rsiMax: 100,
  macdFilter: 'all',
  priceChangeMin: -100,
  priceChangeMax: 100,
  sortBy: 'confidence',
};

export const FILTER_PRESETS: Record<string, { name: string; filters: SignalFilterOptions }> = {
  highConfidence: {
    name: 'High Confidence',
    filters: {
      ...DEFAULT_FILTERS,
      minConfidence: 80,
    },
  },
  oversold: {
    name: 'Oversold (RSI < 30)',
    filters: {
      ...DEFAULT_FILTERS,
      rsiMin: 0,
      rsiMax: 30,
      signalType: 'buy' as const,
    },
  },
  overbought: {
    name: 'Overbought (RSI > 70)',
    filters: {
      ...DEFAULT_FILTERS,
      rsiMin: 70,
      rsiMax: 100,
      signalType: 'sell' as const,
    },
  },
  bullish: {
    name: 'Bullish (Buy + Positive MACD)',
    filters: {
      ...DEFAULT_FILTERS,
      signalType: 'buy' as const,
      macdFilter: 'positive' as const,
    },
  },
  bearish: {
    name: 'Bearish (Sell + Negative MACD)',
    filters: {
      ...DEFAULT_FILTERS,
      signalType: 'sell' as const,
      macdFilter: 'negative' as const,
    },
  },
};

interface SignalFiltersProps {
  filters: SignalFilterOptions;
  onFiltersChange: (filters: SignalFilterOptions) => void;
  onClose?: () => void;
}

export function SignalFilters({ filters, onFiltersChange, onClose }: SignalFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SignalFilterOptions>(filters);
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SignalFilterOptions, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleResetFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  };

  const applyPreset = (presetKey: keyof typeof FILTER_PRESETS) => {
    const preset = FILTER_PRESETS[presetKey];
    setLocalFilters(preset.filters);
    onFiltersChange(preset.filters);
  };

  const isFiltered = JSON.stringify(localFilters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <div className="flex gap-2">
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-8"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Presets */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={
                  JSON.stringify(localFilters) === JSON.stringify(preset.filters)
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => applyPreset(key as keyof typeof FILTER_PRESETS)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Basic Filters */}
        <div className="space-y-4">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'basic' ? null : 'basic')
            }
            className="w-full text-left font-semibold text-sm text-foreground hover:text-cyan-400 transition-colors"
          >
            {expandedSection === 'basic' ? '▼' : '▶'} Basic Filters
          </button>

          {expandedSection === 'basic' && (
            <div className="space-y-4 pl-4">
              {/* Signal Type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Signal Type
                </label>
                <Select
                  value={localFilters.signalType}
                  onValueChange={(value: any) =>
                    handleFilterChange('signalType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Signals</SelectItem>
                    <SelectItem value="buy">Buy Only</SelectItem>
                    <SelectItem value="sell">Sell Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Threshold */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Min Confidence: {localFilters.minConfidence}%
                </label>
                <Slider
                  value={[localFilters.minConfidence]}
                  onValueChange={(value) =>
                    handleFilterChange('minConfidence', value[0])
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Sort By
                </label>
                <Select
                  value={localFilters.sortBy}
                  onValueChange={(value: any) =>
                    handleFilterChange('sortBy', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confidence">Confidence (High to Low)</SelectItem>
                    <SelectItem value="price">Price (High to Low)</SelectItem>
                    <SelectItem value="time">Time (Newest First)</SelectItem>
                    <SelectItem value="rsi">RSI (Extreme Values)</SelectItem>
                    <SelectItem value="change">Price Change (Largest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Technical Indicators */}
        <div className="space-y-4">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'indicators' ? null : 'indicators')
            }
            className="w-full text-left font-semibold text-sm text-foreground hover:text-cyan-400 transition-colors"
          >
            {expandedSection === 'indicators' ? '▼' : '▶'} Technical Indicators
          </button>

          {expandedSection === 'indicators' && (
            <div className="space-y-4 pl-4">
              {/* RSI Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    RSI (14) Range
                  </label>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {localFilters.rsiMin}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {localFilters.rsiMax}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[localFilters.rsiMin]}
                    onValueChange={(value) =>
                      handleFilterChange('rsiMin', value[0])
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <Slider
                    value={[localFilters.rsiMax]}
                    onValueChange={(value) =>
                      handleFilterChange('rsiMax', value[0])
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <p>RSI Zones: Oversold (&lt;30) | Normal (30-70) | Overbought (&gt;70)</p>
                </div>
              </div>

              {/* MACD Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  MACD
                </label>
                <Select
                  value={localFilters.macdFilter}
                  onValueChange={(value: any) =>
                    handleFilterChange('macdFilter', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All (Positive & Negative)</SelectItem>
                    <SelectItem value="positive">Positive (Bullish)</SelectItem>
                    <SelectItem value="negative">Negative (Bearish)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Price Action */}
        <div className="space-y-4">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'price' ? null : 'price')
            }
            className="w-full text-left font-semibold text-sm text-foreground hover:text-cyan-400 transition-colors"
          >
            {expandedSection === 'price' ? '▼' : '▶'} Price Action
          </button>

          {expandedSection === 'price' && (
            <div className="space-y-4 pl-4">
              {/* Price Change Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Price Change (%)
                  </label>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        localFilters.priceChangeMin < 0
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {localFilters.priceChangeMin > 0 ? '+' : ''}
                      {localFilters.priceChangeMin}%
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        localFilters.priceChangeMax < 0
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {localFilters.priceChangeMax > 0 ? '+' : ''}
                      {localFilters.priceChangeMax}%
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[localFilters.priceChangeMin]}
                    onValueChange={(value) =>
                      handleFilterChange('priceChangeMin', value[0])
                    }
                    min={-100}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <Slider
                    value={[localFilters.priceChangeMax]}
                    onValueChange={(value) =>
                      handleFilterChange('priceChangeMax', value[0])
                    }
                    min={-100}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {isFiltered && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {localFilters.signalType !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {localFilters.signalType === 'buy' ? '📈 Buy' : '📉 Sell'}
                </Badge>
              )}
              {localFilters.minConfidence > DEFAULT_FILTERS.minConfidence && (
                <Badge variant="secondary" className="text-xs">
                  Confidence ≥ {localFilters.minConfidence}%
                </Badge>
              )}
              {(localFilters.rsiMin > 0 || localFilters.rsiMax < 100) && (
                <Badge variant="secondary" className="text-xs">
                  RSI {localFilters.rsiMin}-{localFilters.rsiMax}
                </Badge>
              )}
              {localFilters.macdFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  MACD {localFilters.macdFilter === 'positive' ? '+' : '-'}
                </Badge>
              )}
              {(localFilters.priceChangeMin > -100 ||
                localFilters.priceChangeMax < 100) && (
                <Badge variant="secondary" className="text-xs">
                  Change {localFilters.priceChangeMin > 0 ? '+' : ''}
                  {localFilters.priceChangeMin}% to{' '}
                  {localFilters.priceChangeMax > 0 ? '+' : ''}
                  {localFilters.priceChangeMax}%
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
