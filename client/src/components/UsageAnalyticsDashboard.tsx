import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";

export interface UsageAnalytics {
  tier: string;
  signalsUsedToday: number;
  signalsLimit: number;
  signalsRemaining: number;
  stocksMonitored: number;
  stocksLimit: number;
  stocksRemaining: number;
  watchlistsCount: number;
  watchlistsLimit: number;
  watchlistsRemaining: number;
  quotaPercentage: number;
  isAtLimit: boolean;
}

interface UsageAnalyticsDashboardProps {
  analytics: UsageAnalytics;
  showUpgradePrompt?: boolean;
}

export function UsageAnalyticsDashboard({
  analytics,
  showUpgradePrompt = true,
}: UsageAnalyticsDashboardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isFreeUser = user?.subscriptionTier === "free";

  if (!isFreeUser) return null;

  const quotaColor = analytics.quotaPercentage > 80 ? "destructive" : "default";
  const signalColor = analytics.signalsRemaining === 0 ? "destructive" : "default";
  const stockColor = analytics.stocksRemaining === 0 ? "destructive" : "default";

  return (
    <div className="space-y-4">
      {/* Upgrade Prompt */}
      {showUpgradePrompt && analytics.quotaPercentage >= 80 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You are using {analytics.quotaPercentage}% of your free tier quota.
              Upgrade to unlock unlimited access.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="ml-4"
              onClick={() => setLocation("/pricing")}
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Signals Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Daily Signals
            </CardTitle>
            <CardDescription>
              {analytics.signalsRemaining} remaining
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {analytics.signalsUsedToday} / {analytics.signalsLimit}
              </span>
              <span className={signalColor === "destructive" ? "text-destructive font-semibold" : ""}>
                {Math.round(
                  (analytics.signalsUsedToday / analytics.signalsLimit) * 100
                )}%
              </span>
            </div>
            <Progress
              value={
                (analytics.signalsUsedToday / analytics.signalsLimit) * 100
              }
              className="h-2"
            />
            {analytics.signalsRemaining === 0 && (
              <p className="text-xs text-destructive font-medium">
                Daily limit reached. Resets tomorrow.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stocks Monitored */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Stocks Monitored
            </CardTitle>
            <CardDescription>
              {analytics.stocksRemaining} slots available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {analytics.stocksMonitored} / {analytics.stocksLimit}
              </span>
              <span className={stockColor === "destructive" ? "text-destructive font-semibold" : ""}>
                {Math.round(
                  (analytics.stocksMonitored / analytics.stocksLimit) * 100
                )}%
              </span>
            </div>
            <Progress
              value={
                (analytics.stocksMonitored / analytics.stocksLimit) * 100
              }
              className="h-2"
            />
            {analytics.stocksRemaining === 0 && (
              <p className="text-xs text-destructive font-medium">
                Maximum stocks reached.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Overall Quota */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall Quota
            </CardTitle>
            <CardDescription>Free tier usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Usage</span>
              <span
                className={
                  analytics.quotaPercentage > 80
                    ? "text-destructive font-semibold"
                    : ""
                }
              >
                {analytics.quotaPercentage}%
              </span>
            </div>
            <Progress
              value={analytics.quotaPercentage}
              className="h-2"
            />
            {analytics.quotaPercentage >= 80 && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => setLocation("/pricing")}
              >
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
