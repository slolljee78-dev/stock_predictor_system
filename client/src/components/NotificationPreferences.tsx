import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Volume2, Settings, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface NotificationPreference {
  id: string;
  symbol: string;
  channels: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    push: boolean;
  };
  triggers: {
    buySignal: boolean;
    sellSignal: boolean;
    priceAlert: boolean;
    volumeAlert: boolean;
    earningsAlert: boolean;
    newsAlert: boolean;
  };
  priceThreshold?: number;
  volumeThreshold?: number;
  enabled: boolean;
  createdAt: Date;
}

interface NotificationPreferencesProps {
  preferences?: NotificationPreference[];
  onSave?: (preferences: NotificationPreference[]) => void;
}

export function NotificationPreferences({ 
  preferences = generateMockPreferences(),
  onSave 
}: NotificationPreferencesProps) {
  const [allPreferences, setAllPreferences] = useState<NotificationPreference[]>(preferences);
  const [selectedPreference, setSelectedPreference] = useState<NotificationPreference | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPreference = () => {
    if (newSymbol.trim()) {
      const newPref: NotificationPreference = {
        id: `pref_${Date.now()}`,
        symbol: newSymbol.toUpperCase(),
        channels: { email: true, inApp: true, sms: false, push: true },
        triggers: { buySignal: true, sellSignal: true, priceAlert: false, volumeAlert: false, earningsAlert: true, newsAlert: true },
        enabled: true,
        createdAt: new Date(),
      };
      setAllPreferences([...allPreferences, newPref]);
      setNewSymbol('');
      setShowAddDialog(false);
    }
  };

  const handleDeletePreference = (id: string) => {
    setAllPreferences(allPreferences.filter((p) => p.id !== id));
  };

  const handleUpdatePreference = (updated: NotificationPreference) => {
    setAllPreferences(allPreferences.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPreference(updated);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSave?.(allPreferences);
      console.log('Preferences saved:', allPreferences);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Preferences</h2>
          <p className="text-muted-foreground mt-1">Customize alerts for each stock</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Stock
        </Button>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Global Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">In-App Alerts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">SMS Alerts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Push Notifications</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Stock Preferences */}
      <div className="space-y-3">
        <h3 className="font-semibold">Stock-Specific Preferences</h3>
        {allPreferences.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No notification preferences yet. Add a stock to get started.</p>
            </CardContent>
          </Card>
        ) : (
          allPreferences.map((pref) => (
            <Card key={pref.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-lg">{pref.symbol}</h4>
                      <Badge variant={pref.enabled ? 'default' : 'secondary'}>
                        {pref.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    {/* Channels */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Notification Channels</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.channels.email}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                channels: { ...pref.channels, email: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <Mail className="w-4 h-4" />
                          Email
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.channels.inApp}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                channels: { ...pref.channels, inApp: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <Bell className="w-4 h-4" />
                          In-App
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.channels.sms}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                channels: { ...pref.channels, sms: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <MessageSquare className="w-4 h-4" />
                          SMS
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.channels.push}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                channels: { ...pref.channels, push: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <Volume2 className="w-4 h-4" />
                          Push
                        </label>
                      </div>
                    </div>

                    {/* Triggers */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Alert Triggers</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.triggers.buySignal}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                triggers: { ...pref.triggers, buySignal: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Buy Signal
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.triggers.sellSignal}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                triggers: { ...pref.triggers, sellSignal: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Sell Signal
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.triggers.priceAlert}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                triggers: { ...pref.triggers, priceAlert: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Price Alert
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.triggers.volumeAlert}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                triggers: { ...pref.triggers, volumeAlert: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Volume Alert
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.triggers.earningsAlert}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                triggers: { ...pref.triggers, earningsAlert: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Earnings Alert
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={pref.triggers.newsAlert}
                            onChange={(e) =>
                              handleUpdatePreference({
                                ...pref,
                                triggers: { ...pref.triggers, newsAlert: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          News Alert
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePreference(pref.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2">
          {isSaving ? '...' : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Add Stock Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock Notifications</DialogTitle>
            <DialogDescription>Create notification preferences for a new stock</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stock Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPreference} disabled={!newSymbol.trim()} className="flex-1">
                Add Stock
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Generate mock notification preferences
 */
function generateMockPreferences(): NotificationPreference[] {
  return [
    {
      id: 'pref_1',
      symbol: 'AAPL',
      channels: { email: true, inApp: true, sms: false, push: true },
      triggers: { buySignal: true, sellSignal: true, priceAlert: false, volumeAlert: false, earningsAlert: true, newsAlert: true },
      enabled: true,
      createdAt: new Date('2026-03-01'),
    },
    {
      id: 'pref_2',
      symbol: 'MSFT',
      channels: { email: true, inApp: true, sms: true, push: true },
      triggers: { buySignal: true, sellSignal: true, priceAlert: true, volumeAlert: true, earningsAlert: true, newsAlert: true },
      enabled: true,
      createdAt: new Date('2026-02-15'),
    },
    {
      id: 'pref_3',
      symbol: 'TSLA',
      channels: { email: false, inApp: true, sms: false, push: true },
      triggers: { buySignal: true, sellSignal: false, priceAlert: true, volumeAlert: false, earningsAlert: false, newsAlert: true },
      enabled: true,
      createdAt: new Date('2026-01-20'),
    },
  ];
}
