import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Bell, Mail, Smartphone, Clock, ArrowLeft, Home, SlidersHorizontal } from "lucide-react";

import { useAuth } from "@/_core/hooks/useAuth";
import { AdminViewModeToggle } from "@/components/AdminViewModeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAdminViewMode } from "@/lib/adminViewMode";
import { DASHBOARD_HOME_PATH, navigateToDashboardMenu } from "@/lib/navigation";
import { trpc } from "@/lib/trpc";

export default function AlertPreferencesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const {
    showAdminViewModeToggle,
    viewMode,
    setViewMode,
    description: adminViewModeDescription,
  } = useAdminViewMode(user);

  const [buyThreshold, setBuyThreshold] = useState([60]);
  const [sellThreshold, setSellThreshold] = useState([60]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [quietHourStart, setQuietHourStart] = useState("22:00");
  const [quietHourEnd, setQuietHourEnd] = useState("08:00");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const settingsQuery = trpc.alertPreferences.getUserSettings.useQuery(undefined, { enabled: Boolean(user) });
  const saveSettingsMutation = trpc.alertPreferences.updateUserSettings.useMutation();

  useEffect(() => {
    if (!settingsQuery.data) return;
    setBuyThreshold([settingsQuery.data.minBuyConfidence]);
    setSellThreshold([settingsQuery.data.minSellConfidence]);
    setEmailEnabled(settingsQuery.data.enableEmailAlerts);
    setPushEnabled(settingsQuery.data.enablePushAlerts);
    setInAppEnabled(settingsQuery.data.enableInAppAlerts);
    setQuietHourStart(settingsQuery.data.quietHoursStart);
    setQuietHourEnd(settingsQuery.data.quietHoursEnd);
  }, [settingsQuery.data]);

  const handleSave = async () => {
    setSaveMessage(null);
    try {
      await saveSettingsMutation.mutateAsync({
        minBuyConfidence: buyThreshold[0],
        minSellConfidence: sellThreshold[0],
        enableEmailAlerts: emailEnabled,
        enablePushAlerts: pushEnabled,
        enableInAppAlerts: inAppEnabled,
        quietHoursStart: quietHourStart,
        quietHoursEnd: quietHourEnd,
      });
      await settingsQuery.refetch();
      setSaveMessage("Preferences saved to your account.");
    } catch {
      setSaveMessage("We could not save your preferences. Please try again.");
    }
  };

  return (
    <div className="space-y-6 px-1 sm:px-0">
      <div className="mb-8 flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => navigateToDashboardMenu(setLocation)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </button>
        <button
          onClick={() => setLocation(DASHBOARD_HOME_PATH)}
          className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
        >
          <Home className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="gradient-text text-4xl font-bold">Alert Preferences</h1>
        <p className="text-muted-foreground">
          Customize how you receive signal alerts. These settings are saved to your account; delivery still depends on available notification channels and market-data checks.
        </p>
      </div>

      {showAdminViewModeToggle && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
              <CardTitle className="text-lg">Admin test mode</CardTitle>
            </div>
            <CardDescription>
              This settings-level control changes the premium access view for this browser only. It does not change real subscription records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminViewModeToggle
              viewMode={viewMode}
              description={adminViewModeDescription}
              onChange={setViewMode}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Confidence Thresholds
            </CardTitle>
            <CardDescription>
              Minimum confidence level for alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Buy Signals</Label>
                <span className="text-lg font-bold text-green-600">{buyThreshold[0]}%</span>
              </div>
              <Slider
                value={buyThreshold}
                onValueChange={setBuyThreshold}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only receive alerts for buy signals with confidence ≥ {buyThreshold[0]}%
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Sell Signals</Label>
                <span className="text-lg font-bold text-red-600">{sellThreshold[0]}%</span>
              </div>
              <Slider
                value={sellThreshold}
                onValueChange={setSellThreshold}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only receive alerts for sell signals with confidence ≥ {sellThreshold[0]}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <Label className="cursor-pointer text-base font-medium">Email Alerts</Label>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label className="cursor-pointer text-base font-medium">Push Notifications</Label>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <Label className="cursor-pointer text-base font-medium">In-App Alerts</Label>
              </div>
              <Switch checked={inAppEnabled} onCheckedChange={setInAppEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause alerts during specific times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-start" className="text-base font-medium">
                Start Time
              </Label>
              <input
                id="quiet-start"
                type="time"
                value={quietHourStart}
                onChange={(e) => setQuietHourStart(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              />
              <p className="text-xs text-muted-foreground">
                Alerts will pause at this time
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiet-end" className="text-base font-medium">
                End Time
              </Label>
              <input
                id="quiet-end"
                type="time"
                value={quietHourEnd}
                onChange={(e) => setQuietHourEnd(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              />
              <p className="text-xs text-muted-foreground">
                Alerts will resume at this time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {saveMessage ? <p className="self-center text-sm text-muted-foreground" role="status">{saveMessage}</p> : null}
        <Button variant="outline" onClick={() => settingsQuery.refetch()} disabled={settingsQuery.isFetching}>Reset</Button>
        <Button onClick={handleSave} disabled={saveSettingsMutation.isPending || settingsQuery.isLoading}>
          {saveSettingsMutation.isPending ? "Saving…" : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
