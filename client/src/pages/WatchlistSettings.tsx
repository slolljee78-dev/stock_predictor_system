import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function WatchlistSettings() {
  const { watchlistId } = useParams<{ watchlistId: string }>();
  const [, setLocation] = useLocation();
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);

  // In a real app, you would fetch watchlist item details
  // For now, this is a placeholder showing the UI structure

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alert Preferences</h1>
          <p className="text-muted-foreground mt-1">Configure how you receive trading signals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Signal Notifications</CardTitle>
            <CardDescription>Choose which signals trigger alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="buy-alerts">Buy Signal Alerts</Label>
              <Switch id="buy-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sell-alerts">Sell Signal Alerts</Label>
              <Switch id="sell-alerts" defaultChecked />
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
              <Switch id="email-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="inapp-alerts">In-App Notifications</Label>
              <Switch id="inapp-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => setLocation("/dashboard")}>Save Changes</Button>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
