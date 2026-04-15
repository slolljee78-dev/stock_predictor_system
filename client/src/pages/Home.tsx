import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Bell, Zap, Shield, LineChart, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Removed automatic redirect to dashboard - show homepage first

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 relative overflow-hidden">
      {/* Premium Navigation */}
      <nav className="border-b border-border/30 bg-gradient-to-r from-card/80 via-card/60 to-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Stock Predictor</span>
          </div>
          {isAuthenticated ? (
            <Button asChild className="btn-premium">
              <a href="/dashboard">
                Dashboard
              </a>
            </Button>
          ) : (
            <Button asChild className="btn-premium">
              <a href={getLoginUrl()}>
                Sign In
              </a>
            </Button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
            <p className="text-sm font-semibold text-accent">🚀 Powered by AI & Machine Learning</p>
          </div>
          <h1 className="text-7xl md:text-9xl font-black mb-8 gradient-text leading-tight tracking-tighter" style={{letterSpacing: '-0.04em'}}>
            Trade Smarter,<br />Not Harder
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get intelligent buy/sell signals for Trading 212 stocks with advanced technical indicators, machine learning insights, and real-time market analysis.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-premium gap-2 h-12 px-8 text-base">
                <a href={getLoginUrl()}>
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild className="btn-premium-secondary gap-2 h-12 px-8 text-base">
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="card-premium group hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Technical Analysis</h3>
            <p className="text-sm text-muted-foreground">
              RSI, MACD, Bollinger Bands, Moving Averages and more
            </p>
          </div>

          <div className="card-premium group hover:border-accent/50 transition-all">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 group-hover:bg-accent/20 transition-colors">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">ML Signals</h3>
            <p className="text-sm text-muted-foreground">
              AI-generated buy/sell signals with confidence scores
            </p>
          </div>

          <div className="card-premium group hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Smart Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Real-time notifications via email and in-app
            </p>
          </div>

          <div className="card-premium group hover:border-accent/50 transition-all">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 group-hover:bg-accent/20 transition-colors">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data is encrypted and never shared
            </p>
          </div>
        </div>

        {/* Demo Video Section - Professional 90-second walkthrough */}
        <div className="space-y-4 mb-20 w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 gradient-text">See It In Action</h2>
            <p className="text-muted-foreground">Watch how Manus Stock Predictor helps you make smarter trading decisions</p>
          </div>
          <div className="card-premium p-0 overflow-hidden w-full shadow-2xl">
            <div className="w-full bg-black" style={{aspectRatio: '16/9'}}>
              <video 
                width="100%" 
                height="100%" 
                controls 
                preload="metadata"
                poster="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/stock_predictor_video_poster-o7v85aHek2B7TV7csZwpMr.webp"
                className="w-full h-full object-contain"
                controlsList="nodownload"
                style={{display: 'block', width: '100%', height: '100%'}}
              >
                <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/stock_predictor_demo_final_3a4107dd.mp4" type="video/mp4" />
                <p className="text-white p-4">Your browser does not support the video tag. Please try a different browser.</p>
              </video>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Watch a complete walkthrough of all features</p>
        </div>

        {/* CTA Section */}
        <div className="card-premium text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LineChart className="h-5 w-5 text-accent" />
            <p className="font-semibold">Monitor 212 Trading 212 Stocks</p>
          </div>
          <p className="text-muted-foreground mb-6">Get started with AI-powered stock analysis and make informed trading decisions</p>
          {!isAuthenticated && (
            <Button asChild className="btn-premium gap-2">
              <a href={getLoginUrl()}>
                Start Analyzing Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
