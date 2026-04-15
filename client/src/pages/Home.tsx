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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Stock Predictor</span>
          </div>
          {isAuthenticated ? (
            <Button onClick={() => setLocation("/dashboard")} className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
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
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30">
              <p className="text-sm font-semibold text-cyan-400">🚀 AI-Powered Trading Intelligence</p>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter">
              Trading Signals
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              Get intelligent buy/sell signals for Trading 212 stocks with advanced technical analysis, machine learning, and real-time market insights.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button asChild size="lg" className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-lg h-14 px-8">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 font-semibold text-lg h-14 px-8">
                  <a href="#features">
                    Learn More
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">Powerful Features</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to make smarter trading decisions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Technical Analysis",
                description: "RSI, MACD, Bollinger Bands, Moving Averages",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: Zap,
                title: "ML Signals",
                description: "AI-generated signals with confidence scores",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                description: "Real-time notifications for buy/sell signals",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is encrypted and never shared",
                color: "from-pink-500 to-red-500"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group p-8 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
                  <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Demo Video Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">See It In Action</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Watch how to use Stock Predictor to find trading opportunities</p>
          </div>
          
          <div className="rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-cyan-500/20 bg-black">
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

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-12 md:p-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <LineChart className="h-7 w-7 text-cyan-400" />
              <p className="text-2xl font-bold">Monitor 212 Trading 212 Stocks</p>
            </div>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">Get started with AI-powered stock analysis and make informed trading decisions today</p>
            {!isAuthenticated && (
              <Button asChild size="lg" className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-lg h-14 px-8">
                <a href={getLoginUrl()}>
                  Start Analyzing Now
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
            <p>© 2026 Stock Predictor. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
