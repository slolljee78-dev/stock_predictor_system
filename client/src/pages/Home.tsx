import React, { useState, useEffect } from "react";
import { TrendingUp, Play, CheckCircle2, Star, Zap, Shield, Cpu, Gauge, BarChart3, ArrowUpRight } from "lucide-react";
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

      {/* Hero Section - Finance Tracker Style */}
      <section className="pt-32 pb-24 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* LEFT: Product Mockup */}
            <div className="relative order-2 lg:order-1">
              <div className="border-2 border-dashed border-lime-500/60 rounded-3xl p-1 bg-gradient-to-br from-lime-500/10 to-transparent backdrop-blur-sm">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 aspect-square lg:aspect-auto lg:h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Dashboard Preview Content */}
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                    <BarChart3 className="h-24 w-24 text-lime-400 animate-pulse" />
                    <div className="text-center space-y-2">
                      <p className="text-lime-400 font-bold text-lg">AI Trading Dashboard</p>
                      <p className="text-gray-400 text-sm font-medium">Real-time signals • Performance tracking</p>
                    </div>
                    
                    {/* Fake Dashboard Stats */}
                    <div className="grid grid-cols-2 gap-4 w-full px-8 mt-8">
                      <div className="bg-gray-800/50 border border-lime-500/30 rounded-lg p-4 text-center">
                        <p className="text-lime-400 font-bold text-2xl">87%</p>
                        <p className="text-gray-400 text-xs font-medium">Win Rate</p>
                      </div>
                      <div className="bg-gray-800/50 border border-lime-500/30 rounded-lg p-4 text-center">
                        <p className="text-lime-400 font-bold text-2xl">50K+</p>
                        <p className="text-gray-400 text-xs font-medium">Traders</p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-lime-500/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-lime-500/5 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm border-2 border-black">
                87% Accuracy
              </div>
            </div>

            {/* RIGHT: Text Content */}
            <div className="space-y-8 order-1 lg:order-2">
              {/* Subtitle Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-lime-500/50 rounded-full bg-lime-500/5">
                <Star className="h-4 w-4 text-lime-400 fill-lime-400" />
                <p className="text-xs font-bold text-lime-400 uppercase tracking-widest">AI-Powered Trading</p>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                  <span className="block text-white">Trade with</span>
                  <span className="block text-lime-400">Precision</span>
                </h1>
              </div>

              {/* Subheading */}
              <p className="text-lg text-gray-300 leading-relaxed max-w-lg font-medium">
                Institutional-grade AI signals with 87% accuracy. Trade any stock, any broker. No platform lock-in. Pure signal intelligence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-8 py-4 h-auto rounded-lg text-base flex items-center gap-2">
                  <a href={getLoginUrl()}>
                    Start Free Trial
                    <ArrowUpRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild className="border-2 border-dashed border-lime-500/60 hover:border-lime-400 text-lime-400 hover:text-lime-300 font-bold px-8 py-4 h-auto rounded-lg text-base bg-transparent hover:bg-lime-500/5">
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
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">24/7 market monitoring & alerts</span>
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
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">CORE FEATURES</p>
            <h2 className="text-5xl font-black mb-6 text-white">Powerful Trading Tools</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto font-medium">Everything you need to trade smarter with institutional-grade technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Real-Time Signals", desc: "Instant AI-generated buy and sell signals" },
              { icon: Shield, title: "Risk Management", desc: "Smart position sizing and stop-loss" },
              { icon: Cpu, title: "ML Models", desc: "LSTM, XGBoost, Ensemble algorithms" },
              { icon: Gauge, title: "Advanced Analytics", desc: "Deep market insights and trends" },
            ].map((feature, i) => (
              <div key={i} className="border-2 border-dashed border-lime-500/40 rounded-2xl p-8 bg-gray-900/30 backdrop-blur-sm hover:border-lime-400 transition-colors group">
                <feature.icon className="h-12 w-12 text-lime-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-lime-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">PRICING</p>
            <h2 className="text-5xl font-black mb-6 text-white">Simple, Transparent Pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$9.99",
                desc: "Perfect for beginners",
                features: ["10 signals/day", "Basic analytics", "Email support"],
                cta: "Get Started",
              },
              {
                name: "Professional",
                price: "$29.99",
                desc: "Most popular",
                badge: "Best Value",
                badgeColor: "bg-lime-500",
                features: ["50 signals/day", "Advanced analytics", "Priority support", "Risk management tools"],
                cta: "Get Started",
                highlighted: true,
              },
              {
                name: "Elite",
                price: "$99.99",
                desc: "For serious traders",
                features: ["Unlimited signals", "Full API access", "Dedicated support", "Custom strategies"],
                cta: "Get Started",
              },
            ].map((plan, i) => (
              <div key={i} className={`border-2 border-dashed rounded-2xl p-8 backdrop-blur-sm transition-all ${
                plan.highlighted 
                  ? "border-lime-500/80 bg-lime-500/5" 
                  : "border-lime-500/40 bg-gray-900/30 hover:border-lime-400"
              } relative`}>
                {plan.badge && (
                  <div className={`absolute -top-4 left-8 ${plan.badgeColor} text-black px-4 py-1 rounded-full font-bold text-xs uppercase`}>
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2 text-white">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6 font-medium">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-lime-400">{plan.price}</span>
                  <span className="text-gray-400 text-sm font-medium">/month</span>
                </div>
                <Button asChild className={`w-full font-bold py-3 h-auto rounded-lg mb-6 ${
                  plan.highlighted
                    ? "bg-lime-500 hover:bg-lime-600 text-black"
                    : "border-2 border-lime-500/60 text-lime-400 hover:text-lime-300 bg-transparent hover:bg-lime-500/5"
                }`}>
                  <a href={getLoginUrl()}>{plan.cta}</a>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
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
          <div className="text-center mb-12">
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">DEMO</p>
            <h2 className="text-4xl font-black mb-6 text-white">See It In Action</h2>
          </div>
          
          <div 
            className="border-2 border-dashed border-lime-500/60 rounded-3xl overflow-hidden cursor-pointer group bg-gray-900/30 backdrop-blur-sm hover:border-lime-400 transition-colors"
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
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm mb-4">TESTIMONIALS</p>
            <h2 className="text-4xl font-black mb-6 text-white">Loved by Traders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Day Trader", quote: "Vortex signals have transformed my trading. 87% accuracy is unmatched." },
              { name: "Mike Johnson", role: "Swing Trader", quote: "Finally, a platform that doesn't lock you in. Pure signal intelligence." },
              { name: "Alex Rodriguez", role: "Portfolio Manager", quote: "The risk management tools are institutional-grade. Highly recommend." },
            ].map((testimonial, i) => (
              <div key={i} className="border-2 border-dashed border-lime-500/40 rounded-2xl p-8 bg-gray-900/30 backdrop-blur-sm hover:border-lime-400 transition-colors">
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
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-dashed border-lime-500/60">
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
