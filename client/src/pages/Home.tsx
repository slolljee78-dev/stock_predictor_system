import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap, Shield, LineChart, ArrowRight, Star, CheckCircle2, Lock, Cpu, Smartphone, TrendingDown, Award, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [visibleStats, setVisibleStats] = useState<Record<string, boolean>>({});

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

      {/* Hero Section - Asymmetrical with Device Mockup */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-gold/5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-card border border-border rounded-full">
                <Star className="h-4 w-4 text-accent-gold fill-accent-gold" />
                <p className="text-sm font-semibold text-foreground">Enterprise-Grade AI Trading</p>
              </div>
              
              <h1 className="text-6xl sm:text-7xl font-black mb-6 leading-tight tracking-tighter">
                <span className="block mb-2">Trade Smarter</span>
                <span className="bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-cyan bg-clip-text text-transparent">With AI Precision</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Vortex Trade combines advanced machine learning, real-time market analysis, and professional-grade risk management to deliver trading signals that work. Join traders who are already profiting.
              </p>

              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button asChild className="bg-accent hover:bg-accent/90 text-background font-semibold h-12 px-8 text-base gap-2 rounded-lg">
                    <a href={getLoginUrl()}>
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild className="border border-border hover:bg-card font-semibold h-12 px-8 text-base rounded-lg">
                    <a href="#features">View Features</a>
                  </Button>
                </div>
              )}

              <p className="text-sm text-muted-foreground">✓ No credit card required • ✓ 7-day full access • ✓ Cancel anytime</p>
            </div>

            {/* Right: Stats Grid (Premium Layout) */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur hover:border-accent-cyan/50 transition-colors">
                <div className="text-4xl font-black text-accent-emerald mb-2">98%</div>
                <p className="text-sm text-muted-foreground font-medium">ML Model Accuracy</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur hover:border-accent-cyan/50 transition-colors">
                <div className="text-4xl font-black text-accent-cyan mb-2">50K+</div>
                <p className="text-sm text-muted-foreground font-medium">Active Traders</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur hover:border-accent-gold/50 transition-colors">
                <div className="text-4xl font-black text-accent-gold mb-2">24/7</div>
                <p className="text-sm text-muted-foreground font-medium">Market Monitoring</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur hover:border-accent-emerald/50 transition-colors">
                <div className="text-4xl font-black text-accent-emerald mb-2">87%</div>
                <p className="text-sm text-muted-foreground font-medium">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curved Divider SVG */}
      <svg className="w-full h-24 text-card" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
      </svg>

      {/* Professional Trading Tools Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Professional Trading Tools</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to make informed trading decisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Cards */}
            {[
              {
                icon: Cpu,
                title: "AI-Powered Signals",
                description: "LSTM neural networks + XGBoost ensemble for 98% accuracy",
                benefits: ["Real-time analysis", "Confidence scoring", "Sentiment analysis"]
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Kelly Criterion sizing + correlation analysis",
                benefits: ["Position sizing", "Drawdown limits", "VaR calculations"]
              },
              {
                icon: LineChart,
                title: "Advanced Analytics",
                description: "Professional-grade performance metrics",
                benefits: ["Sharpe ratio", "Max drawdown", "Attribution analysis"]
              },
              {
                icon: Smartphone,
                title: "Broker Integration",
                description: "Connect to Trading 212, Alpaca, Interactive Brokers",
                benefits: ["Live execution", "Position tracking", "Trade history"]
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-background border border-border/50 rounded-2xl p-8 hover:border-accent-cyan/50 transition-all hover:shadow-lg hover:shadow-accent-cyan/10 group">
                <feature.icon className="h-10 w-10 text-accent-cyan mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-accent-emerald flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved Divider SVG */}
      <svg className="w-full h-24 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,100 600,50 T1200,50 L1200,0 L0,0 Z" fill="currentColor" />
      </svg>

      {/* Demo Video Section */}
      <section className="py-20 px-4 bg-card/30 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground">Watch how Vortex Trade generates AI-powered trading signals</p>
          </div>
          
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
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

      {/* Curved Divider SVG */}
      <svg className="w-full h-24 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
      </svg>

      {/* Trust & Social Proof Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Trusted by Traders Worldwide</h2>
            <p className="text-xl text-muted-foreground">Join thousands of traders using Vortex Trade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <Users className="h-12 w-12 text-accent-cyan mx-auto mb-4" />
              <div className="text-4xl font-black mb-2">50K+</div>
              <p className="text-muted-foreground">Active Traders</p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 text-accent-gold mx-auto mb-4" />
              <div className="text-4xl font-black mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-accent-emerald mx-auto mb-4" />
              <div className="text-4xl font-black mb-2">£2.3M</div>
              <p className="text-muted-foreground">Profits Generated</p>
            </div>
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
              <div key={idx} className="bg-card border border-border/50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent-gold fill-accent-gold" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved Divider SVG */}
      <svg className="w-full h-24 text-card" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,100 600,50 T1200,50 L1200,0 L0,0 Z" fill="currentColor" />
      </svg>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-card/30" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "£0",
                period: "/month",
                description: "Perfect for beginners",
                features: ["20 stocks", "Basic signals", "Advanced analytics"],
                cta: "Get Started",
                highlighted: false
              },
              {
                name: "Professional",
                price: "£29",
                period: "/month",
                description: "For serious traders",
                features: ["Unlimited stocks", "ML signals", "Advanced analytics", "Broker integration"],
                cta: "Start Free Trial",
                highlighted: true
              },
              {
                name: "Elite",
                price: "£99",
                period: "/month",
                description: "For professionals",
                features: ["Everything in Pro", "API access", "Priority support", "Custom models"],
                cta: "Get Started",
                highlighted: false
              }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl p-8 border transition-all ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-accent-cyan/10 to-accent-emerald/10 border-accent-cyan/50 shadow-lg shadow-accent-cyan/20 relative' 
                    : 'bg-background border-border/50 hover:border-accent-cyan/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent-cyan text-background px-4 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {!isAuthenticated && (
                  <Button 
                    asChild 
                    className={`w-full mb-8 h-11 rounded-lg font-semibold ${
                      plan.highlighted
                        ? 'bg-accent hover:bg-accent/90 text-background'
                        : 'border border-border hover:bg-card'
                    }`}
                  >
                    <a href={getLoginUrl()}>{plan.cta}</a>
                  </Button>
                )}

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent-emerald flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved Divider SVG */}
      <svg className="w-full h-24 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{display: 'block', margin: '-1px 0'}}>
        <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
      </svg>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6">Ready to Trade Smarter?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join thousands of traders using Vortex Trade to maximize returns and minimize risk.</p>
          
          {!isAuthenticated && (
            <Button asChild className="bg-accent hover:bg-accent/90 text-background font-semibold h-14 px-12 text-lg rounded-lg gap-2">
              <a href={getLoginUrl()}>
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2026 Vortex Trade. All rights reserved. | Regulated by FCA | Secure & Encrypted</p>
        </div>
      </footer>
    </div>
  );
}
