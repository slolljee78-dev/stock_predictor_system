import React, { useState, useEffect } from "react";
import { TrendingUp, Play, CheckCircle2, Star, Zap, Shield, Cpu, BarChart3, ArrowRight, ShoppingCart, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string>("");

  useEffect(() => {
    // Set login URL once on mount
    setLoginUrl(getLoginUrl());
  }, []);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleSignIn = () => {
    if (loginUrl) {
      window.location.href = loginUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role !== 'admin' && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-emerald-500/20 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-black font-bold" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">VORTEX</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Button asChild variant="ghost" className="text-gray-400 hover:text-emerald-400 text-sm font-medium">
                  <a href="/admin">Admin</a>
                </Button>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </>
            )}
            {isAuthenticated && user?.role !== 'admin' && (
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                <a href="/dashboard">Dashboard</a>
              </Button>
            )}
            {!isAuthenticated && (
              <Button onClick={handleSignIn} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout with Product Mockup */}
      <section className="pt-32 pb-20 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-3 border border-emerald-500/50 rounded-full bg-emerald-500/10 mb-8">
            <Zap className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">AI-Powered Trading Signals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Product Mockup */}
            <div className="relative">
              <div className="border-2 border-dashed border-emerald-500 rounded-2xl p-8 bg-gray-900/50 backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-emerald-900/20 to-gray-900 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <div className="text-center">
                    <Smartphone className="h-24 w-24 text-emerald-500/40 mx-auto mb-4" />
                    <p className="text-emerald-500/60 font-bold text-lg">Trading Dashboard</p>
                    <p className="text-gray-500 text-sm mt-2">Real-time signals & analytics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text & CTA */}
            <div className="space-y-8">
              {/* Main Headline */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
                  <span className="block text-white">Trade with</span>
                  <span className="block text-emerald-400">Precision</span>
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed font-medium">
                  Institutional-grade AI signals with 87% accuracy. Get real-time buy and sell signals powered by ensemble ML models. Trade any stock, any broker. No platform lock-in, pure signal intelligence.
                </p>
              </div>

              {/* CTA Buttons with Pricing */}
              <div className="space-y-3">
                <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-4 h-auto rounded-lg text-base flex items-center justify-center gap-2 group">
                  <a href={getLoginUrl()}>
                    <ShoppingCart className="h-5 w-5" />
                    Start Free Trial
                  </a>
                </Button>
                <Button asChild className="w-full border-2 border-emerald-500/60 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-bold px-8 py-4 h-auto rounded-lg text-base bg-transparent hover:bg-emerald-500/5 flex items-center justify-center gap-2">
                  <a href="#pricing">
                    View Pricing
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3 border-t border-emerald-500/20 pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">No credit card required • 7-day full access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">50K+ active traders worldwide</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">✨ NOW WITH ADVANCED RISK MANAGEMENT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Products Section */}
      <section id="pricing" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">Premium Trading Packages</h2>
          <p className="text-lg text-gray-400 mb-12 font-medium">Choose the plan that fits your trading style</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Signal Feed",
                price: "$29.99",
                badge: "Best Seller",
                description: "Real-time AI trading signals with 87% accuracy",
                features: ["50 signals/day", "Email alerts", "Performance analytics", "7-day trial"],
                image: "📊",
              },
              {
                name: "Trading Simulator",
                price: "$14.99",
                badge: "Popular",
                description: "Backtest strategies with realistic market conditions",
                features: ["Unlimited backtests", "Slippage modeling", "Performance reports", "Strategy optimization"],
                image: "🎯",
                highlighted: true,
              },
              {
                name: "Elite Bundle",
                price: "$49.99",
                description: "Complete trading intelligence suite",
                features: ["Signals + Simulator", "API access", "Priority support", "Custom strategies"],
                image: "⚡",
              },
            ].map((product, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden transition-all ${
                product.highlighted 
                  ? "border-2 border-dashed border-emerald-500 bg-emerald-500/5" 
                  : "border-2 border-dashed border-emerald-500/40 bg-gray-900/30 hover:border-emerald-500"
              }`}>
                {product.badge && (
                  <div className="bg-emerald-500 text-black px-4 py-2 font-bold text-xs uppercase inline-block m-4">
                    {product.badge}
                  </div>
                )}
                
                {/* Product Image Area */}
                <div className="h-40 bg-gradient-to-br from-emerald-900/20 to-gray-900 flex items-center justify-center text-6xl border-b border-emerald-500/20">
                  {product.image}
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black mb-2 text-white">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 font-medium">{product.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-black text-emerald-400">{product.price}</span>
                    <span className="text-gray-400 text-sm font-medium">/month</span>
                  </div>

                  <Button asChild className={`w-full font-bold py-3 h-auto rounded-lg mb-6 ${
                    product.highlighted
                      ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                      : "border-2 border-emerald-500/60 text-emerald-400 hover:text-emerald-300 bg-transparent hover:bg-emerald-500/5"
                  }`}>
                    <a href={getLoginUrl()}>Get Started</a>
                  </Button>

                  <ul className="space-y-3">
                    {product.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">Why Choose Vortex</h2>
          <p className="text-lg text-gray-400 mb-12 font-medium">Built for traders who take their strategy seriously</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: "Real-Time Signals", desc: "Instant AI-generated buy and sell signals with 87% accuracy" },
              { icon: Shield, title: "Risk Management", desc: "Smart position sizing, stop-loss automation, and portfolio analysis" },
              { icon: Cpu, title: "ML Models", desc: "LSTM, XGBoost, and Ensemble algorithms for market prediction" },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Deep market insights, trend analysis, and performance tracking" },
            ].map((feature, i) => (
              <div key={i} className="border-l-2 border-emerald-500/40 pl-6 space-y-2">
                <div className="flex items-center gap-3">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-400 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Testimonials */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-white">Loved by 50K+ Traders</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Day Trader", quote: "Vortex signals have transformed my trading. 87% accuracy is unmatched." },
              { name: "Mike Johnson", role: "Swing Trader", quote: "Finally, a platform that doesn't lock you in. Pure signal intelligence." },
              { name: "Alex Rodriguez", role: "Portfolio Manager", quote: "The risk management tools are institutional-grade. Highly recommend." },
            ].map((testimonial, i) => (
              <div key={i} className="border-2 border-dashed border-emerald-500/40 rounded-xl p-6 hover:border-emerald-500 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 font-medium italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-emerald-400 font-medium">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">Ready to Start Trading?</h2>
          <p className="text-lg text-gray-300 mb-10 font-medium">Join thousands of traders using Vortex to beat the market</p>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-12 py-4 h-auto rounded-lg text-lg">
            <a href={getLoginUrl()}>Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-500/20 py-12 px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-medium">
          <p>© 2024 Vortex Trade. All rights reserved. | Trading involves risk.</p>
        </div>
      </footer>
    </div>
  );
}
