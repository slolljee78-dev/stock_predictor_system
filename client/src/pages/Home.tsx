import React, { useState, useEffect } from "react";
import { TrendingUp, Play, ArrowRight, CheckCircle2, Star, Users, Zap, Shield, Lock, BarChart3 } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role !== 'admin' && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-hidden">
      {/* Subtle background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-semibold text-slate-50 tracking-tight">Vortex</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Button asChild variant="ghost" className="text-slate-400 hover:text-slate-50 text-sm">
                  <a href="/admin">Admin</a>
                </Button>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 h-auto text-sm rounded-lg">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </>
            )}
            {isAuthenticated && user?.role !== 'admin' && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 h-auto text-sm rounded-lg">
                <a href="/dashboard">Dashboard</a>
              </Button>
            )}
            {!isAuthenticated && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 h-auto text-sm rounded-lg">
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
            {/* Left: Text Content */}
            <div className="space-y-8">
              {/* Subtitle */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <Star className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide">AI Trading Intelligence</p>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-tight tracking-tight">
                <span className="block text-slate-50 font-light">Trade with</span>
                <span className="block text-emerald-400 font-semibold">Precision</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg font-light">
                AI-powered signals with institutional-grade accuracy. Trade any stock, any broker. No platform lock-in.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 h-auto rounded-lg text-base">
                  <a href={getLoginUrl()}>Start Free Trial</a>
                </Button>
                <Button asChild variant="outline" className="border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-slate-50 font-medium px-8 py-3 h-auto rounded-lg text-base">
                  <a href="#features">Learn More</a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3 pt-8 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-400">No credit card required • 7-day full access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-400">50K+ active traders worldwide</span>
                </div>
              </div>
            </div>

            {/* Right: Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Win Rate", value: "87%" },
                { label: "Active Traders", value: "50K+" },
                { label: "Market Monitoring", value: "24/7" },
                { label: "Accuracy", value: "98%" },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                  <p className="text-3xl font-semibold text-emerald-400 mb-2">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-slate-50">Why Choose Vortex</h2>
            <p className="text-lg text-slate-400 max-w-2xl font-light">Everything you need to trade smarter and more profitably</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Real-Time Signals", desc: "Instant AI-generated buy and sell signals" },
              { icon: Shield, title: "Risk Management", desc: "Smart position sizing and stop-loss" },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Deep market insights and trends" },
              { icon: Lock, title: "Secure & Private", desc: "Enterprise-grade security standards" },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm hover:border-emerald-500/30 transition-colors group">
                <feature.icon className="h-10 w-10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-medium mb-2 text-slate-50">{feature.title}</h3>
                <p className="text-sm text-slate-400 font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div 
            className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden cursor-pointer group backdrop-blur-sm hover:border-emerald-500/30 transition-colors"
            onClick={() => setShowVideoModal(true)}
          >
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/30">
                  <Play className="h-8 w-8 text-emerald-400 fill-emerald-400 ml-0.5" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-slate-50">Watch Demo</p>
                  <p className="text-sm text-slate-400">2 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-light mb-6 text-slate-50">Simple Pricing</h2>
            <p className="text-lg text-slate-400 font-light">Choose the plan that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$29",
                desc: "For beginners",
                features: ["10 stocks", "50 signals/day", "Basic analytics", "Email support"],
              },
              {
                name: "Professional",
                price: "$99",
                desc: "Most popular",
                features: ["Unlimited stocks", "Unlimited signals", "Advanced analytics", "Priority support", "API access"],
                featured: true,
              },
              {
                name: "Elite",
                price: "$299",
                desc: "For institutions",
                features: ["Everything in Pro", "Custom signals", "Dedicated support", "White-label option"],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-8 border transition-all ${
                  plan.featured
                    ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/20"
                    : "bg-slate-800/30 border-slate-700/50 hover:border-emerald-500/30"
                }`}
              >
                {plan.featured && (
                  <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium text-xs rounded-full mb-4">
                    Recommended
                  </div>
                )}
                <h3 className="text-xl font-medium mb-2 text-slate-50">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-6 font-light">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-4xl font-semibold text-slate-50">{plan.price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <Button asChild className={`w-full font-medium py-2.5 h-auto mb-8 rounded-lg ${plan.featured ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-50"}`}>
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-6 text-slate-50">Ready to Start?</h2>
          <p className="text-lg text-slate-400 mb-10 font-light">Join thousands of traders using Vortex to beat the market</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-10 py-3 h-auto rounded-lg text-base">
            <a href={getLoginUrl()}>Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 Vortex Trade. All rights reserved. | Trading involves risk.</p>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-slate-400 hover:text-slate-50 text-2xl font-light"
            >
              ✕
            </button>
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50">
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
