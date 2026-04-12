/**
 * Leaderboard System
 * Ranks portfolios by performance metrics and enables friendly competition
 */

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  portfolioValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  winRate: number;
  tradeCount: number;
  lastUpdated: Date;
}

export interface LeaderboardFilters {
  timeframe: '1week' | '1month' | '3months' | '6months' | '1year' | 'alltime';
  sortBy: 'return' | 'sharpeRatio' | 'winRate' | 'totalValue';
  limit: number;
  offset: number;
}

export interface LeaderboardStats {
  totalUsers: number;
  averageReturn: number;
  topReturn: number;
  averageSharpeRatio: number;
  averageWinRate: number;
}

/**
 * Get global leaderboard rankings
 */
export async function getLeaderboard(
  filters: LeaderboardFilters
): Promise<{ entries: LeaderboardEntry[]; stats: LeaderboardStats }> {
  // This would query the database for all users and their performance metrics
  // Sorted by the specified metric
  // Returns paginated results

  // Placeholder implementation
  const entries: LeaderboardEntry[] = [];
  const stats: LeaderboardStats = {
    totalUsers: 0,
    averageReturn: 0,
    topReturn: 0,
    averageSharpeRatio: 0,
    averageWinRate: 0,
  };

  return { entries, stats };
}

/**
 * Get user's rank and nearby competitors
 */
export async function getUserRankContext(userId: number, metric: string = 'return'): Promise<{
  userRank: number;
  totalUsers: number;
  percentile: number;
  nearbyRanks: LeaderboardEntry[];
}> {
  // This would find the user's rank and return nearby competitors
  // Useful for showing "You're in top 10%!" messages

  return {
    userRank: 0,
    totalUsers: 0,
    percentile: 0,
    nearbyRanks: [],
  };
}

/**
 * Get leaderboard for a specific time period
 */
export async function getTimeframeLeaderboard(
  timeframe: '1week' | '1month' | '3months' | '6months' | '1year' | 'alltime',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  // Filter portfolios by performance in the specified timeframe
  // Return top performers

  return [];
}

/**
 * Get leaderboard by specific metric
 */
export async function getMetricLeaderboard(
  metric: 'sharpeRatio' | 'winRate' | 'totalReturn' | 'consistency',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  // Return top performers for a specific metric
  // E.g., highest Sharpe ratio, best win rate, etc.

  return [];
}

/**
 * Calculate user's percentile ranking
 */
export function calculatePercentile(userRank: number, totalUsers: number): number {
  if (totalUsers === 0) return 0;
  return ((totalUsers - userRank) / totalUsers) * 100;
}

/**
 * Get achievement badges based on leaderboard position
 */
export function getAchievementBadges(
  rank: number,
  percentile: number,
  sharpeRatio: number,
  winRate: number
): string[] {
  const badges: string[] = [];

  // Rank-based badges
  if (rank === 1) badges.push('🥇 #1 Trader');
  if (rank <= 10) badges.push('🏆 Top 10');
  if (rank <= 100) badges.push('⭐ Top 100');
  if (percentile >= 90) badges.push('📈 Top 10%');
  if (percentile >= 75) badges.push('📊 Top 25%');

  // Performance-based badges
  if (sharpeRatio >= 2) badges.push('🎯 Excellent Risk-Adjusted Returns');
  if (sharpeRatio >= 1.5) badges.push('✅ Strong Risk Management');
  if (winRate >= 70) badges.push('🎪 High Win Rate');
  if (winRate >= 60) badges.push('📍 Consistent Winner');

  return badges;
}

/**
 * Generate leaderboard comparison report
 */
export function generateLeaderboardReport(
  userEntry: LeaderboardEntry,
  topEntries: LeaderboardEntry[]
): string {
  const userPercentile = calculatePercentile(userEntry.rank, 1000); // Assuming 1000 users
  const badges = getAchievementBadges(userEntry.rank, userPercentile, userEntry.sharpeRatio, userEntry.winRate);

  const report = `
# Your Leaderboard Performance

## Ranking
- **Your Rank:** #${userEntry.rank} out of 1000 traders
- **Percentile:** Top ${userPercentile.toFixed(1)}%
- **Badges:** ${badges.join(', ')}

## Your Metrics
- **Total Return:** ${userEntry.totalReturnPercent.toFixed(2)}%
- **Annualized Return:** ${userEntry.annualizedReturn.toFixed(2)}%
- **Sharpe Ratio:** ${userEntry.sharpeRatio.toFixed(2)}
- **Win Rate:** ${userEntry.winRate.toFixed(2)}%
- **Total Trades:** ${userEntry.tradeCount}

## How You Compare to Top Traders
${topEntries
  .slice(0, 5)
  .map(
    (entry, i) => `
### #${entry.rank} - ${entry.userName}
- Return: ${entry.totalReturnPercent.toFixed(2)}% (${(entry.totalReturnPercent - userEntry.totalReturnPercent).toFixed(2)}% ahead)
- Sharpe: ${entry.sharpeRatio.toFixed(2)} (vs your ${userEntry.sharpeRatio.toFixed(2)})
- Win Rate: ${entry.winRate.toFixed(2)}% (vs your ${userEntry.winRate.toFixed(2)}%)
`
  )
  .join('')}

## Tips to Improve Your Rank
${generateRankingTips(userEntry, topEntries)}
`;

  return report;
}

/**
 * Generate tips for improving leaderboard ranking
 */
function generateRankingTips(userEntry: LeaderboardEntry, topEntries: LeaderboardEntry[]): string {
  const tips: string[] = [];

  // Analyze gaps vs top performers
  const avgTopReturn = topEntries.reduce((sum, e) => sum + e.totalReturnPercent, 0) / topEntries.length;
  const avgTopSharpe = topEntries.reduce((sum, e) => sum + e.sharpeRatio, 0) / topEntries.length;
  const avgTopWinRate = topEntries.reduce((sum, e) => sum + e.winRate, 0) / topEntries.length;

  if (userEntry.totalReturnPercent < avgTopReturn * 0.8) {
    tips.push('- Improve signal quality to increase returns');
  }

  if (userEntry.sharpeRatio < avgTopSharpe * 0.8) {
    tips.push('- Reduce portfolio volatility with better risk management');
  }

  if (userEntry.winRate < avgTopWinRate * 0.8) {
    tips.push('- Focus on improving entry/exit timing to increase win rate');
  }

  if (userEntry.tradeCount < 10) {
    tips.push('- Increase trading activity to build a larger sample size');
  }

  if (tips.length === 0) {
    tips.push('- You\'re performing well! Keep up your current strategy');
  }

  return tips.join('\n');
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  // Calculate aggregate statistics across all users
  // Average return, Sharpe ratio, win rate, etc.

  return {
    totalUsers: 0,
    averageReturn: 0,
    topReturn: 0,
    averageSharpeRatio: 0,
    averageWinRate: 0,
  };
}

/**
 * Check if user is eligible for leaderboard
 * (e.g., minimum trades, minimum portfolio value)
 */
export function isEligibleForLeaderboard(tradeCount: number, portfolioValue: number): boolean {
  const MIN_TRADES = 5;
  const MIN_PORTFOLIO_VALUE = 1000;

  return tradeCount >= MIN_TRADES && portfolioValue >= MIN_PORTFOLIO_VALUE;
}
