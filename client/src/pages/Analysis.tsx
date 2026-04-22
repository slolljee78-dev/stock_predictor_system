import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, BarChart3, Zap, Target, LineChart, Activity } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Analysis() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:px-8 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,151,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(88,212,255,0.08),transparent_35%)]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit rounded-full px-4 py-2">
              Advanced Stock Analysis
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Professional Stock Analysis Tools
            </h1>
            <p className="text-xl text-muted-foreground">
              Deep dive into technical analysis, market trends, and trading patterns with professional-grade tools designed for serious traders.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setLocation('/dashboard')}>
                Start Analyzing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setLocation('/pricing')}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Features */}
      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Comprehensive Stock Analysis Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need for in-depth technical and fundamental analysis</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: LineChart,
                title: 'Technical Indicators',
                description: 'RSI, MACD, Bollinger Bands, Moving Averages, and 50+ more indicators for comprehensive analysis'
              },
              {
                icon: BarChart3,
                title: 'Price Action Analysis',
                description: 'Track support/resistance levels, trend lines, and price patterns for better entry and exit points'
              },
              {
                icon: TrendingUp,
                title: 'Trend Analysis',
                description: 'Identify market trends, momentum shifts, and reversal patterns with visual trend indicators'
              },
              {
                icon: Activity,
                title: 'Volume Analysis',
                description: 'Analyze trading volume patterns to confirm price movements and spot accumulation/distribution'
              },
              {
                icon: Zap,
                title: 'Real-time Updates',
                description: 'Get live price updates and instant alerts when key technical levels are breached'
              },
              {
                icon: Target,
                title: 'Target Projections',
                description: 'Calculate profit targets and stop-loss levels based on technical analysis patterns'
              }
            ].map((feature) => (
              <Card key={feature.title} className="border-border/50">
                <CardHeader>
                  <feature.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Workflow */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How Professional Analysis Works</h2>
            <p className="text-lg text-muted-foreground">A systematic approach to stock analysis and decision-making</p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Identify Candidates',
                description: 'Start with your watchlist of stocks and apply technical filters to identify promising candidates'
              },
              {
                step: '2',
                title: 'Analyze Charts',
                description: 'Review price charts, identify trends, support/resistance levels, and key technical patterns'
              },
              {
                step: '3',
                title: 'Confirm Signals',
                description: 'Use multiple indicators to confirm trading signals and validate your analysis thesis'
              },
              {
                step: '4',
                title: 'Plan Trades',
                description: 'Set entry points, profit targets, and stop-loss levels based on your technical analysis'
              },
              {
                step: '5',
                title: 'Execute & Monitor',
                description: 'Execute trades in the simulator first, then monitor positions and adjust as needed'
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Analyze Like a Pro?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Access professional-grade analysis tools and start making data-driven trading decisions
          </p>
          <Button size="lg" className="mt-8" onClick={() => setLocation('/dashboard')}>
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
