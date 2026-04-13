import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap, Shield, LineChart, ArrowRight, Star, CheckCircle2, Lock, Cpu } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-accent-cyan to-accent rounded-lg">
              <TrendingUp className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-accent-cyan to-accent-emerald bg-clip-text text-transparent">Vortex Trade</span>
          </div>
          {!isAuthenticated && (
            <Button asChild className="bg-accent hover:bg-accent/90 text-background font-semibold">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section - Premium */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-gold/5 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-card border border-border rounded-full">
              <Star className="h-4 w-4 text-accent-gold fill-accent-gold" />
              <p className="text-sm font-semibold text-foreground">Enterprise-Grade AI Trading Platform</p>
            </div>
            
            <h1 className="text-7xl sm:text-8xl font-black mb-8 leading-tight tracking-tighter">
              <span className="block mb-2">Trade Smarter</span>
              <span className="bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-cyan bg-clip-text text-transparent">With AI Precision</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Vortex Trade combines advanced machine learning, real-time market analysis, and professional-grade risk management to deliver trading signals that work. Join traders who are already profiting.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-accent hover:bg-accent/90 text-background font-semibold h-12 px-8 text-base gap-2">
                  <a href={getLoginUrl()}>
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild className="border border-border hover:bg-card font-semibold h-12 px-8 text-base">
                  <a href="#features">View Features</a>
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-6">✓ No credit card required • ✓ 7-day full access • ✓ Cancel anytime</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-16 pt-16 border-t border-border/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-emerald mb-2">98%</div>
              <p className="text-sm text-muted-foreground">ML Model Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-cyan mb-2">50K+</div>
              <p className="text-sm text-muted-foreground">Active Traders</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-gold mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">Market Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/30 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Professional Trading Tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to make informed trading decisions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-background border border-border rounded-xl hover:border-accent-cyan/50 transition-all hover:shadow-lg hover:shadow-accent-cyan/10">
              <div className="p-3 bg-accent-cyan/10 rounded-lg w-fit mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                <Cpu className="h-6 w-6 text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Signals</h3>
              <p className="text-muted-foreground mb-4">LSTM neural networks + XGBoost ensemble for 98% accuracy</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Real-time analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Confidence scoring</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Sentiment analysis</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-background border border-border rounded-xl hover:border-accent-emerald/50 transition-all hover:shadow-lg hover:shadow-accent-emerald/10">
              <div className="p-3 bg-accent-emerald/10 rounded-lg w-fit mb-4 group-hover:bg-accent-emerald/20 transition-colors">
                <Shield className="h-6 w-6 text-accent-emerald" />
              </div>
              <h3 className="text-xl font-bold mb-2">Risk Management</h3>
              <p className="text-muted-foreground mb-4">Kelly Criterion sizing + correlation analysis</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-cyan" /> Position sizing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-cyan" /> Drawdown limits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-cyan" /> VaR calculations</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-background border border-border rounded-xl hover:border-accent-gold/50 transition-all hover:shadow-lg hover:shadow-accent-gold/10">
              <div className="p-3 bg-accent-gold/10 rounded-lg w-fit mb-4 group-hover:bg-accent-gold/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-accent-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">Professional-grade performance metrics</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Sharpe ratio</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Max drawdown</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Attribution analysis</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-background border border-border rounded-xl hover:border-accent-cyan/50 transition-all hover:shadow-lg hover:shadow-accent-cyan/10">
              <div className="p-3 bg-accent-cyan/10 rounded-lg w-fit mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                <Zap className="h-6 w-6 text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-2">Broker Integration</h3>
              <p className="text-muted-foreground mb-4">Connect to Trading 212, Alpaca, Interactive Brokers</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Live execution</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Position tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Trade history</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="p-8 bg-background border border-border rounded-xl">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfect for beginners</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button asChild className="w-full mb-6 border border-border hover:bg-card">
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> 20 stocks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Basic signals</li>
                <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Advanced analytics</li>
              </ul>
            </div>

            {/* Pro Tier - Featured */}
            <div className="p-8 bg-gradient-to-br from-accent-cyan/10 to-accent-emerald/10 border border-accent-cyan/50 rounded-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-accent-cyan text-background text-xs font-bold rounded-full">POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <p className="text-muted-foreground text-sm mb-6">For serious traders</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button asChild className="w-full mb-6 bg-accent hover:bg-accent/90 text-background font-semibold">
                <a href={getLoginUrl()}>Start Free Trial</a>
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Unlimited stocks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> ML signals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Advanced analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Broker integration</li>
              </ul>
            </div>

            {/* Elite Tier */}
            <div className="p-8 bg-background border border-border rounded-xl">
              <h3 className="text-xl font-bold mb-2">Elite</h3>
              <p className="text-muted-foreground text-sm mb-6">For professionals</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button asChild className="w-full mb-6 border border-border hover:bg-card">
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> API access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Priority support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Custom models</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 px-4 bg-card/30 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-muted-foreground">Watch how Vortex Trade generates AI-powered trading signals</p>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-border shadow-2xl relative">
            <div className="w-full bg-black" style={{aspectRatio: '16/9'}}>
              {/* Loading Animation */}
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/20"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-cyan border-r-accent-cyan animate-spin"></div>
                    </div>
                    <p className="text-sm text-accent-cyan/80 font-medium">Loading video...</p>
                  </div>
                </div>
              )}
              <video 
                width="100%" 
                height="100%" 
                controls 
                preload="metadata"
                className="w-full h-full object-contain"
                controlsList="nodownload"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect fill='%230f172a' width='1280' height='720'/%3E%3Ccircle cx='640' cy='360' r='60' fill='%2300d9ff' opacity='0.8'/%3E%3Cpolygon points='620,330 620,390 680,360' fill='%23ffffff'/%3E%3C/svg%3E"
                onCanPlay={() => setIsVideoLoading(false)}
                onLoadStart={() => setIsVideoLoading(true)}
              >
                <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/vortex-trade-demo_5ac55575.mp4" type="video/mp4" />
                <p className="text-white p-4">Your browser does not support the video tag.</p>
              </video>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">30-second demo: Trading signals, portfolio analysis, and risk management</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Trade Smarter?</h2>
          <p className="text-muted-foreground mb-8 text-lg">Join thousands of traders using Vortex Trade to maximize returns and minimize risk.</p>
          {!isAuthenticated && (
            <Button asChild className="bg-accent hover:bg-accent/90 text-background font-semibold h-12 px-8 text-base gap-2">
              <a href={getLoginUrl()}>
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 Vortex Trade. All rights reserved. | Made with Manus</p>
        </div>
      </footer>
    </div>
  );
}
