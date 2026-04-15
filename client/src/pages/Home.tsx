import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Bell, Zap, Shield, LineChart, ArrowRight, ChevronRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-primary/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-primary">📈</div>
            <span className="text-2xl font-black text-foreground">Stock Predictor</span>
          </div>
          {isAuthenticated ? (
            <Button onClick={() => setLocation("/dashboard")} className="gap-2 bg-primary text-primary-foreground font-bold text-lg">
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="gap-2 bg-primary text-primary-foreground font-bold text-lg">
              <a href={getLoginUrl()}>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-40">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border-2 border-dashed border-primary">
              <p className="text-sm font-bold text-primary uppercase tracking-wider">🤖 AI-Powered Trading Intelligence</p>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black leading-tight tracking-tighter">
              Trading Signals
              <br />
              <span className="text-primary">Powered by AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Get intelligent buy/sell signals for Trading 212 stocks with advanced technical analysis, machine learning, and real-time market insights.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button asChild size="lg" className="gap-2 bg-primary text-primary-foreground font-bold text-lg h-14 px-8">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 border-2 border-primary text-primary font-bold text-lg h-14 px-8">
                  <a href="#features">
                    Learn More
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            )}

            <div className="pt-8 text-sm text-muted-foreground font-medium">
              ⭐ Trusted by 2,400+ traders worldwide
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-primary/20">
          <div className="text-center mb-20">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">OUR FEATURES</span>
            <h2 className="text-6xl md:text-7xl font-black mt-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">Everything you need to make smarter trading decisions</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Technical Analysis",
                description: "RSI, MACD, Bollinger Bands, Moving Averages and more",
              },
              {
                icon: Zap,
                title: "ML Signals",
                description: "AI-generated signals with confidence scores",
              },
              {
                icon: Bell,
                title: "Real-Time Alerts",
                description: "Get instant notifications for buy/sell signals",
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group p-8 rounded-lg border-2 border-dashed border-primary hover:border-primary/80 bg-card hover:bg-card/80 transition-all duration-300">
                  <div className="p-4 bg-primary/20 rounded-lg w-fit mb-6 group-hover:bg-primary/30 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-black text-2xl mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Demo Video Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-primary/20">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-7xl font-black mb-6">See It In Action</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Watch how to use Stock Predictor to find trading opportunities</p>
          </div>
          
          <div className="rounded-lg border-2 border-dashed border-primary overflow-hidden shadow-2xl bg-black">
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

        {/* Pricing Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-primary/20">
          <div className="text-center mb-20">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">PRICING</span>
            <h2 className="text-6xl md:text-7xl font-black mt-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">Start free, upgrade anytime</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="border-2 border-dashed border-primary p-8 rounded-lg bg-card">
              <div className="text-sm font-bold text-primary mb-4 uppercase">FREE</div>
              <h3 className="text-3xl font-black mb-2">Get Started</h3>
              <p className="text-4xl font-black text-primary mb-8">$0</p>
              <ul className="space-y-4 mb-8 text-muted-foreground text-lg">
                <li>✓ 10 stocks in watchlist</li>
                <li>✓ Basic signals</li>
                <li>✓ Daily updates</li>
              </ul>
              <Button className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
                Start Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-dashed border-primary p-8 rounded-lg bg-card relative">
              <div className="absolute -top-4 left-4">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase">Popular</span>
              </div>
              <div className="text-sm font-bold text-primary mb-4 uppercase">PRO</div>
              <h3 className="text-3xl font-black mb-2">Advanced Trading</h3>
              <p className="text-4xl font-black text-primary mb-8">$9.99<span className="text-lg text-muted-foreground">/mo</span></p>
              <ul className="space-y-4 mb-8 text-muted-foreground text-lg">
                <li>✓ Unlimited stocks</li>
                <li>✓ Advanced signals</li>
                <li>✓ Real-time alerts</li>
                <li>✓ Priority support</li>
              </ul>
              <Button className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-primary/20">
          <div className="bg-card border-2 border-dashed border-primary rounded-lg p-12 md:p-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <LineChart className="h-8 w-8 text-primary" />
              <p className="text-3xl font-black">Monitor 212 Stocks</p>
            </div>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">Get started with AI-powered stock analysis and make informed trading decisions today</p>
            {!isAuthenticated && (
              <Button asChild size="lg" className="gap-2 bg-primary text-primary-foreground font-bold text-lg h-14 px-8">
                <a href={getLoginUrl()}>
                  Start Analyzing Now
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-primary/20 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
            <p>© 2026 Stock Predictor. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
