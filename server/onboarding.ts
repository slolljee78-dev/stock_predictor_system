/**
 * User Onboarding & Feature Tour System
 * Guides new users through the platform and tracks completion
 */

export type OnboardingStep = 'welcome' | 'profile' | 'watchlist' | 'signals' | 'trading' | 'portfolio' | 'settings' | 'complete';

export interface OnboardingProgress {
  userId: number;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  skippedAt?: Date;
  preferences: {
    showTour: boolean;
    showTooltips: boolean;
    showNotifications: boolean;
  };
}

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  actionLabel?: string;
  skipAllowed: boolean;
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  reward?: {
    points: number;
    badge: string;
  };
}

const ONBOARDING_STEPS: Record<OnboardingStep, { title: string; description: string }> = {
  welcome: {
    title: 'Welcome to Stock Predictor',
    description: 'Get started with AI-powered trading signals',
  },
  profile: {
    title: 'Complete Your Profile',
    description: 'Set up your trading preferences and goals',
  },
  watchlist: {
    title: 'Create Your Watchlist',
    description: 'Add stocks you want to monitor',
  },
  signals: {
    title: 'Understand Trading Signals',
    description: 'Learn how our AI generates buy/sell signals',
  },
  trading: {
    title: 'Start Paper Trading',
    description: 'Practice trading with virtual money',
  },
  portfolio: {
    title: 'Track Your Portfolio',
    description: 'Monitor your performance and metrics',
  },
  settings: {
    title: 'Customize Your Experience',
    description: 'Set up alerts and notifications',
  },
  complete: {
    title: 'You\'re All Set!',
    description: 'Ready to start trading',
  },
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'tour-1',
    title: 'Welcome to Stock Predictor',
    description: 'Your AI-powered trading companion. Let\'s take a quick tour!',
    target: 'body',
    position: 'bottom',
    skipAllowed: true,
  },
  {
    id: 'tour-2',
    title: 'Search Stocks',
    description: 'Use the search bar to find and add stocks to your watchlist',
    target: '[data-tour="search"]',
    position: 'bottom',
    skipAllowed: true,
  },
  {
    id: 'tour-3',
    title: 'Trading Signals',
    description: 'See AI-generated buy/sell signals with confidence scores',
    target: '[data-tour="signals"]',
    position: 'left',
    skipAllowed: true,
  },
  {
    id: 'tour-4',
    title: 'Technical Indicators',
    description: 'View 15+ technical indicators for each stock',
    target: '[data-tour="indicators"]',
    position: 'left',
    skipAllowed: true,
  },
  {
    id: 'tour-5',
    title: 'Paper Trading',
    description: 'Practice trading with virtual money - no real risk!',
    target: '[data-tour="trading"]',
    position: 'bottom',
    skipAllowed: true,
  },
  {
    id: 'tour-6',
    title: 'Portfolio Dashboard',
    description: 'Track your performance, returns, and trading metrics',
    target: '[data-tour="portfolio"]',
    position: 'bottom',
    skipAllowed: true,
  },
  {
    id: 'tour-7',
    title: 'Leaderboard',
    description: 'Compare your performance with other traders',
    target: '[data-tour="leaderboard"]',
    position: 'left',
    skipAllowed: true,
  },
  {
    id: 'tour-8',
    title: 'Settings & Alerts',
    description: 'Customize alerts and notifications for your trading',
    target: '[data-tour="settings"]',
    position: 'left',
    skipAllowed: true,
  },
];

const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: 'task-1',
    title: 'Complete Your Profile',
    description: 'Add your trading experience level and goals',
    icon: '👤',
    completed: false,
    reward: { points: 10, badge: 'Profile Complete' },
  },
  {
    id: 'task-2',
    title: 'Add 5 Stocks to Watchlist',
    description: 'Build your initial watchlist',
    icon: '📊',
    completed: false,
    reward: { points: 20, badge: 'Watchlist Builder' },
  },
  {
    id: 'task-3',
    title: 'Place Your First Paper Trade',
    description: 'Execute a buy or sell order',
    icon: '💹',
    completed: false,
    reward: { points: 30, badge: 'First Trade' },
  },
  {
    id: 'task-4',
    title: 'Review Your First Signal',
    description: 'Understand an AI trading signal',
    icon: '🎯',
    completed: false,
    reward: { points: 15, badge: 'Signal Master' },
  },
  {
    id: 'task-5',
    title: 'Set Up Alerts',
    description: 'Configure price and signal alerts',
    icon: '🔔',
    completed: false,
    reward: { points: 15, badge: 'Alert Guardian' },
  },
  {
    id: 'task-6',
    title: 'Complete 10 Trades',
    description: 'Build trading experience',
    icon: '📈',
    completed: false,
    reward: { points: 50, badge: 'Active Trader' },
  },
];

/**
 * Initialize onboarding for new user
 */
export function initializeOnboarding(userId: number): OnboardingProgress {
  return {
    userId,
    currentStep: 'welcome',
    completedSteps: [],
    startedAt: new Date(),
    isCompleted: false,
    preferences: {
      showTour: true,
      showTooltips: true,
      showNotifications: true,
    },
  };
}

/**
 * Get next onboarding step
 */
export function getNextStep(currentStep: OnboardingStep): OnboardingStep {
  const steps: OnboardingStep[] = ['welcome', 'profile', 'watchlist', 'signals', 'trading', 'portfolio', 'settings', 'complete'];
  const currentIndex = steps.indexOf(currentStep);
  return steps[currentIndex + 1] || 'complete';
}

/**
 * Complete an onboarding step
 */
export function completeStep(progress: OnboardingProgress, step: OnboardingStep): OnboardingProgress {
  if (!progress.completedSteps.includes(step)) {
    progress.completedSteps.push(step);
  }

  progress.currentStep = getNextStep(step);

  if (progress.currentStep === 'complete') {
    progress.isCompleted = true;
    progress.completedAt = new Date();
  }

  return progress;
}

/**
 * Skip onboarding
 */
export function skipOnboarding(progress: OnboardingProgress): OnboardingProgress {
  progress.isCompleted = true;
  progress.skippedAt = new Date();
  progress.currentStep = 'complete';
  return progress;
}

/**
 * Get current tour step
 */
export function getCurrentTourStep(stepIndex: number): TourStep | null {
  return TOUR_STEPS[stepIndex] || null;
}

/**
 * Get all tour steps
 */
export function getAllTourSteps(): TourStep[] {
  return TOUR_STEPS;
}

/**
 * Get onboarding tasks
 */
export function getOnboardingTasks(): OnboardingTask[] {
  return ONBOARDING_TASKS;
}

/**
 * Calculate onboarding completion percentage
 */
export function calculateCompletionPercentage(progress: OnboardingProgress): number {
  const totalSteps = Object.keys(ONBOARDING_STEPS).length;
  return (progress.completedSteps.length / totalSteps) * 100;
}

/**
 * Get onboarding recommendations based on progress
 */
export function getRecommendations(progress: OnboardingProgress): string[] {
  const recommendations: string[] = [];

  if (!progress.completedSteps.includes('profile')) {
    recommendations.push('Complete your profile to get personalized trading recommendations');
  }

  if (!progress.completedSteps.includes('watchlist')) {
    recommendations.push('Add stocks to your watchlist to start receiving trading signals');
  }

  if (!progress.completedSteps.includes('trading')) {
    recommendations.push('Try paper trading to practice without risking real money');
  }

  if (!progress.completedSteps.includes('settings')) {
    recommendations.push('Set up alerts to never miss important trading opportunities');
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job! You\'ve completed the onboarding. Start exploring advanced features!');
  }

  return recommendations;
}

/**
 * Generate onboarding completion report
 */
export function generateOnboardingReport(progress: OnboardingProgress, tasks: OnboardingTask[]): string {
  const completionPercent = calculateCompletionPercentage(progress);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalReward = tasks.filter((t) => t.completed).reduce((sum, t) => sum + (t.reward?.points || 0), 0);

  const report = `
# Your Onboarding Progress

## Completion Status
- **Overall Progress:** ${completionPercent.toFixed(0)}%
- **Steps Completed:** ${progress.completedSteps.length}/${Object.keys(ONBOARDING_STEPS).length}
- **Current Step:** ${ONBOARDING_STEPS[progress.currentStep].title}

## Tasks Completed
- **Completed:** ${completedTasks}/${tasks.length}
- **Reward Points:** ${totalReward}

## Completed Steps
${progress.completedSteps.map((step) => `- ✅ ${ONBOARDING_STEPS[step].title}`).join('\n')}

## Next Steps
${getRecommendations(progress).map((rec) => `- ${rec}`).join('\n')}

## Your Journey
Started: ${progress.startedAt.toLocaleDateString()}
${progress.completedAt ? `Completed: ${progress.completedAt.toLocaleDateString()}` : 'In Progress...'}
`;

  return report;
}

/**
 * Check if user should see onboarding
 */
export function shouldShowOnboarding(progress: OnboardingProgress | null): boolean {
  if (!progress) return true;
  if (progress.isCompleted) return false;
  if (progress.skippedAt) return false;
  return true;
}

/**
 * Get welcome message based on progress
 */
export function getWelcomeMessage(progress: OnboardingProgress): string {
  if (progress.completedSteps.length === 0) {
    return 'Welcome to Stock Predictor! Let\'s get you started with a quick tour.';
  }

  if (progress.completedSteps.length < 3) {
    return `You're making great progress! ${progress.completedSteps.length} steps completed.`;
  }

  if (progress.completedSteps.length < 6) {
    return `Excellent! You're more than halfway through. Keep going!`;
  }

  return 'Almost there! Just a few more steps to complete your onboarding.';
}
