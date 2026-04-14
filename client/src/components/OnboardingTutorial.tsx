import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'add-stocks',
    title: 'Add Stocks to Watchlist',
    description: 'Start by adding stocks you want to monitor',
    icon: '📊',
    details: [
      'Search for stocks using the ticker symbol or company name',
      'Click "Add to Watchlist" to monitor the stock',
      'You can add up to 30 stocks in the Free tier',
      'Premium tiers allow unlimited watchlist items',
    ],
  },
  {
    id: 'interpret-signals',
    title: 'Interpret Trading Signals',
    description: 'Learn how to read and act on AI-powered signals',
    icon: '⚡',
    details: [
      'Green signals indicate buy opportunities',
      'Red signals indicate sell opportunities',
      'Confidence level shows prediction accuracy (0-100%)',
      'Check the technical analysis details for reasoning',
      'Use the risk strategy selector to adjust signal aggressiveness',
    ],
  },
  {
    id: 'trading-simulator',
    title: 'Use the Trading Simulator',
    description: 'Practice trading without real money',
    icon: '🎮',
    details: [
      'Start with a virtual $10,000 portfolio',
      'Execute trades based on signals you receive',
      'Track your performance and win rate',
      'Refine your strategy before trading with real money',
      'Compare your results with other traders',
    ],
  },
];

interface OnboardingTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function OnboardingTutorial({
  open,
  onOpenChange,
  onComplete,
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isStepCompleted = completedSteps.has(step.id);

  const handleNextStep = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(step.id);
    setCompletedSteps(newCompleted);
    if (isLastStep) {
      onOpenChange(false);
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipTutorial = () => {
    onOpenChange(false);
    onComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome to Vortex Trading</DialogTitle>
          <DialogDescription className="text-gray-400">
            Let's get you started with our AI-powered trading signals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Step indicator */}
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  idx < currentStep
                    ? 'bg-emerald-600'
                    : idx === currentStep
                    ? 'bg-emerald-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Current step content */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{step.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>

            {/* Step details */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              {step.details.map((detail, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="text-emerald-500 flex-shrink-0">✓</div>
                  <p className="text-gray-300">{detail}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="text-sm text-gray-400">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              variant="ghost"
              className="text-gray-400 hover:text-white disabled:opacity-50"
            >
              ← Previous
            </Button>

            <Button
              onClick={handleSkipTutorial}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Skip Tutorial
            </Button>

            <Button
              onClick={handleNextStep}
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
