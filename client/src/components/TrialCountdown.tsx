import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface TrialStatus {
  daysRemaining: number;
  percentageComplete: number;
  trialEndDate: Date;
  status: 'active' | 'expiring_soon' | 'expired';
}

interface TrialCountdownProps {
  trialStatus?: TrialStatus | null;
  onDismiss?: () => void;
}

export function TrialCountdown({ trialStatus, onDismiss }: TrialCountdownProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [, setLocation] = useLocation();

  if (!trialStatus || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    setLocation('/pricing');
  };

  const getProgressColor = () => {
    if (trialStatus.daysRemaining > 3) return 'bg-green-500';
    if (trialStatus.daysRemaining > 1) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBackgroundColor = () => {
    if (trialStatus.daysRemaining > 3) return 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800';
    if (trialStatus.daysRemaining > 1) return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-200 dark:border-yellow-800';
    return 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-200 dark:border-red-800';
  };

  const getTextColor = () => {
    if (trialStatus.daysRemaining > 3) return 'text-green-900 dark:text-green-100';
    if (trialStatus.daysRemaining > 1) return 'text-yellow-900 dark:text-yellow-100';
    return 'text-red-900 dark:text-red-100';
  };

  const getIconColor = () => {
    if (trialStatus.daysRemaining > 3) return 'text-green-600 dark:text-green-400';
    if (trialStatus.daysRemaining > 1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={`border ${getBackgroundColor()}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className={`w-5 h-5 mt-1 flex-shrink-0 ${getIconColor()}`} />
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${getTextColor()}`}>
                {trialStatus.daysRemaining === 0
                  ? 'Your Trial Has Ended'
                  : `${trialStatus.daysRemaining} Day${trialStatus.daysRemaining !== 1 ? 's' : ''} Left in Your Trial`}
              </h3>
              <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
                {trialStatus.daysRemaining === 0
                  ? 'Upgrade to a paid plan to continue using Stock Predictor'
                  : `Your trial expires on ${new Date(trialStatus.trialEndDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`}
              </p>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-black/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor()} transition-all duration-300`}
                  style={{ width: `${trialStatus.percentageComplete}%` }}
                />
              </div>

              {/* Features Highlight */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Zap className={`w-3 h-3 ${getIconColor()}`} />
                  <span className={getTextColor()}>Unlimited Stocks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className={`w-3 h-3 ${getIconColor()}`} />
                  <span className={getTextColor()}>Real-time Signals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              size="sm"
            >
              Upgrade Now
            </Button>
            <Button variant="ghost" onClick={handleDismiss} size="sm" className={getTextColor()}>
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Trial Status Widget for Dashboard
 */
export function TrialStatusWidget({ trialStatus }: { trialStatus?: TrialStatus | null }) {
  if (!trialStatus || trialStatus.status === 'expired') {
    return null;
  }

  const getStatusEmoji = () => {
    if (trialStatus.daysRemaining > 3) return '✅';
    if (trialStatus.daysRemaining > 1) return '⚠️';
    return '🔴';
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getStatusEmoji()}</span>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Trial Status</h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {trialStatus.daysRemaining} days remaining
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Expires: {new Date(trialStatus.trialEndDate).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-700">
            View Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Trial Expiration Email Template
 */
export function getTrialExpirationEmailTemplate(daysRemaining: number, trialEndDate: Date): string {
  const emailDate = new Date(trialEndDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Stock Predictor Trial is Ending Soon</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
    }
    .features {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .features li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .features li:before {
      content: "✓ ";
      color: #28a745;
      font-weight: bold;
      margin-right: 10px;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Trial is Ending Soon</h1>
      <p>${daysRemaining} days remaining</p>
    </div>

    <div class="content">
      <p>Hi there,</p>
      
      <p>Your Stock Predictor trial will expire on <strong>${emailDate}</strong>. Don't miss out on the advanced AI trading signals and portfolio management tools!</p>

      <h3>What You'll Lose After Your Trial Ends:</h3>
      <ul class="features">
        <li>Access to unlimited stock monitoring</li>
        <li>Advanced AI trading signals</li>
        <li>Real-time market analysis</li>
        <li>Portfolio management tools</li>
        <li>Automated trading execution</li>
        <li>Priority support</li>
      </ul>

      <p>Upgrade now to keep your trading signals active and continue your journey to smarter trading.</p>

      <center>
        <a href="https://manuspredictor.com/pricing" class="cta-button">Upgrade to Paid Plan</a>
      </center>

      <h3>Our Plans:</h3>
      <ul class="features">
        <li><strong>Starter</strong> - £9.99/month - 50 stocks, basic signals</li>
        <li><strong>Pro</strong> - £29.99/month - Unlimited stocks, advanced signals</li>
        <li><strong>Elite</strong> - £99.99/month - Everything + priority support</li>
      </ul>

      <p>If you have any questions, feel free to reach out to our support team.</p>

      <p>Best regards,<br>The Stock Predictor Team</p>
    </div>

    <div class="footer">
      <p>© 2026 Stock Predictor. All rights reserved.</p>
      <p><a href="https://manuspredictor.com/help" style="color: #667eea; text-decoration: none;">Help Center</a> | <a href="https://manuspredictor.com/contact" style="color: #667eea; text-decoration: none;">Contact Us</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
