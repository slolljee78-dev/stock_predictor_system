/**
 * Alert Preferences Panel Component
 * Allows users to configure alert settings for individual stocks
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Settings } from 'lucide-react';

interface AlertPreferencesPanelProps {
  stockId: number;
  ticker: string;
  onClose?: () => void;
}

export function AlertPreferencesPanel({ stockId, ticker, onClose }: AlertPreferencesPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [preferences, setPreferences] = useState({
    minBuyConfidence: 60,
    minSellConfidence: 60,
    enableBuyAlerts: true,
    enableSellAlerts: true,
    enableSentimentAlerts: true,
    notificationChannels: ['in_app'] as ('in_app' | 'email' | 'push')[],
    enablePushNotifications: false,
  });

  // Fetch preferences
  const { data: prefs } = trpc.alertPreferences.getPreferences.useQuery({ stockId });

  // Update preferences mutation
  const updateMutation = trpc.alertPreferences.updatePreferences.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // Load preferences when fetched
  useEffect(() => {
    if (prefs) {
      setPreferences(prev => ({
        ...prev,
        minBuyConfidence: prefs.minBuyConfidence ?? prev.minBuyConfidence,
        minSellConfidence: prefs.minSellConfidence ?? prev.minSellConfidence,
        enableBuyAlerts: prefs.enableBuyAlerts ?? prev.enableBuyAlerts,
        enableSellAlerts: prefs.enableSellAlerts ?? prev.enableSellAlerts,
        enableSentimentAlerts: prefs.enableSentimentAlerts ?? prev.enableSentimentAlerts,
        notificationChannels: (prefs.notificationChannels as ('in_app' | 'email' | 'push')[]) ?? prev.notificationChannels,
        enablePushNotifications: prefs.enablePushNotifications ?? prev.enablePushNotifications,
      }));
    }
  }, [prefs]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        stockId,
        ...preferences,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChannelToggle = (channel: 'in_app' | 'email' | 'push') => {
    setPreferences(prev => {
      const channels = prev.notificationChannels.includes(channel)
        ? prev.notificationChannels.filter(c => c !== channel)
        : [...prev.notificationChannels, channel];
      return { ...prev, notificationChannels: channels };
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Alert Settings: {ticker}
        </CardTitle>
        <CardDescription>Configure how you receive alerts for {ticker}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Buy Signal Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Buy Signal Alerts</label>
            <Switch
              checked={preferences.enableBuyAlerts}
              onCheckedChange={checked =>
                setPreferences(prev => ({ ...prev, enableBuyAlerts: checked }))
              }
            />
          </div>
          {preferences.enableBuyAlerts && (
            <div className="space-y-2 pl-4 border-l-2 border-green-200">
              <label className="text-xs text-gray-600">
                Minimum Confidence: {preferences.minBuyConfidence}%
              </label>
              <Slider
                value={[preferences.minBuyConfidence]}
                onValueChange={([value]) =>
                  setPreferences(prev => ({ ...prev, minBuyConfidence: value }))
                }
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Sell Signal Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sell Signal Alerts</label>
            <Switch
              checked={preferences.enableSellAlerts}
              onCheckedChange={checked =>
                setPreferences(prev => ({ ...prev, enableSellAlerts: checked }))
              }
            />
          </div>
          {preferences.enableSellAlerts && (
            <div className="space-y-2 pl-4 border-l-2 border-red-200">
              <label className="text-xs text-gray-600">
                Minimum Confidence: {preferences.minSellConfidence}%
              </label>
              <Slider
                value={[preferences.minSellConfidence]}
                onValueChange={([value]) =>
                  setPreferences(prev => ({ ...prev, minSellConfidence: value }))
                }
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Sentiment Alerts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Sentiment Updates</label>
          <Switch
            checked={preferences.enableSentimentAlerts}
            onCheckedChange={checked =>
              setPreferences(prev => ({ ...prev, enableSentimentAlerts: checked }))
            }
          />
        </div>

        {/* Notification Channels */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Notification Channels</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={preferences.notificationChannels.includes('in_app')}
                onCheckedChange={() => handleChannelToggle('in_app')}
              />
              <span className="text-sm">In-App Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={preferences.notificationChannels.includes('email')}
                onCheckedChange={() => handleChannelToggle('email')}
              />
              <span className="text-sm">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={preferences.notificationChannels.includes('push')}
                onCheckedChange={() => handleChannelToggle('push')}
              />
              <span className="text-sm">Push Notifications</span>
            </div>
          </div>
        </div>

        {/* Active Channels Badge */}
        {preferences.notificationChannels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {preferences.notificationChannels.map(channel => (
              <Badge key={channel} variant="secondary">
                {channel === 'in_app' ? '📱 In-App' : channel === 'email' ? '📧 Email' : '🔔 Push'}
              </Badge>
            ))}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Settings saved successfully
          </div>
        )}

        {/* Warning if no channels selected */}
        {preferences.notificationChannels.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            No notification channels selected
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || updateMutation.isPending}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
