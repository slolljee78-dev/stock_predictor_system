import React, { useState, useEffect } from "react";
import { TrendingUp, Play, CheckCircle2, Star, Zap, Shield, Cpu, Gauge, BarChart3, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

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
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 h-auto text-sm rounded-lg">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean, Text-Focused */}
      <section className="pt-32 pb-16 px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-3 border border-emerald-500/50 rounded-full bg-emerald-500/10 mb-8">
            <Zap className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">AI-POWERED TRADING SIGNALS</p>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-8">
            <span className="block text-white">Trade with</span>
            <span className="block text-emerald-400">Precision</span>
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-8 font-medium max-w-3xl">
            Institutional-grade AI signals with 87% accuracy. Get real-time buy and sell signals powered by ensemble ML models. Trade any stock, any broker. No platform lock-in, pure signal intelligence.
          </p>

          {/* Additional Info */}
          <p className="text-base text-gray-400 mb-12 font-medium max-w-3xl">
            ✨ NOW WITH ADVANCED RISK MANAGEMENT: Smart position sizing, stop-loss automation, and portfolio-level correlation analysis. Works with any broker.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-4 h-auto rounded-lg text-base flex items-center gap-2 group">
              <a href={getLoginUrl()}>
                <ShoppingCart className="h-5 w-5" />
                Start Free Trial
              </a>
            </Button>
            <Button asChild className="border-2 border-emerald-500/60 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-bold px-8 py-4 h-auto rounded-lg text-base bg-transparent hover:bg-emerald-500/5 flex items-center gap-2">
              <a href="#features">
                View Features
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-3 border-t border-emerald-500/20 pt-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 font-medium">No credit card required • 7-day full access • Cancel anytime</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 font-medium">50K+ active traders worldwide</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 font-medium">24/7 market monitoring & instant alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">Powerful Trading Features</h2>
          <p className="text-lg text-gray-400 mb-12 font-medium">Everything you need to trade smarter with institutional-grade technology</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: "Real-Time Signals", desc: "Instant AI-generated buy and sell signals with 87% accuracy" },
              { icon: Shield, title: "Risk Management", desc: "Smart position sizing, stop-loss automation, and portfolio analysis" },
              { icon: Cpu, title: "ML Models", desc: "LSTM, XGBoost, and Ensemble algorithms for market prediction" },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Deep market insights, trend analysis, and performance tracking" },
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400 font-medium">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Pricing Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">Simple Pricing</h2>
          <p className="text-lg text-gray-400 mb-12 font-medium">Choose the plan that fits your trading style</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$9.99",
                features: ["10 signals/day", "Basic analytics", "Email support"],
              },
              {
                name: "Professional",
                price: "$29.99",
                badge: "Most Popular",
                features: ["50 signals/day", "Advanced analytics", "Priority support", "Risk management tools"],
                highlighted: true,
              },
              {
                name: "Elite",
                price: "$99.99",
                features: ["Unlimited signals", "Full API access", "Dedicated support", "Custom strategies"],
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 transition-all ${
                plan.highlighted 
                  ? "bg-emerald-500/10 border-2 border-emerald-500/60" 
                  : "bg-gray-900/30 border border-gray-800 hover:border-emerald-500/40"
              }`}>
                {plan.badge && (
                  <div className="bg-emerald-500 text-black px-4 py-1 rounded-full font-bold text-xs uppercase mb-4 inline-block">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2 text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-emerald-400">{plan.price}</span>
                  <span className="text-gray-400 text-sm font-medium">/month</span>
                </div>
                <Button asChild className={`w-full font-bold py-3 h-auto rounded-lg mb-6 ${
                  plan.highlighted
                    ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                    : "border-2 border-emerald-500/60 text-emerald-400 hover:text-emerald-300 bg-transparent hover:bg-emerald-500/5"
                }`}>
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Video Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">See It In Action</h2>
          <p className="text-lg text-gray-400 mb-12 font-medium">Watch how Vortex generates high-accuracy trading signals</p>
          
          <div 
            className="rounded-2xl overflow-hidden cursor-pointer group bg-gray-900/30 border border-emerald-500/30 hover:border-emerald-400 transition-all"
            onClick={() => setShowVideoModal(true)}
          >
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-emerald-500/50">
                  <Play className="h-10 w-10 text-emerald-400 fill-emerald-400 ml-1" />
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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

      {/* Testimonials Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-white">Loved by Traders</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Day Trader", quote: "Vortex signals have transformed my trading. 87% accuracy is unmatched." },
              { name: "Mike Johnson", role: "Swing Trader", quote: "Finally, a platform that doesn't lock you in. Pure signal intelligence." },
              { name: "Alex Rodriguez", role: "Portfolio Manager", quote: "The risk management tools are institutional-grade. Highly recommend." },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-900/30 border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 font-medium italic">"{testimonial.quote}"</p>
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

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-emerald-400 text-3xl font-bold"
            >
              ✕
            </button>
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-emerald-500/60">
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
