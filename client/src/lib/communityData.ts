export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  portfolioName: string;
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  tradesCount: number;
  joinedDate: string;
  avatar?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  objective: string;
  prize?: string;
  participants: number;
  rules: string[];
  leaderboard: LeaderboardEntry[];
}

// Mock leaderboard data
export const LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-001',
    username: 'TradeMaster92',
    portfolioName: 'Swing Strategy',
    totalReturn: 4850,
    totalReturnPercent: 48.5,
    winRate: 72,
    tradesCount: 45,
    joinedDate: '2026-01-15',
  },
  {
    rank: 2,
    userId: 'user-002',
    username: 'SignalHunter',
    portfolioName: 'Technical Pro',
    totalReturn: 3920,
    totalReturnPercent: 39.2,
    winRate: 68,
    tradesCount: 52,
    joinedDate: '2026-02-01',
  },
  {
    rank: 3,
    userId: 'user-003',
    username: 'VolatilityKing',
    portfolioName: 'Momentum Play',
    totalReturn: 3450,
    totalReturnPercent: 34.5,
    winRate: 65,
    tradesCount: 38,
    joinedDate: '2026-01-20',
  },
  {
    rank: 4,
    userId: 'user-004',
    username: 'ValueSeeker',
    portfolioName: 'Long Term',
    totalReturn: 2890,
    totalReturnPercent: 28.9,
    winRate: 61,
    tradesCount: 28,
    joinedDate: '2026-02-10',
  },
  {
    rank: 5,
    userId: 'user-005',
    username: 'RiskManager',
    portfolioName: 'Conservative',
    totalReturn: 2340,
    totalReturnPercent: 23.4,
    winRate: 58,
    tradesCount: 35,
    joinedDate: '2026-01-25',
  },
];

// Mock challenges data
export const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-001',
    title: 'May Trading Challenge: Beat the Market',
    description: 'Trade using Stock Predictor signals and see if you can beat the S&P 500 return for May.',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'active',
    objective: 'Achieve the highest portfolio return percentage in May',
    prize: '$500 Amazon Gift Card for 1st place',
    participants: 342,
    rules: [
      'Use only Stock Predictor signals for trading ideas',
      'Minimum 5 trades required',
      'Maximum 50 trades allowed',
      'Paper trading only (simulator)',
      'Starting capital: $10,000',
      'All positions must be closed by end of month',
    ],
    leaderboard: LEADERBOARD.slice(0, 3),
  },
  {
    id: 'challenge-002',
    title: 'June Challenge: Consistency is Key',
    description: 'Maintain the highest win rate while making at least 10 trades.',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'upcoming',
    objective: 'Achieve the highest win rate with minimum 10 trades',
    prize: '$300 Amazon Gift Card for 1st place',
    participants: 0,
    rules: [
      'Minimum 10 trades required',
      'Maximum 100 trades allowed',
      'Win rate calculated as profitable trades / total trades',
      'Paper trading only',
      'Starting capital: $10,000',
    ],
    leaderboard: [],
  },
  {
    id: 'challenge-003',
    title: 'April Challenge: Volatility Master',
    description: 'Trade during high volatility periods and maximize returns.',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    status: 'completed',
    objective: 'Highest return during volatile market conditions',
    prize: '$500 Amazon Gift Card for 1st place',
    participants: 298,
    rules: [
      'Trade only during high volatility (VIX > 20)',
      'Minimum 5 trades required',
      'Paper trading only',
      'Starting capital: $10,000',
    ],
    leaderboard: LEADERBOARD,
  },
];

export function getActiveChallenge(): Challenge | undefined {
  return CHALLENGES.find(c => c.status === 'active');
}

export function getUpcomingChallenges(): Challenge[] {
  return CHALLENGES.filter(c => c.status === 'upcoming').sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export function getCompletedChallenges(): Challenge[] {
  return CHALLENGES.filter(c => c.status === 'completed').sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  );
}

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find(c => c.id === id);
}

export function getUserRank(userId: string): number | undefined {
  const entry = LEADERBOARD.find(e => e.userId === userId);
  return entry?.rank;
}

export function getUserLeaderboardEntry(userId: string): LeaderboardEntry | undefined {
  return LEADERBOARD.find(e => e.userId === userId);
}

export function getTopTraders(limit: number = 10): LeaderboardEntry[] {
  return LEADERBOARD.slice(0, limit);
}
