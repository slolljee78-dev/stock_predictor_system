import React, { useState, useEffect } from "react";
import { TrendingUp, Play, ArrowRight, CheckCircle2, Star, Users, Zap, Shield, Lock, BarChart3, Smartphone, Cpu, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// FINAL DEPLOY - 2026-04-14 19:00 UTC
export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
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
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-lime-500/20 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-dashed border-lime-500/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-lime-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">VORTEX</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Button asChild variant="ghost" className="text-gray-400 hover:text-lime-400 text-sm font-medium">
                  <a href="/admin">Admin</a>
                </Button>
                <Button asChild className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </>
            )}
            {isAuthenticated && user?.role !== 'admin' && (
              <Button asChild className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                <a href="/dashboard">Dashboard</a>
              </Button>
            )}
            {!isAuthenticated && (
              <Button asChild className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Product Mockup */}
            <div className="relative">
              <div className="border-2 border-dashed border-lime-500/60 rounded-2xl p-8 bg-gray-900/50 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-6 aspect-video flex items-center justify-center border border-lime-500/20">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-lime-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-lime-400 font-bold text-sm">AI Trading Dashboard</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm">
                  87% Win Rate
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="space-y-8">
              {/* Subtitle Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-lime-500/50 rounded-full bg-lime-500/5">
                <Star className="h-4 w-4 text-lime-400 fill-lime-400" />
                <p className="text-xs font-bold text-lime-400 uppercase tracking-widest">AI Trading Intelligence</p>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                <span className="block text-white">Control Your</span>
                <span className="block text-lime-400">Trading</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg text-gray-300 leading-relaxed max-w-lg font-medium">
                Institutional-grade AI signals with 87% accuracy. Trade any stock, any broker. No platform lock-in. Pure signal intelligence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-8 py-3 h-auto rounded-lg text-base">
                  <a href={getLoginUrl()}>Start Free Trial</a>
                </Button>
                <Button asChild className="border-2 border-dashed border-lime-500/60 hover:border-lime-400 text-lime-400 hover:text-lime-300 font-bold px-8 py-3 h-auto rounded-lg text-base bg-transparent hover:bg-lime-500/5">
                  <a href="#features">View Features</a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3 pt-8 border-t border-lime-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">No credit card required • 7-day full access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">50K+ active traders worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-lime-500/30 to-transparent"></div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">OUR FEATURES</p>
            <h2 className="text-5xl font-black mb-6 text-white">Premium Trading Features</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto font-medium">Everything you need to trade smarter and more profitably with institutional-grade tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Real-Time Signals", desc: "Instant AI-generated buy and sell signals" },
              { icon: Shield, title: "Risk Management", desc: "Smart position sizing and stop-loss" },
              { icon: Cpu, title: "ML Models", desc: "LSTM, XGBoost, Ensemble algorithms" },
              { icon: Gauge, title: "Advanced Analytics", desc: "Deep market insights and trends" },
            ].map((feature, i) => (
              <div key={i} className="border-2 border-dashed border-lime-500/40 rounded-xl p-8 bg-gray-900/30 backdrop-blur-sm hover:border-lime-400 transition-colors group">
                <feature.icon className="h-12 w-12 text-lime-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-lime-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">TRADING TOOLS</p>
            <h2 className="text-5xl font-black mb-6 text-white">Premium Trading Packages</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Signal Feed",
                price: "$29.99",
                badge: "Best Seller",
                badgeColor: "bg-lime-500",
                desc: "Real-time AI trading signals with 87% accuracy",
                features: ["Real-time signals", "50 signals/day", "Email alerts", "Basic analytics"],
              },
              {
                title: "Trading Simulator",
                price: "$14.99",
                badge: "Popular",
                badgeColor: "bg-yellow-400",
                desc: "Backtest strategies with realistic execution",
                features: ["Backtesting engine", "Slippage simulation", "Performance analytics", "Strategy optimization"],
              },
            ].map((product, i) => (
              <div key={i} className="border-2 border-dashed border-lime-500/40 rounded-2xl p-8 bg-gray-900/30 backdrop-blur-sm hover:border-lime-400 transition-colors group relative">
                <div className={`absolute -top-4 left-8 ${product.badgeColor} text-black px-4 py-1 rounded-full font-bold text-xs uppercase`}>
                  {product.badge}
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-8 mb-6 aspect-video flex items-center justify-center border border-lime-500/20">
                  <BarChart3 className="h-20 w-20 text-lime-400/50" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-white">{product.title}</h3>
                <p className="text-gray-400 text-sm mb-6 font-medium">{product.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-lime-400">{product.price}</span>
                </div>
                <Button asChild className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 h-auto rounded-lg mb-6">
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
                <ul className="space-y-3">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                      <CheckCircle2 className="h-5 w-5 text-lime-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-lime-500/20">
        <div className="max-w-5xl mx-auto">
          <div 
            className="border-2 border-dashed border-lime-500/60 rounded-2xl overflow-hidden cursor-pointer group bg-gray-900/30 backdrop-blur-sm hover:border-lime-400 transition-colors"
            onClick={() => setShowVideoModal(true)}
          >
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-lime-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-dashed border-lime-500/50">
                  <Play className="h-10 w-10 text-lime-400 fill-lime-400 ml-1" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">Watch Demo</p>
                  <p className="text-sm text-gray-400 font-medium">2 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-lime-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">TRUSTED BY TRADERS</p>
            <h2 className="text-4xl font-black mb-6 text-white">Loved by 50K+ Traders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Day Trader", quote: "Vortex signals have transformed my trading. 87% accuracy is unmatched." },
              { name: "Mike Johnson", role: "Swing Trader", quote: "Finally, a platform that doesn't lock you in. Pure signal intelligence." },
              { name: "Alex Rodriguez", role: "Portfolio Manager", quote: "The risk management tools are institutional-grade. Highly recommend." },
            ].map((testimonial, i) => (
              <div key={i} className="border-2 border-dashed border-lime-500/40 rounded-xl p-8 bg-gray-900/30 backdrop-blur-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 font-medium italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-lime-400 font-medium">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-lime-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6 text-white">Ready to Start Trading?</h2>
          <p className="text-xl text-gray-300 mb-10 font-medium">Join thousands of traders using Vortex to beat the market</p>
          <Button asChild className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-12 py-4 h-auto rounded-lg text-lg">
            <a href={getLoginUrl()}>Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-lime-500/20 py-12 px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-medium">
          <p>© 2024 Vortex Trade. All rights reserved. | Trading involves risk.</p>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-lime-400 text-3xl font-bold"
            >
              ✕
            </button>
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-dashed border-lime-500/60">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Vortex Trade Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
