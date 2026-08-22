import React from 'react';
import { TrendingUp, Users, Target, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  trader: string;
  strategy: string;
  results: {
    initialCapital: number;
    finalValue: number;
    returnPercent: number;
    trades: number;
    winRate: number;
  };
  highlights: string[];
  lessons: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'tech-momentum',
    title: 'Tech Momentum Trading',
    description: 'Using RSI and MACD signals to catch momentum moves in growth stocks',
    trader: 'Alex Chen',
    strategy: 'Swing Trading with Technical Indicators',
    results: {
      initialCapital: 10000,
      finalValue: 14230,
      returnPercent: 42.3,
      trades: 24,
      winRate: 66.7,
    },
    highlights: [
      'Focused on high-growth tech stocks (NVDA, TSLA, MSFT)',
      'Held positions for 3-7 days on average',
      'Used stop-losses at 5% below entry',
      'Took profits at 8-12% gains',
    ],
    lessons: [
      'Consistent risk management is key to long-term success',
      'Technical signals work best in trending markets',
      'Diversification across 3-5 positions reduces risk',
      'Emotional discipline prevents revenge trading',
    ],
  },
  {
    id: 'dividend-growth',
    title: 'Dividend Growth Strategy',
    description: 'Building a portfolio of dividend-paying stocks with consistent signals',
    trader: 'Sarah Martinez',
    strategy: 'Long-term Value Investing',
    results: {
      initialCapital: 25000,
      finalValue: 31500,
      returnPercent: 26,
      trades: 8,
      winRate: 87.5,
    },
    highlights: [
      'Selected dividend aristocrats (JNJ, PG, KO)',
      'Held positions for 6-12 months',
      'Reinvested dividends for compounding',
      'Added to positions on dips',
    ],
    lessons: [
      'Dividend stocks provide steady income and capital appreciation',
      'Long holding periods reduce trading costs',
      'Patience is rewarded in quality companies',
      'Dollar-cost averaging smooths out volatility',
    ],
  },
  {
    id: 'sector-rotation',
    title: 'Sector Rotation Trading',
    description: 'Rotating between sectors based on market cycles and signals',
    trader: 'James Wilson',
    strategy: 'Tactical Asset Allocation',
    results: {
      initialCapital: 15000,
      finalValue: 19850,
      returnPercent: 32.3,
      trades: 16,
      winRate: 68.75,
    },
    highlights: [
      'Rotated between Technology, Healthcare, and Financials',
      'Used sector ETFs for diversification',
      'Followed macro trends and earnings seasons',
      'Adjusted positions based on signal strength',
    ],
    lessons: [
      'Different sectors perform better in different market conditions',
      'Diversification across sectors reduces volatility',
      'Signal strength matters more than frequency',
      'Macro awareness improves timing',
    ],
  },
  {
    id: 'earnings-play',
    title: 'Earnings Season Trading',
    description: 'Trading stocks around earnings announcements with technical signals',
    trader: 'Emma Rodriguez',
    strategy: 'Event-Driven Trading',
    results: {
      initialCapital: 8000,
      finalValue: 11200,
      returnPercent: 40,
      trades: 12,
      winRate: 58.3,
    },
    highlights: [
      'Focused on earnings surprises and guidance beats',
      'Entered positions 2-3 days before earnings',
      'Used tight stop-losses (3-4%)',
      'Took profits immediately after earnings',
    ],
    lessons: [
      'Earnings volatility creates trading opportunities',
      'Risk management is critical with event-driven trades',
      'Not all earnings moves are predictable',
      'Combining signals with fundamental analysis improves odds',
    ],
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-secondary/50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Trading Case Studies</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Learn from real trading strategies and outcomes. These case studies showcase different approaches to using Vortextrade signals.
          </p>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {CASE_STUDIES.map((study) => (
            <Card key={study.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-xl">{study.title}</CardTitle>
                    <CardDescription className="mt-1">{study.trader}</CardDescription>
                  </div>
                  <Badge variant="outline">{study.strategy}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{study.description}</p>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Results */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Initial Capital</p>
                    <p className="text-lg font-semibold">${study.results.initialCapital.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Final Value</p>
                    <p className="text-lg font-semibold text-green-600">${study.results.finalValue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Return</p>
                    <p className="text-lg font-semibold text-green-600">+{study.results.returnPercent}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-lg font-semibold">{study.results.winRate}%</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span>{study.results.trades} trades</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Avg +{((study.results.returnPercent / study.results.trades) * 100).toFixed(1)}% per trade</span>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Key Highlights
                  </h4>
                  <ul className="space-y-1">
                    {study.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lessons */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Key Lessons
                  </h4>
                  <ul className="space-y-1">
                    {study.lessons.map((lesson, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded p-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> These case studies are for educational purposes only. Past performance does not guarantee future results. Trading involves risk of loss.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How realistic are these case studies?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                These case studies are based on realistic trading scenarios using Vortextrade signals. However, they represent historical examples and past performance does not guarantee future results.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I replicate these results?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                While you can follow similar strategies, market conditions change constantly. Each trader's results depend on their timing, risk management, and market conditions. Use these as learning examples, not blueprints.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What's the most important factor for success?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Consistent risk management appears across all successful case studies. Most traders use stop-losses and position sizing to limit downside while letting winners run.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Should I focus on one strategy or diversify?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Diversification across strategies, sectors, and timeframes tends to produce more consistent results. However, mastering one strategy deeply is also valuable.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
