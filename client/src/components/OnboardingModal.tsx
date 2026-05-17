import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle2, Search, TrendingUp, Zap, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type OnboardingStep = 1 | 2 | 3;

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Welcome to Stock Predictor</DialogTitle>
              <DialogDescription className="mt-2">
                Let's get you started with AI-powered trading signals in 3 easy steps
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Step {currentStep} of 3</span>
            <span className="text-muted-foreground">{progressPercentage.toFixed(0)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step 1: Add Stock */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-cyan-500" />
                  <CardTitle>Step 1: Add a Stock to Your Watchlist</CardTitle>
                </div>
                <CardDescription>
                  Start by adding a stock you're interested in tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Why start here?</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Build a personalized watchlist of stocks you care about</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Get real-time signals for your selected stocks</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Track price changes and technical indicators</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-background/50 p-3 border border-border">
                  <p className="text-sm font-medium mb-2">Popular stocks to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'].map((ticker) => (
                      <Badge key={ticker} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {ticker}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Check Signals */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <CardTitle>Step 2: Check the Latest Signals</CardTitle>
                </div>
                <CardDescription>
                  View AI-generated buy/sell signals for your stocks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">What you'll see:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Buy/Sell signals based on technical analysis</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Confidence scores (25-100%) showing signal strength</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Technical indicators: RSI, MACD, Moving Averages</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Data freshness badges showing when signals were updated</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-background/50 p-3 border border-amber-500/20">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">💡 Pro Tip</p>
                  <p className="text-xs text-muted-foreground">
                    Signals are based on daily technical analysis. They work best for swing trades (3-5 day holds), not day trading.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Try Simulator */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-500" />
                  <CardTitle>Step 3: Try the Paper Trading Simulator</CardTitle>
                </div>
                <CardDescription>
                  Practice trading with virtual money, risk-free
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">What you can do:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Execute trades with $10,000 virtual capital</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Test signal-following strategies risk-free</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Track portfolio performance and P&L</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Enable auto-trading to test automated strategies</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-background/50 p-3 border border-blue-500/20">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">ℹ️ Important</p>
                  <p className="text-xs text-muted-foreground">
                    Simulator results are for learning only. Real trading may differ due to market conditions, slippage, and execution prices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {currentStep === 3 ? (
                <>
                  Get Started
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
