import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface AutomationConfigProps {
  sessionId: string;
}

export const AutomationConfig: React.FC<AutomationConfigProps> = ({ sessionId }) => {
  const [enabled, setEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [tradingFrequency, setTradingFrequency] = useState<'15min' | '5min' | 'hourly' | 'daily' | 'realtime'>('15min');
  const [maxPositionsPerDay, setMaxPositionsPerDay] = useState(6);
  const [positionSizePercent, setPositionSizePercent] = useState(2);
  const [stopLossPercent, setStopLossPercent] = useState(2);
  const [takeProfitPercent, setTakeProfitPercent] = useState(3);

  const getConfigQuery = trpc.automation.getConfig.useQuery({ sessionId });
  const updateConfigMutation = trpc.automation.updateConfig.useMutation();

  useEffect(() => {
    if (getConfigQuery.data) {
      const config = getConfigQuery.data;
      setEnabled(config.enabled);
      setConfidenceThreshold(config.confidenceThreshold);
      setTradingFrequency(config.tradingFrequency);
      setMaxPositionsPerDay(config.maxPositionsPerDay);
      setPositionSizePercent(config.positionSizePercent);
      setStopLossPercent(config.stopLossPercent);
      setTakeProfitPercent(config.takeProfitPercent);
    }
  }, [getConfigQuery.data]);

  const handleSave = async () => {
    await updateConfigMutation.mutateAsync({
      sessionId,
      config: {
        enabled,
        confidenceThreshold,
        tradingFrequency,
        maxPositionsPerDay,
        positionSizePercent,
        stopLossPercent,
        takeProfitPercent,
      },
    });
  };

  return (
    <div className="card-premium p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Automation Settings</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Enable Automation</span>
        </label>
      </div>

      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Confidence Threshold */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Confidence Threshold: {confidenceThreshold}%
            </label>
            <input
              type="range"
              min="60"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Only execute trades with confidence above this threshold
            </p>
          </div>

          {/* Trading Frequency */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Trading Frequency</label>
            <select
              value={tradingFrequency}
              onChange={(e) => setTradingFrequency(e.target.value as any)}
              className="input-premium w-full"
            >
              <option value="realtime">Real-time (1s)</option>
              <option value="5min">Every 5 minutes</option>
              <option value="15min">Every 15 minutes</option>
              <option value="hourly">Every hour</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* Max Positions Per Day */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Max Positions Per Day: {maxPositionsPerDay}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={maxPositionsPerDay}
              onChange={(e) => setMaxPositionsPerDay(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Position Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Position Size: {positionSizePercent}% of capital
            </label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={positionSizePercent}
              onChange={(e) => setPositionSizePercent(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Stop Loss */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Stop Loss: {stopLossPercent}%
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Take Profit */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Take Profit: {takeProfitPercent}%
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={takeProfitPercent}
              onChange={(e) => setTakeProfitPercent(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={updateConfigMutation.isPending}
        className="btn-premium w-full"
      >
        {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
      </button>

      {updateConfigMutation.isSuccess && (
        <p className="text-sm text-green-600">Configuration saved successfully!</p>
      )}
    </div>
  );
};
