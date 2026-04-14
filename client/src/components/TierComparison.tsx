import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ComparisonFeature {
  name: string;
  starter: boolean | string;
  professional: boolean | string;
  elite: boolean | string;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  // Core Features
  { name: 'Stocks Monitored', starter: '50', professional: 'All 212', elite: 'All 212' },
  { name: 'Signal Generation', starter: 'Basic', professional: 'Advanced AI', elite: 'Advanced AI' },
  { name: 'Signal Accuracy', starter: '85%+', professional: '98%+', elite: '98%+' },
  { name: 'Confidence Scores', starter: true, professional: true, elite: true },
  
  // Analysis & Reporting
  { name: 'Technical Analysis', starter: true, professional: true, elite: true },
  { name: 'Sentiment Analysis', starter: false, professional: true, elite: true },
  { name: 'Weekly Reports', starter: true, professional: false, elite: false },
  { name: 'Daily Reports', starter: false, professional: true, elite: true },
  
  // Alerts & Notifications
  { name: 'Email Alerts', starter: true, professional: true, elite: true },
  { name: 'SMS Alerts', starter: false, professional: true, elite: true },
  { name: 'Real-time Notifications', starter: false, professional: true, elite: true },
  { name: 'Custom Alert Rules', starter: false, professional: false, elite: true },
  
  // Tools & Features
  { name: 'Signal Export (CSV/JSON)', starter: true, professional: true, elite: true },
  { name: 'Portfolio Tracker', starter: false, professional: true, elite: true },
  { name: 'Accuracy Dashboard', starter: false, professional: true, elite: true },
  { name: 'Risk Strategies', starter: 'Balanced', professional: 'All 3', elite: 'All 3' },
  
  // API & Integration
  { name: 'API Access', starter: false, professional: false, elite: true },
  { name: 'Webhook Integration', starter: false, professional: false, elite: true },
  { name: 'Custom Strategies', starter: false, professional: false, elite: true },
  
  // Support
  { name: 'Email Support', starter: true, professional: true, elite: true },
  { name: 'Priority Support', starter: false, professional: true, elite: true },
  { name: 'Dedicated Account Manager', starter: false, professional: false, elite: true },
];

const TIER_INFO = {
  starter: {
    name: 'Starter',
    price: '£9.99',
    period: '/month',
    description: 'Perfect for beginners',
    cta: 'Start Free Trial',
  },
  professional: {
    name: 'Professional',
    price: '£29.99',
    period: '/month',
    description: 'Most popular choice',
    cta: 'Start Free Trial',
    recommended: true,
  },
  elite: {
    name: 'Elite',
    price: '£99.99',
    period: '/month',
    description: 'For professional traders',
    cta: 'Start Free Trial',
  },
};

export function TierComparison() {
  const [selectedTier, setSelectedTier] = useState<'starter' | 'professional' | 'elite' | null>(null);

  const FeatureCell = ({ value }: { value: boolean | string }) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex justify-center">
          {value ? (
            <Check className="w-5 h-5 text-accent-cyan" />
          ) : (
            <X className="w-5 h-5 text-gray-400" />
          )}
        </div>
      );
    }
    return <div className="text-center text-sm font-medium">{value}</div>;
  };

  return (
    <div className="w-full bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Compare Plans
          </h2>
          <p className="text-lg text-foreground/80">
            Choose the perfect plan for your trading style
          </p>
        </div>

        {/* Desktop Comparison Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">Features</th>
                {(['starter', 'professional', 'elite'] as const).map((tier) => (
                  <th key={tier} className="text-center py-4 px-4">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-foreground">
                        {TIER_INFO[tier].name}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {TIER_INFO[tier].description}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      tier === 'professional'
                        ? 'bg-accent-gold/10 border-2 border-accent-gold'
                        : 'bg-card'
                    }`}>
                      <div className="text-3xl font-bold text-foreground">
                        {TIER_INFO[tier].price}
                      </div>
                      <div className="text-sm text-foreground/60">
                        {TIER_INFO[tier].period}
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant={tier === 'professional' ? 'default' : 'outline'}
                      >
                        {TIER_INFO[tier].cta}
                      </Button>
                      {tier === 'professional' && (
                        <div className="text-xs text-accent-gold font-semibold mt-2 text-center">
                          RECOMMENDED
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border hover:bg-card/50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-foreground">{feature.name}</td>
                  <td className="py-4 px-4">
                    <FeatureCell value={feature.starter} />
                  </td>
                  <td className="py-4 px-4 bg-accent-gold/5">
                    <FeatureCell value={feature.professional} />
                  </td>
                  <td className="py-4 px-4">
                    <FeatureCell value={feature.elite} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Comparison Cards */}
        <div className="lg:hidden space-y-6">
          {(['starter', 'professional', 'elite'] as const).map((tier) => (
            <Card
              key={tier}
              className={`p-6 cursor-pointer transition-all ${
                selectedTier === tier
                  ? 'ring-2 ring-accent-cyan'
                  : 'hover:border-accent-cyan/50'
              } ${tier === 'professional' ? 'border-2 border-accent-gold' : ''}`}
              onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {TIER_INFO[tier].name}
                  </h3>
                  {tier === 'professional' && (
                    <span className="text-xs font-bold text-accent-gold bg-accent-gold/10 px-3 py-1 rounded-full">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60 mb-4">
                  {TIER_INFO[tier].description}
                </p>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-foreground">
                    {TIER_INFO[tier].price}
                  </div>
                  <div className="text-sm text-foreground/60">
                    {TIER_INFO[tier].period}
                  </div>
                </div>
                <Button className="w-full">
                  {TIER_INFO[tier].cta}
                </Button>
              </div>

              {/* Features */}
              {selectedTier === tier && (
                <div className="space-y-3 border-t border-border pt-6">
                  {COMPARISON_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{feature.name}</span>
                      <FeatureCell value={feature[tier]} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-foreground/70">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Is there a free trial?</h4>
              <p className="text-sm text-foreground/70">
                Yes! All plans include a 7-day free trial with full access to premium features. No credit card required to start.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-foreground/70">
                We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. All payments are secure and encrypted.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I'm not satisfied?</h4>
              <p className="text-sm text-foreground/70">
                We offer a 30-day money-back guarantee if you're not completely satisfied with your subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
