import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Bell, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Stock Predictor</span>
          </div>
          {!isAuthenticated && (
            <Button asChild>
              <a href={getLoginUrl()}>
                Sign In
              </a>
            </Button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Stock Analysis
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Get intelligent buy/sell signals for Trading 212 stocks with advanced technical indicators and machine learning insights.
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" className="gap-2">
              <a href={getLoginUrl()}>
                Get Started Free
              </a>
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Technical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                RSI, MACD, Bollinger Bands, Moving Averages and more
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
              <CardTitle className="text-white">ML Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                AI-generated buy/sell signals with confidence scores
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <Bell className="h-8 w-8 text-orange-400 mb-2" />
              <CardTitle className="text-white">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Real-time notifications via email and in-app
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <Lock className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Your data is encrypted and never shared
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-slate-400 mb-4">Trading 212 stocks only</p>
          {!isAuthenticated && (
            <Button asChild size="lg">
              <a href={getLoginUrl()}>
                Start Analyzing Now
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
