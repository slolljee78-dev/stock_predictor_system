import React, { useState, useEffect } from "react";
import { TrendingUp, Play, ArrowRight, CheckCircle2, Star, Users, Zap, Shield } from "lucide-react";
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
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
      <nav className="fixed top-0 w-full z-50 border-b border-gray-900 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-black font-bold" />
            </div>
            <span className="text-2xl font-black tracking-tight">Vortex</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
                  <a href="/admin">Admin</a>
                </Button>
                <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-6">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </>
            )}
            {isAuthenticated && user?.role !== 'admin' && (
              <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-6">
                <a href="/dashboard">Dashboard</a>
              </Button>
            )}
            {!isAuthenticated && (
              <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8 py-2 h-auto text-base">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Truly Premium */}
      <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: Text Content */}
            <div className="space-y-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full backdrop-blur">
                <Star className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                <p className="text-sm font-semibold text-cyan-400">AI-Powered Trading Intelligence</p>
              </div>

              {/* Main Headline - HUGE and Bold */}
              <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tighter">
                <span className="block text-white">Trade</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Smarter</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-lg font-light">
                AI-powered signals with 87% accuracy. Trade any stock, any broker. No lock-in. Pure intelligence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-lg px-10 py-7 h-auto rounded-lg">
                  <a href={getLoginUrl()}>Start Free Trial</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 hover:border-cyan-400 text-white font-bold text-lg px-10 py-7 h-auto rounded-lg">
                  <a href="#features">View Features</a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-4 pt-8 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-300">No credit card required • 7-day full access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-300">50K+ active traders worldwide</span>
                </div>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 backdrop-blur hover:border-cyan-500/30 transition-colors">
                <p className="text-5xl font-black text-cyan-400 mb-2">87%</p>
                <p className="text-gray-400 font-medium">Win Rate</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 backdrop-blur hover:border-cyan-500/30 transition-colors">
                <p className="text-5xl font-black text-cyan-400 mb-2">50K+</p>
                <p className="text-gray-400 font-medium">Active Traders</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 backdrop-blur hover:border-cyan-500/30 transition-colors">
                <p className="text-5xl font-black text-cyan-400 mb-2">24/7</p>
                <p className="text-gray-400 font-medium">Market Monitoring</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 backdrop-blur hover:border-cyan-500/30 transition-colors">
                <p className="text-5xl font-black text-cyan-400 mb-2">98%</p>
                <p className="text-gray-400 font-medium">Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">Why Traders Choose Vortex</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to trade smarter, faster, and more profitably</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Real-time signals delivered instantly" },
              { icon: Shield, title: "Risk Management", desc: "Smart stop-loss and position sizing" },
              { icon: Users, title: "Community", desc: "Join 50K+ profitable traders" },
              { icon: TrendingUp, title: "Proven Results", desc: "87% win rate across all markets" },
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all group">
                <feature.icon className="h-12 w-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div 
              className="relative bg-black rounded-3xl border border-gray-800 overflow-hidden cursor-pointer group"
              onClick={() => setShowVideoModal(true)}
            >
              {/* Video Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-12 w-12 text-cyan-400 fill-cyan-400 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
                  <p className="text-lg font-semibold">See Vortex in Action</p>
                  <p className="text-gray-400 text-sm">2 min demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Choose the plan that fits your trading style</p>
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
                className={`rounded-2xl p-10 border transition-all ${
                  plan.featured
                    ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 scale-105 shadow-2xl shadow-cyan-500/20"
                    : "bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-cyan-500/30"
                }`}
              >
                {plan.featured && (
                  <div className="inline-block px-4 py-1 bg-cyan-500 text-black font-bold text-sm rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <Button asChild className={`w-full font-bold py-3 h-auto mb-8 ${plan.featured ? "bg-cyan-500 hover:bg-cyan-600 text-black" : "bg-gray-800 hover:bg-gray-700 text-white"}`}>
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
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
      <section className="py-24 px-6 lg:px-8 border-t border-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black mb-8">Ready to Trade Smarter?</h2>
          <p className="text-xl text-gray-400 mb-12">Join thousands of traders already using Vortex to beat the market</p>
          <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-lg px-12 py-7 h-auto rounded-lg">
            <a href={getLoginUrl()}>Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Vortex Trade. All rights reserved. | Trading involves risk.</p>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
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
