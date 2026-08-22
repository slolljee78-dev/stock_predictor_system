import React, { useState } from 'react';
import { Copy, Share2, TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommission: number;
  pendingEarnings: number;
  conversionRate: string;
  tier: string;
}

export default function AffiliateDashboard() {
  const [stats] = useState<AffiliateStats>({
    totalReferrals: 12,
    activeReferrals: 8,
    totalCommission: 450,
    pendingEarnings: 120,
    conversionRate: '66.7',
    tier: 'Silver',
  } as AffiliateStats);

  const affiliateCode = 'USR12A3B4C5D';
  const referralLink = `https://vortextrade.manus.space?ref=${affiliateCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  const handleShare = (platform: string) => {
    const text = `Join Vortextrade - Get premium AI trading signals! Use my link: ${referralLink}`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Vortextrade - AI Trading Signals&body=${encodeURIComponent(text)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-secondary/50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Affiliate Program</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Earn commissions by referring traders to Vortextrade. Get paid for every successful signup and ongoing revenue share.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.totalReferrals}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeReferrals} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">${stats.totalCommission}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">${stats.pendingEarnings}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Next payout: 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{stats.tier}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeReferrals}/10 to Gold</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to start earning commissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary rounded p-3 font-mono text-sm break-all">
                {referralLink}
              </div>
              <Button onClick={handleCopyLink} size="sm" variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Share on social media:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('twitter')}
                >
                  Twitter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('facebook')}
                >
                  Facebook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('linkedin')}
                >
                  LinkedIn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('email')}
                >
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Structure</CardTitle>
            <CardDescription>Earn money from referrals and ongoing revenue share</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded p-4">
                  <h4 className="font-semibold mb-2">Signup Bonus</h4>
                  <p className="text-2xl font-bold text-green-600 mb-2">$10</p>
                  <p className="text-sm text-muted-foreground">Per new signup</p>
                </div>

                <div className="border rounded p-4">
                  <h4 className="font-semibold mb-2">Revenue Share</h4>
                  <p className="text-2xl font-bold text-green-600 mb-2">20%</p>
                  <p className="text-sm text-muted-foreground">Of subscription revenue</p>
                </div>

                <div className="border rounded p-4">
                  <h4 className="font-semibold mb-2">Monthly Bonus</h4>
                  <p className="text-2xl font-bold text-green-600 mb-2">$50+</p>
                  <p className="text-sm text-muted-foreground">Based on tier (5+ referrals)</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Example:</strong> Refer 10 active users who each spend $100/month = $200/month in revenue share + $50 monthly bonus = $250/month!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Tiers</CardTitle>
            <CardDescription>Unlock higher rewards as you grow your referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  tier: 'Bronze',
                  referrals: '0-4',
                  benefits: ['20% revenue share', '$10 signup bonus', 'Basic support'],
                },
                {
                  tier: 'Silver',
                  referrals: '5-9',
                  benefits: ['20% revenue share', '$25 monthly bonus', 'Priority support'],
                  current: true,
                },
                {
                  tier: 'Gold',
                  referrals: '10-24',
                  benefits: ['20% revenue share', '$50 monthly bonus', 'Dedicated support'],
                },
                {
                  tier: 'Platinum',
                  referrals: '25+',
                  benefits: ['20% revenue share', '$100 monthly bonus', 'Co-marketing'],
                },
              ].map((tier) => (
                <div
                  key={tier.tier}
                  className={`border rounded p-4 ${tier.current ? 'bg-primary/5 border-primary' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{tier.tier}</h4>
                    {tier.current && <Badge>Current Tier</Badge>}
                    <span className="text-sm text-muted-foreground">{tier.referrals} referrals</span>
                  </div>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">When do I get paid?</h4>
              <p className="text-sm text-muted-foreground">
                Payouts are processed monthly on the 15th. Minimum payout is $50.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">How long is the cookie duration?</h4>
              <p className="text-sm text-muted-foreground">
                30 days. If someone clicks your link and signs up within 30 days, you get credit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Can I promote Vortextrade on paid ads?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! We encourage it. Just follow our brand guidelines and disclose the affiliate relationship.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">What if a referral cancels?</h4>
              <p className="text-sm text-muted-foreground">
                You keep the signup bonus. Revenue share only applies while they're an active subscriber.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
