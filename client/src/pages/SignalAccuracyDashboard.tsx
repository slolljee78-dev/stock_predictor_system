import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, BarChart3, ArrowLeft, Home } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function SignalAccuracyDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: accuracyData, isLoading } = trpc.dashboard.getTrendData.useQuery(undefined, {
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Win Rate",
      value: "75.5%",
      icon: Target,
      trend: "up",
    },
    {
      label: "Total Signals",
      value: "42",
      icon: BarChart3,
      trend: "up",
    },
    {
      label: "Avg P&L",
      value: "$125.50",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Sharpe Ratio",
      value: "1.85",
      icon: TrendingDown,
      trend: "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-8">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </button>
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Home className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>

      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Signal Accuracy</h1>
        <p className="text-muted-foreground">
          Track your signal performance metrics and trading statistics
        </p>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  {metric.trend === "up" && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Up
                    </Badge>
                  )}
                  {metric.trend === "down" && (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-700">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Down
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Historical signal performance and accuracy trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Buy Signals Accuracy</span>
              <span className="text-lg font-bold">78.2%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Sell Signals Accuracy</span>
              <span className="text-lg font-bold">72.8%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Best Performing Stock</span>
              <span className="text-lg font-bold">AAPL</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
