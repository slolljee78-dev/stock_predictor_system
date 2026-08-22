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
              Understand how available daily market data and transparent technical rules produce buy, sell, or hold context for your own research.
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
                description: 'We use available daily OHLCV market data from the configured provider integration. Timing and coverage can vary with market hours, provider availability, and rate limits.'
              },
              {
                icon: BarChart3,
                step: 'Step 2',
                title: 'Technical Analysis',
                description: 'The current rule set calculates RSI (14), MACD (12/26), 20- and 50-period moving averages, and 20-period Bollinger Bands.'
              },
              {
                icon: Zap,
                step: 'Step 3',
                title: 'Directional Signal Context',
                description: 'Weighted technical-rule agreement produces buy, sell, or hold context. Mixed or incomplete evidence produces a hold rather than a forced directional signal.'
              },
              {
                icon: CheckCircle2,
                step: 'Step 4',
                title: 'Confidence and Limits',
                description: 'Confidence is a capped indicator-consensus score, not a probability of profit. It is reduced when directional evidence is mixed.'
              },
              {
                icon: AlertCircle,
                step: 'Step 5',
                title: 'Review and Paper Trade',
                description: 'Available signals can be reviewed in the workspace and used in paper-trading workflows. The product does not execute broker orders or give personalised advice.'
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
                description: 'The implemented technical rules indicate stronger upward than downward directional evidence at the recorded data point.'
              },
              {
                title: 'Sell Signals',
                color: 'text-red-500',
                description: 'The implemented technical rules indicate stronger downward than upward directional evidence at the recorded data point.'
              },
              {
                title: 'Hold Signals',
                color: 'text-yellow-500',
                description: 'Directional evidence is mixed, unavailable, or insufficient for the rule set to produce a buy or sell context.'
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
              { range: '70-95%', label: 'Strong Rule Consensus', description: 'The available indicator rules agree directionally. This is not a probability of profit or a personalised recommendation.' },
              { range: '40-69%', label: 'Partial Rule Consensus', description: 'Some directional evidence is present, but agreement is less complete.' },
              { range: 'Below 40%', label: 'Limited or Mixed Evidence', description: 'The available rule inputs do not support a strong directional conclusion.' }
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
              'Timestamped technical signal context',
              'RSI, MACD, moving-average, and Bollinger analysis',
              'Model-rule confidence labels with visible limits',
              'Signal activity and simulator record review',
              'Paper-trading workflows with virtual capital',
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
            Open the workspace to review available signal context and paper-trading workflows.
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
