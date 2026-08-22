import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'watchlist',
    title: 'Your Watchlist',
    description: 'Add stocks you want to track. Search by ticker symbol (e.g., AAPL, MSFT, TSLA).',
    targetSelector: '[data-walkthrough="watchlist"]',
    position: 'bottom',
  },
  {
    id: 'signals',
    title: 'Trading Signals',
    description: 'View AI-generated buy/sell signals based on technical indicators (RSI, MACD, Bollinger Bands).',
    targetSelector: '[data-walkthrough="signals"]',
    position: 'bottom',
  },
  {
    id: 'confidence',
    title: 'Signal Confidence',
    description: 'Higher confidence signals are more likely to be accurate. Look for 70%+ confidence.',
    targetSelector: '[data-walkthrough="confidence"]',
    position: 'left',
  },
  {
    id: 'simulator',
    title: 'Signal Engine',
    description: 'Run automated paper trades or practise manually with $10,000 virtual capital before risking real money.',
    targetSelector: '[data-walkthrough="simulator"]',
    position: 'bottom',
  },
  {
    id: 'portfolio',
    title: 'Your Portfolio',
    description: 'Track trades, positions, and performance. See real-time P&L for each position.',
    targetSelector: '[data-walkthrough="portfolio"]',
    position: 'bottom',
  },
];

interface DashboardWalkthroughProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function DashboardWalkthrough({ onComplete, autoStart = true }: DashboardWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = WALKTHROUGH_STEPS[currentStep];

  useEffect(() => {
    if (!isVisible || !step) return;

    const targetElement = document.querySelector(step.targetSelector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightRect(rect);
    }
  }, [currentStep, isVisible, step]);

  const handleNext = () => {
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('dashboard-walkthrough-completed', 'true');
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('dashboard-walkthrough-completed', 'true');
  };

  if (!isVisible || !step || !highlightRect) {
    return null;
  }

  const padding = 16;
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  switch (step.position) {
    case 'top':
      tooltipStyle.top = highlightRect.top - 200 - padding;
      tooltipStyle.left = highlightRect.left + highlightRect.width / 2 - 150;
      break;
    case 'bottom':
      tooltipStyle.top = highlightRect.bottom + padding;
      tooltipStyle.left = highlightRect.left + highlightRect.width / 2 - 150;
      break;
    case 'left':
      tooltipStyle.top = highlightRect.top + highlightRect.height / 2 - 60;
      tooltipStyle.left = highlightRect.left - 320 - padding;
      break;
    case 'right':
      tooltipStyle.top = highlightRect.top + highlightRect.height / 2 - 60;
      tooltipStyle.left = highlightRect.right + padding;
      break;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            100% 100%,
            100% 0%,
            0% 0%,
            ${highlightRect.left - 8}px ${highlightRect.top - 8}px,
            ${highlightRect.left - 8}px ${highlightRect.top + highlightRect.height + 8}px,
            ${highlightRect.left + highlightRect.width + 8}px ${highlightRect.top + highlightRect.height + 8}px,
            ${highlightRect.left + highlightRect.width + 8}px ${highlightRect.top - 8}px
          )`,
        }}
        onClick={handleSkip}
      />

      <Card
        className="fixed w-80 shadow-lg"
        style={tooltipStyle}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{step.description}</p>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${((currentStep + 1) / WALKTHROUGH_STEPS.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {WALKTHROUGH_STEPS.length}
            </span>
          </div>

          <div className="flex gap-2 justify-end">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === WALKTHROUGH_STEPS.length - 1 ? 'Done' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export function useDashboardWalkthrough() {
  const [hasCompleted, setHasCompleted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dashboard-walkthrough-completed') === 'true';
  });

  const reset = () => {
    localStorage.removeItem('dashboard-walkthrough-completed');
    setHasCompleted(false);
  };

  const complete = () => {
    localStorage.setItem('dashboard-walkthrough-completed', 'true');
    setHasCompleted(true);
  };

  return { hasCompleted, reset, complete };
}
