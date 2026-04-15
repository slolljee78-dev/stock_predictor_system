import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Bell, Zap, Shield, LineChart, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Stock Predictor</span>
          </div>
          {isAuthenticated ? (
            <Button onClick={() => setLocation("/dashboard")} className="gap-2">
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <a href={getLoginUrl()}>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <p className="text-sm font-semibold text-accent">🚀 Powered by AI & Machine Learning</p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              AI-Powered Stock Trading Signals
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                for Trading 212
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get intelligent buy/sell signals for Trading 212 stocks with advanced technical analysis, machine learning insights, and real-time market analysis.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="gap-2">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <a href="#features">
                    Learn More
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to make informed trading decisions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Technical Analysis",
                description: "RSI, MACD, Bollinger Bands, Moving Averages and more",
                color: "primary"
              },
              {
                icon: Zap,
                title: "ML Signals",
                description: "AI-generated buy/sell signals with confidence scores",
                color: "accent"
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                description: "Real-time notifications via email and in-app",
                color: "primary"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is encrypted and never shared",
                color: "accent"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-6 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-all">
                  <div className={`p-3 bg-${feature.color}/10 rounded-lg w-fit mb-4`}>
                    <Icon className={`h-6 w-6 text-${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Demo Video Section */}
        <section className="py-20 md:py-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See It In Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Watch a complete walkthrough of all features</p>
          </div>
          
          <div className="rounded-lg border border-border/50 overflow-hidden shadow-xl bg-black">
            <div style={{aspectRatio: '16/9'}} className="w-full">
              <video 
                width="100%" 
                height="100%" 
                controls 
                preload="metadata"
                poster="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/stock_predictor_video_poster-o7v85aHek2B7TV7csZwpMr.webp"
                className="w-full h-full object-contain"
                controlsList="nodownload"
              >
                <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/stock_predictor_demo_final_3a4107dd.mp4" type="video/mp4" />
                <p className="text-white p-4">Your browser does not support the video tag.</p>
              </video>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border/50 rounded-lg p-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <LineChart className="h-6 w-6 text-accent" />
              <p className="text-lg font-semibold">Monitor 212 Trading 212 Stocks</p>
            </div>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Get started with AI-powered stock analysis and make informed trading decisions</p>
            {!isAuthenticated && (
              <Button asChild size="lg" className="gap-2">
                <a href={getLoginUrl()}>
                  Start Analyzing Now
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 py-8 mt-20">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 Stock Predictor. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
