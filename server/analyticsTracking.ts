export interface TrafficMetrics {
  totalVisitors: number;
  uniqueUsers: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; visitors: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
}

export interface ConversionFunnel {
  step: string;
  users: number;
  conversionRate: number;
}

export interface UserSegment {
  name: string;
  criteria: string;
  userCount: number;
  avgLifetimeValue: number;
  churnRate: number;
}

export async function getTrafficMetrics(
  startDate: Date,
  endDate: Date
): Promise<TrafficMetrics> {
  return {
    totalVisitors: 12500,
    uniqueUsers: 8300,
    pageViews: 45600,
    bounceRate: 0.35,
    avgSessionDuration: 420,
    conversionRate: 0.08,
    topPages: [
      { page: '/', views: 8500 },
      { page: '/signals', views: 6200 },
      { page: '/blog', views: 5100 },
      { page: '/simulator', views: 4800 },
      { page: '/pricing', views: 3200 },
    ],
    trafficSources: [
      { source: 'organic', visitors: 5200 },
      { source: 'direct', visitors: 2100 },
      { source: 'referral', visitors: 800 },
      { source: 'social', visitors: 200 },
    ],
    deviceBreakdown: [
      { device: 'desktop', percentage: 0.65 },
      { device: 'mobile', percentage: 0.30 },
      { device: 'tablet', percentage: 0.05 },
    ],
  };
}

export async function getConversionFunnel(): Promise<ConversionFunnel[]> {
  return [
    { step: 'Landing Page Visit', users: 10000, conversionRate: 1.0 },
    { step: 'Sign Up', users: 3500, conversionRate: 0.35 },
    { step: 'First Trade', users: 1200, conversionRate: 0.34 },
    { step: 'Premium Conversion', users: 320, conversionRate: 0.27 },
    { step: 'Active Premium User (30 days)', users: 240, conversionRate: 0.75 },
  ];
}

export async function getUserSegments(): Promise<UserSegment[]> {
  return [
    {
      name: 'High-Value Users',
      criteria: 'Premium subscribers with 10+ trades/month',
      userCount: 240,
      avgLifetimeValue: 1200,
      churnRate: 0.05,
    },
    {
      name: 'Active Traders',
      criteria: 'Free users with 5+ trades/month',
      userCount: 850,
      avgLifetimeValue: 0,
      churnRate: 0.25,
    },
    {
      name: 'Casual Users',
      criteria: 'Users with 1-4 trades/month',
      userCount: 2100,
      avgLifetimeValue: 0,
      churnRate: 0.40,
    },
    {
      name: 'Inactive Users',
      criteria: 'No activity in last 30 days',
      userCount: 4200,
      avgLifetimeValue: 0,
      churnRate: 0.80,
    },
  ];
}

export async function getRevenueMetrics(startDate: Date, endDate: Date) {
  return {
    totalRevenue: 45600,
    mrr: 15200,
    arr: 182400,
    premiumSubscribers: 240,
    churnRate: 0.05,
    ltv: 1200,
    cac: 85,
    ltv_cac_ratio: 14.1,
    avgRevenuePerUser: 190,
    revenueByTier: {
      starter: 3200,
      pro: 28400,
      elite: 14000,
    },
  };
}

export async function getMarketingMetrics() {
  return {
    emailMetrics: {
      subscribers: 8500,
      openRate: 0.28,
      clickRate: 0.08,
      unsubscribeRate: 0.02,
    },
    socialMetrics: {
      twitterFollowers: 2500,
      redditMentions: 450,
      discordMembers: 1200,
    },
    seoMetrics: {
      organicTraffic: 5200,
      avgRanking: 8.5,
      indexedPages: 245,
      backlinks: 1200,
    },
    paidMetrics: {
      adSpend: 2500,
      impressions: 125000,
      clicks: 3500,
      ctr: 0.028,
      cpc: 0.71,
      roas: 3.2,
    },
  };
}

export async function getProductMetrics() {
  return {
    signalAccuracy: {
      bullishWinRate: 0.62,
      bearishWinRate: 0.58,
      overallWinRate: 0.60,
      avgReturnPerSignal: 0.045,
    },
    userSatisfaction: {
      nps: 42,
      csat: 4.2,
      effortScore: 2.1,
    },
    technicalMetrics: {
      uptime: 0.9995,
      avgResponseTime: 245,
      errorRate: 0.0005,
    },
  };
}

export async function getDashboardSummary() {
  const [trafficMetrics, conversionFunnel, revenueMetrics, productMetrics, marketingMetrics] = await Promise.all([
    getTrafficMetrics(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    getConversionFunnel(),
    getRevenueMetrics(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    getProductMetrics(),
    getMarketingMetrics(),
  ]);

  return {
    traffic: trafficMetrics,
    conversion: conversionFunnel,
    revenue: revenueMetrics,
    product: productMetrics,
    marketing: marketingMetrics,
    timestamp: new Date(),
  };
}

export async function exportAnalyticsData(format: 'csv' | 'json', dateRange: { start: Date; end: Date }) {
  const metrics = await getTrafficMetrics(dateRange.start, dateRange.end);

  if (format === 'json') {
    return JSON.stringify(metrics, null, 2);
  } else if (format === 'csv') {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Visitors', metrics.totalVisitors],
      ['Unique Users', metrics.uniqueUsers],
      ['Page Views', metrics.pageViews],
      ['Bounce Rate', `${(metrics.bounceRate * 100).toFixed(2)}%`],
      ['Avg Session Duration', `${metrics.avgSessionDuration}s`],
      ['Conversion Rate', `${(metrics.conversionRate * 100).toFixed(2)}%`],
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  return '';
}
