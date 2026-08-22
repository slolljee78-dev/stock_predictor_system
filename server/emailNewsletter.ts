// @ts-nocheck
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
  category: string;
}

export interface NewsletterSubscription {
  userId: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  categories: string[];
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'signal-alert',
    name: 'Signal Alert',
    subject: '{{signalType}} Signal on {{stockSymbol}} - {{direction}} ({{confidence}}% Confidence)',
    template: `Hi {{firstName}},

A new {{signalType}} signal has been generated for {{companyName}} ({{stockSymbol}}).

**Signal Details:**
- Type: {{signalType}}
- Direction: {{direction}}
- Confidence: {{confidence}}%
 - Entry Price: \${{entryPrice}}
 - Target Price: \${{targetPrice}}
 - Stop Loss: \${{stopLoss}}
- Indicators: {{indicators}}

**Reasoning:**
{{reasoning}}

Start trading this signal on our paper trading simulator to test it risk-free, or use it to inform your real trading decisions.

[View Signal Details]({{dashboardLink}})

Best regards,
Vortextrade Team`,
    variables: [
      'firstName',
      'signalType',
      'stockSymbol',
      'direction',
      'confidence',
      'entryPrice',
      'targetPrice',
      'stopLoss',
      'indicators',
      'reasoning',
      'dashboardLink',
      'companyName',
    ],
    category: 'signal-alert',
  },
  {
    id: 'market-insight',
    name: 'Market Insight',
    subject: 'Weekly Market Insight: {{topic}} - {{date}}',
    template: `Hi {{firstName}},

Here's this week's market insight on {{topic}}.

**Key Takeaway:**
{{keyTakeaway}}

**Market Context:**
{{marketContext}}

**Sector Performance:**
- Best Performer: {{bestSector}} (+{{bestSectorReturn}}%)
- Worst Performer: {{worstSector}} (-{{worstSectorReturn}}%)

**Market Sentiment:**
VIX Level: {{vixLevel}} ({{vixInterpretation}})

**Trading Opportunities:**
{{opportunities}}

**Risk Factors to Watch:**
{{riskFactors}}

**Featured Ideas:** {{count}} new signals this week

[Explore Trading Ideas]({{ideasLink}})

Best regards,
Vortextrade Team`,
    variables: [
      'firstName',
      'topic',
      'date',
      'keyTakeaway',
      'marketContext',
      'bestSector',
      'bestSectorReturn',
      'worstSector',
      'worstSectorReturn',
      'vixLevel',
      'vixInterpretation',
      'opportunities',
      'riskFactors',
      'count',
      'ideasLink',
    ],
    category: 'market-insight',
  },
  {
    id: 'user-win',
    name: 'User Win Showcase',
    subject: '🎉 Community Spotlight: {{userName}} Made {{profitAmount}} This Week!',
    template: `Hi {{firstName}},

We love celebrating our community's wins! This week, {{userName}} shared an amazing trade:

**The Trade:**
- Stock: {{stockSymbol}}
 - Entry: \${{entryPrice}}
 - Exit: \${{exitPrice}}
 - Profit: {{profitPercent}}% (+\${{profitAmount}})
- Duration: {{tradeDuration}}
- Strategy: {{strategy}}

**Their Quote:**
"{{userQuote}}"

**Key Lesson:**
{{lesson}}

Want to share your own trading wins? [Share Your Story]({{shareLink}})

Start your own paper trading journey: [Try Paper Trading]({{paperTradingLink}})

Best regards,
Vortextrade Team`,
    variables: [
      'firstName',
      'userName',
      'profitAmount',
      'userQuote',
      'stockSymbol',
      'entryPrice',
      'exitPrice',
      'profitPercent',
      'tradeDuration',
      'strategy',
      'lesson',
      'shareLink',
      'paperTradingLink',
    ],
    category: 'user-win',
  },
  {
    id: 'feature-update',
    name: 'Feature Update',
    subject: '✨ New Feature: {{featureName}}',
    template: `Hi {{firstName}},

We've just launched a new feature that will transform your trading: {{featureName}}

**What It Does:**
{{featureDescription}}

**How It Works:**
{{howItWorks}}

**Key Benefits:**
1. {{benefit1}}
2. {{benefit2}}
3. {{benefit3}}

**Getting Started:**
1. {{step1}}
2. {{step2}}
3. {{step3}}

**Pro Tip:**
{{proTip}}

[Try {{featureName}} Now]({{featureLink}})

Need help? [View Documentation]({{helpLink}})

Best regards,
Vortextrade Team`,
    variables: [
      'firstName',
      'featureName',
      'featureDescription',
      'howItWorks',
      'benefit1',
      'benefit2',
      'benefit3',
      'step1',
      'step2',
      'step3',
      'proTip',
      'featureLink',
      'helpLink',
    ],
    category: 'feature-update',
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Digest',
    subject: 'Your Weekly Trading Digest - {{signalsCount}} Signals, {{winRate}}% Win Rate',
    template: `Hi {{firstName}},

Here's your weekly trading summary:

**Your Performance:**
- Signals Received: {{signalsCount}}
- Trades Executed: {{tradesCount}}
- Win Rate: {{winRate}}%
- Total P&L: {{totalPnL}} ({{totalPnLPercent}}%)

**Top Performer:**
{{topStock}} - +{{topReturn}}% ({{topConfidence}}% confidence)

**Best Trading Day:**
{{bestDay}} - +{{bestDayReturn}}%

**Toughest Day:**
{{worstDay}} - {{worstDayReturn}}%

**Portfolio Snapshot:**
 - Value: \${{portfolioValue}}
 - Cash Available: \${{cashAvailable}}
- Current Win Streak: {{winStreak}} trades

**Market Events This Week:**
- Earnings Reports: {{earningsCount}}
- Economic Events: {{economicCount}}
- Holidays: {{holidaysCount}}

**Top Opportunities:**
{{topOpportunities}}

**Community Highlight:**
{{communityHighlight}}

[View Full Dashboard]({{dashboardLink}})

Best regards,
Vortextrade Team`,
    variables: [
      'firstName',
      'signalsCount',
      'tradesCount',
      'winRate',
      'totalPnL',
      'totalPnLPercent',
      'topStock',
      'topReturn',
      'topConfidence',
      'bestDay',
      'bestDayReturn',
      'worstDay',
      'worstDayReturn',
      'portfolioValue',
      'cashAvailable',
      'winStreak',
      'earningsCount',
      'economicCount',
      'holidaysCount',
      'topOpportunities',
      'communityHighlight',
      'dashboardLink',
    ],
    category: 'weekly-digest',
  },
];

export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return emailTemplates.find(t => t.id === id);
}

export function renderEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, any>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.template;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(placeholder, String(value || ''));
    body = body.replace(placeholder, String(value || ''));
  });

  return { subject, body };
}

export async function subscribeToNewsletter(
  userId: string,
  email: string,
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' = 'weekly',
  categories: string[] = ['signal-alert', 'market-insight', 'weekly-digest']
): Promise<void> {
  // In production, store in database
  console.log(`User ${userId} subscribed to newsletter: ${frequency}`, categories);
}

export async function unsubscribeFromNewsletter(userId: string): Promise<void> {
  // In production, update database
  console.log(`User ${userId} unsubscribed from newsletter`);
}

export async function getSubscribersByFrequency(
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly'
): Promise<NewsletterSubscription[]> {
  // In production, query database
  return [];
}

export async function generateEmailContent(
  templateId: string,
  context: Record<string, any>
): Promise<{ subject: string; body: string }> {
  const template = getEmailTemplate(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  return renderEmailTemplate(template, context);
}

export async function getEmailMetrics(): Promise<{
  totalSubscribers: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
}> {
  return {
    totalSubscribers: 8500,
    openRate: 0.28,
    clickRate: 0.08,
    unsubscribeRate: 0.02,
    bounceRate: 0.01,
  };
}

export async function scheduleNewsletter(
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly',
  templateId: string,
  sendTime: string
): Promise<void> {
  console.log(`Newsletter scheduled: ${frequency} at ${sendTime} using template ${templateId}`);
}

export async function sendTestEmail(
  email: string,
  templateId: string,
  variables: Record<string, any>
): Promise<void> {
  const { subject, body } = await generateEmailContent(templateId, variables);
  console.log(`Test email sent to ${email}:`, { subject, body });
}
