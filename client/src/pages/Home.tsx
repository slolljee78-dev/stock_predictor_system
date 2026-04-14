import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap, Shield, LineChart, ArrowRight, Star, CheckCircle2, Lock, Cpu, Smartphone, TrendingDown, Award, Users, Settings, Play } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [visibleStats, setVisibleStats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1535] to-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D9FF] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Auto-redirect non-admin users to dashboard
  if (isAuthenticated && user?.role !== 'admin' && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1535] to-[#0A0E27] text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#0099FF]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#00D9FF]/10 bg-[#0A0E27]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#00D9FF] to-[#0099FF] rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#0A0E27]" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#00D9FF] via-[#0099FF] to-[#FFD700] bg-clip-text text-transparent">Vortex Trade</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Button asChild variant="outline" className="text-[#00D9FF] border-[#00D9FF]/30 hover:bg-[#00D9FF]/10">
                  <a href="/admin">Admin Dashboard</a>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-lg hover:shadow-[#00D9FF]/50 text-[#0A0E27] font-semibold">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </>
            )}
            {isAuthenticated && user?.role !== 'admin' && (
              <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-lg hover:shadow-[#00D9FF]/50 text-[#0A0E27] font-semibold">
                <a href="/dashboard">Dashboard</a>
              </Button>
            )}
            {!isAuthenticated && (
              <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-lg hover:shadow-[#00D9FF]/50 text-[#0A0E27] font-semibold">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Ultra Premium */}
      <section className="pt-40 pb-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-full backdrop-blur">
                <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
                <p className="text-sm font-semibold text-[#00D9FF]">AI-Powered Trading Signals</p>
              </div>
              
              <h1 className="text-7xl sm:text-8xl font-black leading-tight tracking-tighter">
                <span className="block mb-3">AI Signals</span>
                <span className="bg-gradient-to-r from-[#00D9FF] via-[#0099FF] to-[#FFD700] bg-clip-text text-transparent">Trade Smarter</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Get high-confidence buy and sell signals powered by ensemble ML models. Trade on any broker. No platform lock-in, pure signal intelligence.
              </p>

              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-xl hover:shadow-[#00D9FF]/50 text-[#0A0E27] font-semibold h-14 px-8 text-base gap-2 rounded-lg">
                    <a href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild className="border-2 border-[#00D9FF]/50 hover:bg-[#00D9FF]/10 text-[#00D9FF] font-semibold h-14 px-8 text-base rounded-lg">
                    <a href="#pricing">View Pricing</a>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-xl hover:shadow-[#00D9FF]/50 text-[#0A0E27] font-semibold h-14 px-8 text-base gap-2 rounded-lg">
                    <a href={getLoginUrl()}>
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild className="border-2 border-[#00D9FF]/50 hover:bg-[#00D9FF]/10 text-[#00D9FF] font-semibold h-14 px-8 text-base rounded-lg">
                    <a href="#features">View Features</a>
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099FF] border-2 border-[#0A0E27]"></div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  <span className="text-[#00D9FF] font-semibold">50K+</span> traders worldwide
                </p>
              </div>

              <p className="text-sm text-gray-500">✓ No credit card required • ✓ 7-day full access • ✓ Cancel anytime</p>
            </div>

            {/* Right: Premium Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "ML Model Accuracy", value: "98%", color: "from-[#0099FF]" },
                { label: "Active Traders", value: "50K+", color: "from-[#00D9FF]" },
                { label: "Market Monitoring", value: "24/7", color: "from-[#FFD700]" },
                { label: "Win Rate", value: "87%", color: "from-[#00FF41]" }
              ].map((stat, idx) => (
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-[#0F1535]/50 border border-[#00D9FF]/20 rounded-2xl p-8 backdrop-blur hover:border-[#00D9FF]/50 transition-all">
                    <div className={`text-5xl font-black bg-gradient-to-r ${stat.color} to-transparent bg-clip-text text-transparent mb-3`}>
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curved Divider */}
      <svg className="w-full h-32 text-[#0F1535]" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
      </svg>

      {/* Professional Trading Tools Section */}
      <section className="py-32 px-4 bg-[#0F1535]/50 relative" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6">Professional Trading Tools</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to make informed trading decisions and maximize returns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Cpu,
                title: "AI-Powered Signals",
                description: "LSTM neural networks + XGBoost ensemble",
                benefits: ["Real-time analysis", "Confidence scoring", "Sentiment analysis"]
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Portfolio-level protection & sizing",
                benefits: ["Stop-loss automation", "Kelly Criterion", "Correlation analysis"]
              },
              {
                icon: LineChart,
                title: "Performance Tracking",
                description: "Track accuracy and returns",
                benefits: ["Win rate tracking", "ROI calculation", "Historical analysis"]
              },
              {
                icon: Smartphone,
                title: "Multi-Broker Support",
                description: "Use signals on any broker",
                benefits: ["CSV export", "Email delivery", "API access"]
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-[#0A0E27]/50 border border-[#00D9FF]/20 rounded-2xl p-8 backdrop-blur hover:border-[#00D9FF]/50 transition-all hover:shadow-2xl hover:shadow-[#00D9FF]/20">
                  <feature.icon className="h-12 w-12 text-[#00D9FF] mb-4 group-hover:scale-110 group-hover:text-[#FFD700] transition-all" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00FF41] flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved Divider */}
      <svg className="w-full h-32 text-[#0A0E27]" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,100 600,50 T1200,50 L1200,0 L0,0 Z" fill="currentColor" />
      </svg>

      {/* Demo Video Section - Ultra Premium */}
      <section className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-6">See It In Action</h2>
            <p className="text-xl text-gray-400">Watch how Vortex Trade analyzes markets and generates signals in real-time</p>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/30 via-transparent to-[#FFD700]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#00D9FF]/30 group-hover:border-[#00D9FF]/60 transition-all">
              <div className="w-full bg-black relative" style={{aspectRatio: '16/9'}}>
                {/* Video Player with Premium Styling */}
                <video 
                  width="100%" 
                  height="100%" 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-contain"
                  controlsList="nodownload"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect fill='%230f172a' width='1280' height='720'/%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300d9ff;stop-opacity:0.3' /%3E%3Cstop offset='100%25' style='stop-color:%23ffd700;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1280' height='720'/%3E%3Ccircle cx='640' cy='360' r='80' fill='%2300d9ff' opacity='0.2'/%3E%3Ccircle cx='640' cy='360' r='60' fill='%2300d9ff' opacity='0.4'/%3E%3Cpolygon points='620,330 620,390 680,360' fill='%23ffffff' opacity='0.9'/%3E%3C/svg%3E"
                  onCanPlay={() => setIsVideoLoading(false)}
                  onLoadStart={() => setIsVideoLoading(true)}
                >
                  <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483836922/knJ3QkdJFvivzkyeUv8kpq/vortex-trade-demo_5ac55575.mp4" type="video/mp4" />
                  <p className="text-white p-4">Your browser does not support the video tag.</p>
                </video>
                
                {/* Loading State */}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-3 border-[#00D9FF]/20"></div>
                        <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#00D9FF] border-r-[#00D9FF] animate-spin"></div>
                      </div>
                      <p className="text-sm text-[#00D9FF] font-medium">Loading video...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-6">30-second demo: Trading signals, portfolio analysis, and risk management</p>
        </div>
      </section>

      {/* Curved Divider */}
      <svg className="w-full h-32 text-[#0F1535]" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
      </svg>

      {/* Trust & Social Proof Section */}
      <section className="py-32 px-4 bg-[#0F1535]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6">Trusted by Traders Worldwide</h2>
            <p className="text-xl text-gray-400">Join thousands of traders using Vortex Trade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: Users, label: "Active Traders", value: "50K+" },
              { icon: Award, label: "Average Rating", value: "4.8★" },
              { icon: TrendingUp, label: "Profits Generated", value: "£2.3M+" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <stat.icon className="h-16 w-16 text-[#00D9FF] mx-auto mb-4 group-hover:text-[#FFD700] group-hover:scale-110 transition-all" />
                <div className="text-5xl font-black bg-gradient-to-r from-[#00D9FF] to-[#0099FF] bg-clip-text text-transparent mb-2">{stat.value}</div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "James Mitchell",
                role: "Professional Trader",
                text: "Vortex Trade has transformed my trading strategy. The AI signals are incredibly accurate and the risk management features give me peace of mind.",
                rating: 5
              },
              {
                name: "Sarah Chen",
                role: "Beginner Investor",
                text: "I was intimidated by trading, but Vortex Trade makes it simple and accessible. The education and signals have helped me build confidence.",
                rating: 5
              },
              {
                name: "Marcus Johnson",
                role: "Fund Manager",
                text: "The ensemble ML models and sentiment analysis are best-in-class. We've integrated Vortex Trade into our institutional strategy.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-[#0A0E27]/50 border border-[#00D9FF]/20 rounded-2xl p-8 backdrop-blur hover:border-[#00D9FF]/50 transition-all">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-[#FFD700] fill-[#FFD700]" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved Divider */}
      <svg className="w-full h-32 text-[#0A0E27]" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,100 600,50 T1200,50 L1200,0 L0,0 Z" fill="currentColor" />
      </svg>

      {/* Pricing Section */}
      <section className="py-32 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "£0",
                period: "/month",
                description: "Perfect for beginners",
                features: ["20 stocks", "Basic signals", "Email support"],
                cta: "Get Started",
                highlighted: false
              },
              {
                name: "Professional",
                price: "£29",
                period: "/month",
                description: "For serious traders",
                features: ["Unlimited stocks", "ML signals", "Advanced analytics", "Broker integration", "Priority support"],
                cta: "Start Free Trial",
                highlighted: true
              },
              {
                name: "Elite",
                price: "£99",
                period: "/month",
                description: "For professionals",
                features: ["Everything in Pro", "API access", "Custom models", "Dedicated support"],
                cta: "Get Started",
                highlighted: false
              }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-2xl p-8 border transition-all ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-[#00D9FF]/20 to-[#FFD700]/10 border-[#00D9FF]/50 shadow-2xl shadow-[#00D9FF]/30' 
                    : 'bg-[#0A0E27]/50 border-[#00D9FF]/20 hover:border-[#00D9FF]/50'
                }`}
              >
                {plan.highlighted && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/10 to-transparent rounded-2xl blur-2xl"></div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00D9FF] to-[#FFD700] text-[#0A0E27] px-6 py-2 rounded-full text-xs font-black">
                      POPULAR
                    </div>
                  </>
                )}
                
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-6xl font-black bg-gradient-to-r from-[#00D9FF] to-[#0099FF] bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>

                  {!isAuthenticated && (
                    <Button 
                      asChild 
                      className={`w-full mb-8 h-12 rounded-lg font-semibold transition-all ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-lg hover:shadow-[#00D9FF]/50 text-[#0A0E27]'
                          : 'border-2 border-[#00D9FF]/30 hover:border-[#00D9FF]/60 hover:bg-[#00D9FF]/10 text-[#00D9FF]'
                      }`}
                    >
                      <a href={getLoginUrl()}>{plan.cta}</a>
                    </Button>
                  )}

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                        <CheckCircle2 className="h-5 w-5 text-[#00FF41] flex-shrink-0" />
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

      {/* Curved Divider */}
      <svg className="w-full h-32 text-[#0F1535]" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
      </svg>

      {/* Final CTA Section - Premium */}
      <section className="py-32 px-4 bg-gradient-to-r from-[#00D9FF]/10 via-transparent to-[#FFD700]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E27]/50 to-[#0A0E27]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl font-black mb-6">Ready to Trade Smarter?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join thousands of traders using Vortex Trade to maximize returns and minimize risk.</p>
          
          {!isAuthenticated && (
            <Button asChild className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:shadow-2xl hover:shadow-[#00D9FF]/50 text-[#0A0E27] font-bold h-16 px-12 text-lg rounded-lg gap-2 transition-all">
              <a href={getLoginUrl()}>
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00D9FF]/10 py-12 px-4 bg-[#0A0E27]/50">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Vortex Trade. All rights reserved. | Regulated by FCA | Secure & Encrypted</p>
        </div>
      </footer>
    </div>
  );
}
