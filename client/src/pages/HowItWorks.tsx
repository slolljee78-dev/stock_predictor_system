import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb, Zap, TrendingUp, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function HowItWorks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:px-8 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,151,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(88,212,255,0.08),transparent_35%)]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit rounded-full px-4 py-2">
              How Vortextrade Works
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              AI-Powered Trading Signals Explained
            </h1>
            <p className="text-xl text-muted-foreground">
              Understand how our machine learning algorithms analyze market data to generate high-confidence buy and sell signals for your trading strategy.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setLocation('/dashboard')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setLocation('/pricing')}>
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Process */}
      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">The Vortextrade Process</h2>
            <p className="text-lg text-muted-foreground">Five steps to AI-powered trading signals</p>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: Lightbulb,
                step: 'Step 1',
                title: 'Data Collection',
                description: 'We collect real-time and historical price data, volume information, and technical indicators from multiple market sources for all Trading 212 stocks.'
              },
              {
                icon: BarChart3,
                step: 'Step 2',
                title: 'Technical Analysis',
                description: 'Our algorithms calculate 50+ technical indicators including RSI, MACD, Bollinger Bands, and moving averages to identify market patterns and trends.'
              },
              {
                icon: Zap,
                step: 'Step 3',
                title: 'ML Signal Generation',
                description: 'Machine learning models analyze the technical data to generate buy, sell, and hold signals with confidence scores based on historical pattern recognition.'
              },
              {
                icon: CheckCircle2,
                step: 'Step 4',
                title: 'Signal Validation',
                description: 'Each signal is validated against multiple criteria including volume confirmation, trend alignment, and support/resistance levels for accuracy.'
              },
              {
                icon: AlertCircle,
                step: 'Step 5',
                title: 'Alert & Notification',
                description: 'High-confidence signals are delivered to your dashboard in real-time with detailed analysis, entry points, and risk management recommendations.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{item.step}</p>
                  <h3 className="mt-1 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signal Types */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Understanding Our Signals</h2>
            <p className="text-lg text-muted-foreground">Three signal types to guide your trading decisions</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Buy Signals',
                color: 'text-green-500',
                description: 'Technical indicators suggest upward momentum. Entry point identified with profit target and stop-loss recommendations.'
              },
              {
                title: 'Sell Signals',
                color: 'text-red-500',
                description: 'Technical indicators suggest downward momentum or reversal. Exit point identified to protect profits or limit losses.'
              },
              {
                title: 'Hold Signals',
                color: 'text-yellow-500',
                description: 'Market conditions are neutral or consolidating. Recommended to maintain current positions and wait for clearer signals.'
              }
            ].map((signal) => (
              <Card key={signal.title} className="border-border/50">
                <CardHeader>
                  <CardTitle className={`text-lg ${signal.color}`}>{signal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{signal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Confidence Scoring */}
      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Confidence Scoring System</h2>
            <p className="text-lg text-muted-foreground">How we measure signal reliability</p>
          </div>

          <div className="space-y-4">
            {[
              { range: '90-100%', label: 'Extremely High Confidence', description: 'Multiple indicators aligned, strong volume confirmation, clear technical pattern' },
              { range: '75-89%', label: 'High Confidence', description: 'Most indicators aligned, reasonable volume, established trend' },
              { range: '60-74%', label: 'Moderate Confidence', description: 'Mixed indicators, moderate volume, developing pattern' },
              { range: 'Below 60%', label: 'Low Confidence', description: 'Conflicting signals, low volume, uncertain market conditions' }
            ].map((item) => (
              <Card key={item.range} className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                    <Badge variant="secondary">{item.range}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Key Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need for smarter trading</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              'Real-time signal generation and delivery',
              'Advanced technical indicator analysis',
              'Machine learning pattern recognition',
              'Signal accuracy tracking and validation',
              'Risk management recommendations',
              'Trading simulator for backtesting',
              'Customizable alert preferences',
              'Signal history and performance analytics'
            ].map((feature) => (
              <div key={feature} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <p className="text-muted-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Trade Smarter?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start receiving AI-powered trading signals today and take your trading to the next level
          </p>
          <Button size="lg" className="mt-8" onClick={() => setLocation('/dashboard')}>
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
