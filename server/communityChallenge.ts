/**
 * Community Challenge System
 * Tracks user participation in monthly trading challenges and leaderboards
 */

export interface Challenge {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  rules: string;
  prizes: string[];
  participantCount: number;
  createdAt: Date;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: number;
  username: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  winRate: number;
  totalTrades: number;
  rank: number;
  joinedAt: Date;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  participants: ChallengeParticipant[];
  topPerformers: ChallengeParticipant[];
  averageReturn: number;
  totalParticipants: number;
}

/**
 * Default challenges for the platform
 */
export const defaultChallenges: Challenge[] = [
  {
    id: 'beat-the-market-2026-06',
    name: 'Beat the Market - June 2026',
    description: 'Trade for 30 days and try to outperform the S&P 500 benchmark (18.5% YTD return)',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-30'),
    status: 'active',
    rules: `
      1. Start with $10,000 virtual capital
      2. Trade any US stocks or ETFs
      3. No shorting or options trading
      4. Minimum 5 trades to qualify
      5. Winner determined by highest total return %
      6. Ties broken by Sharpe ratio
    `,
    prizes: ['$500 trading course', '$300 premium subscription', '$100 platform credit'],
    participantCount: 342,
    createdAt: new Date('2026-05-15'),
  },
  {
    id: 'signal-accuracy-challenge-2026-06',
    name: 'Signal Accuracy Challenge - June 2026',
    description: 'Use our AI signals to make trades. Winner has highest accuracy rate.',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-30'),
    status: 'active',
    rules: `
      1. Must use at least 10 buy/sell signals from the platform
      2. Track signal accuracy (% of profitable trades)
      3. Minimum 10 trades to qualify
      4. Winner determined by highest win rate
      5. Ties broken by total profit
    `,
    prizes: ['Lifetime Pro membership', '$200 platform credit', 'Featured on leaderboard'],
    participantCount: 156,
    createdAt: new Date('2026-05-15'),
  },
  {
    id: 'momentum-trading-july-2026',
    name: 'Momentum Trading Challenge - July 2026',
    description: 'Trade momentum stocks with high volume. Fastest traders win.',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-31'),
    status: 'upcoming',
    rules: `
      1. Focus on stocks with 20%+ daily volume increase
      2. Hold positions for 1-5 days maximum
      3. Minimum 15 trades required
      4. Winner determined by total return
      5. Bonus points for consistent winners
    `,
    prizes: ['$750 trading education package', '$400 premium subscription', '$150 credit'],
    participantCount: 0,
    createdAt: new Date('2026-05-20'),
  },
];

/**
 * Calculate leaderboard for a challenge
 */
export function calculateLeaderboard(
  participants: ChallengeParticipant[],
  challengeId: string
): ChallengeLeaderboard {
  const sorted = [...participants].sort((a, b) => b.totalReturn - a.totalReturn);

  const ranked = sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));

  const topPerformers = ranked.slice(0, 3);
  const averageReturn =
    ranked.length > 0
      ? ranked.reduce((sum, p) => sum + p.totalReturn, 0) / ranked.length
      : 0;

  return {
    challengeId,
    participants: ranked,
    topPerformers,
    averageReturn,
    totalParticipants: ranked.length,
  };
}

/**
 * Get challenge by ID
 */
export function getChallengeById(id: string): Challenge | undefined {
  return defaultChallenges.find(c => c.id === id);
}

/**
 * Get active challenges
 */
export function getActiveChallenges(): Challenge[] {
  return defaultChallenges.filter(c => c.status === 'active');
}

/**
 * Get upcoming challenges
 */
export function getUpcomingChallenges(): Challenge[] {
  return defaultChallenges.filter(c => c.status === 'upcoming');
}

/**
 * Get completed challenges
 */
export function getCompletedChallenges(): Challenge[] {
  return defaultChallenges.filter(c => c.status === 'completed');
}

/**
 * Calculate user rank in challenge
 */
export function calculateUserRank(
  userId: number,
  participants: ChallengeParticipant[]
): number {
  const sorted = [...participants].sort((a, b) => b.totalReturn - a.totalReturn);
  const index = sorted.findIndex(p => p.userId === userId);
  return index >= 0 ? index + 1 : -1;
}

/**
 * Calculate percentile for user performance
 */
export function calculatePercentile(
  userReturn: number,
  allReturns: number[]
): number {
  if (allReturns.length === 0) return 0;
  const betterCount = allReturns.filter(r => r > userReturn).length;
  return Math.round(((allReturns.length - betterCount) / allReturns.length) * 100);
}

/**
 * Format challenge prize
 */
export function formatChallengePrize(prize: string): string {
  return prize.charAt(0).toUpperCase() + prize.slice(1);
}

/**
 * Get challenge statistics
 */
export function getChallengeStats(participants: ChallengeParticipant[]) {
  if (participants.length === 0) {
    return {
      totalParticipants: 0,
      averageReturn: 0,
      medianReturn: 0,
      bestReturn: 0,
      worstReturn: 0,
      averageWinRate: 0,
      totalTrades: 0,
    };
  }

  const returns = participants.map(p => p.totalReturn).sort((a, b) => a - b);
  const medianReturn = returns[Math.floor(returns.length / 2)];
  const winRates = participants.map(p => p.winRate);

  return {
    totalParticipants: participants.length,
    averageReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
    medianReturn,
    bestReturn: Math.max(...returns),
    worstReturn: Math.min(...returns),
    averageWinRate: winRates.reduce((a, b) => a + b, 0) / winRates.length,
    totalTrades: participants.reduce((sum, p) => sum + p.totalTrades, 0),
  };
}
