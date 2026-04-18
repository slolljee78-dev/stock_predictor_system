import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone, Clock, ArrowLeft, Home } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AlertPreferencesPage() {
  const [, setLocation] = useLocation();
  const [buyThreshold, setBuyThreshold] = useState([60]);
  const [sellThreshold, setSellThreshold] = useState([60]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [quietHourStart, setQuietHourStart] = useState("22:00");
  const [quietHourEnd, setQuietHourEnd] = useState("08:00");

  const handleSave = () => {
    // TODO: Implement save functionality with tRPC mutation
    console.log({
      buyThreshold: buyThreshold[0],
      sellThreshold: sellThreshold[0],
      emailEnabled,
      pushEnabled,
      inAppEnabled,
      quietHourStart,
      quietHourEnd,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-8 pt-2">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </button>
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium"
        >
          <Home className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>

      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Alert Preferences</h1>
        <p className="text-muted-foreground">
          Customize how you receive trading signal alerts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Confidence Thresholds */}
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

        {/* Notification Channels */}
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
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base font-medium cursor-pointer">Email Alerts</Label>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base font-medium cursor-pointer">Push Notifications</Label>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base font-medium cursor-pointer">In-App Alerts</Label>
              </div>
              <Switch checked={inAppEnabled} onCheckedChange={setInAppEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiet Hours */}
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
                className="w-full px-3 py-2 border rounded-md bg-background"
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
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Alerts will resume at this time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}
