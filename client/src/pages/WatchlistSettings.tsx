import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function WatchlistSettings() {
  const { watchlistId } = useParams<{ watchlistId: string }>();
  const [, setLocation] = useLocation();
  const watchlistIdNum = parseInt(watchlistId || "0", 10);

  // Fetch watchlist data
  const { data: watchlist } = trpc.watchlist.list.useQuery();
  const watchlistItem = watchlist?.find(w => w.id === watchlistIdNum);

  // Local state for form
  const [alertOnBuy, setAlertOnBuy] = useState(true);
  const [alertOnSell, setAlertOnSell] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Update form when watchlist item loads
  useEffect(() => {
    if (watchlistItem) {
      setAlertOnBuy(watchlistItem.alertOnBuy === 1);
      setAlertOnSell(watchlistItem.alertOnSell === 1);
      setConfidenceThreshold(watchlistItem.minConfidenceThreshold || 60);
      setEmailNotifications(watchlistItem.emailNotifications === 1);
      setInAppNotifications(watchlistItem.inAppNotifications === 1);
    }
  }, [watchlistItem]);

  // Update preferences mutation
  const updatePreferences = trpc.watchlist.updatePreferences.useMutation();

  const handleSave = async () => {
    if (!watchlistIdNum) return;
    setIsSaving(true);
    try {
      await updatePreferences.mutateAsync({
        watchlistId: watchlistIdNum,
        alertOnBuy,
        alertOnSell,
        minConfidenceThreshold: confidenceThreshold,
        emailNotifications,
        inAppNotifications,
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Failed to update preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!watchlistItem) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alert Preferences</h1>
          <p className="text-muted-foreground mt-1">Configure how you receive trading signals for {watchlistItem.ticker}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Signal Notifications</CardTitle>
            <CardDescription>Choose which signals trigger alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="buy-alerts">Buy Signal Alerts</Label>
              <Switch 
                id="buy-alerts" 
                checked={alertOnBuy}
                onCheckedChange={setAlertOnBuy}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sell-alerts">Sell Signal Alerts</Label>
              <Switch 
                id="sell-alerts" 
                checked={alertOnSell}
                onCheckedChange={setAlertOnSell}
              />
            </div>

            <div className="space-y-3">
              <Label>Minimum Confidence Threshold: {confidenceThreshold}%</Label>
              <Slider
                value={[confidenceThreshold]}
                onValueChange={v => setConfidenceThreshold(v[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Only receive alerts for signals with confidence above this threshold
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-alerts">Email Notifications</Label>
              <Switch 
                id="email-alerts" 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="inapp-alerts">In-App Notifications</Label>
              <Switch 
                id="inapp-alerts" 
                checked={inAppNotifications}
                onCheckedChange={setInAppNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/dashboard")}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
