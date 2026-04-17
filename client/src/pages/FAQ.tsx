import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'Getting Started',
    question: 'What is Stock Predictor?',
    answer: 'Stock Predictor is an advanced AI-powered trading intelligence platform designed for retail investors. It combines machine learning models, technical analysis, and real-time market data to generate high-conviction trading signals. The platform includes a paper trading simulator with comprehensive risk management to help you validate strategies before risking real capital.',
  },
  {
    id: 'gs-2',
    category: 'Getting Started',
    question: 'Do I need trading experience to use Stock Predictor?',
    answer: 'No. Stock Predictor is designed for both beginners and experienced traders. The platform provides educational resources, signal explanations, and automated risk management that protects your portfolio even if you\'re new to trading. All signals include confidence scores and reasoning to help you understand each recommendation.',
  },
  {
    id: 'gs-3',
    category: 'Getting Started',
    question: 'Is Stock Predictor available on mobile?',
    answer: 'Yes. Stock Predictor is a Progressive Web App (PWA) that works on iOS and Android devices. You can install it directly from your browser, and it works offline for viewing your portfolio and historical data.',
  },
  {
    id: 'gs-4',
    category: 'Getting Started',
    question: 'What markets does Stock Predictor cover?',
    answer: 'Currently, Stock Predictor focuses on US equities (stocks) and ETFs listed on NASDAQ and NYSE. We cover over 5,000 securities including large-cap, mid-cap, and small-cap stocks across all major sectors.',
  },

  // Trading & Signals
  {
    id: 'ts-1',
    category: 'Trading & Signals',
    question: 'How often does Stock Predictor generate signals?',
    answer: 'The system generates new signals continuously throughout market hours (9:30 AM - 4:00 PM ET). Signals are updated in real-time as new price data arrives. You\'ll receive notifications for high-conviction signals that meet our quality filters.',
  },
  {
    id: 'ts-2',
    category: 'Trading & Signals',
    question: 'What does the confidence score mean?',
    answer: 'The confidence score (0-100%) represents the model\'s certainty about a signal\'s direction. A score of 85% means the ensemble of ML models agrees with 85% confidence that the stock will move in the predicted direction. Higher confidence signals historically have better win rates.',
  },
  {
    id: 'ts-3',
    category: 'Trading & Signals',
    question: 'Can I trade on signals immediately?',
    answer: 'Yes. Each signal includes a recommended entry price and stop-loss level. You can execute trades immediately through the simulator or your broker. However, we recommend waiting for market confirmation, especially during high-volatility periods (when VIX > 25).',
  },
  {
    id: 'ts-4',
    category: 'Trading & Signals',
    question: 'What\'s the average win rate?',
    answer: 'Historical backtests show a 62-68% win rate across all signals. However, when filtered through our quick-win filters (volatility, profit-taking, signal strength), win rates improve to 72-78%. Individual results vary based on market conditions and trading discipline.',
  },

  // Risk Management
  {
    id: 'rm-1',
    category: 'Risk Management',
    question: 'How does Stock Predictor protect my portfolio?',
    answer: 'The platform includes multiple layers of protection: (1) Position Sizing using Kelly Criterion, (2) Stop-Loss Enforcement with automatic calculations, (3) Daily Loss Limits preventing trading beyond 2% losses, (4) Concentration Limits avoiding over-concentration, and (5) Volatility Filters skipping trades during high VIX periods.',
  },
  {
    id: 'rm-2',
    category: 'Risk Management',
    question: 'What\'s the maximum daily loss limit?',
    answer: 'The default daily loss limit is 2% of your starting capital. This means if you start with $10,000, you stop trading once losses reach $200 for the day. You can adjust this limit in settings, but we recommend keeping it at 2% or lower.',
  },
  {
    id: 'rm-3',
    category: 'Risk Management',
    question: 'What\'s the Sharpe ratio and why does it matter?',
    answer: 'The Sharpe ratio measures risk-adjusted returns. A Sharpe ratio > 1.0 is considered good, > 2.0 is excellent. Stock Predictor aims for a Sharpe ratio > 1.5, meaning you\'re earning strong returns without excessive volatility. This metric helps you understand if profits come from skill or just taking excessive risk.',
  },
  {
    id: 'rm-4',
    category: 'Risk Management',
    question: 'What\'s the maximum drawdown?',
    answer: 'Maximum drawdown is the largest peak-to-trough decline in your portfolio value. Stock Predictor targets a maximum drawdown of 5% or less. For example, if your portfolio reaches $11,000 (peak), a 5% drawdown would bring it to $10,450 (trough).',
  },

  // Platform Features
  {
    id: 'pf-1',
    category: 'Platform Features',
    question: 'What are quick-win filters?',
    answer: 'Quick-win filters are automated rules that improve signal quality: (1) Volatility Filter skips signals when VIX > 25, (2) Profit-Taking Filter auto-closes winners at +2% or +5%, (3) Signal Strength Filter only trades >75% confidence, (4) Market Hours Filter avoids pre/post-market, (5) Correlation Filter prevents correlated positions, (6) Trade Frequency Limiter caps trades at 10 per day.',
  },
  {
    id: 'pf-2',
    category: 'Platform Features',
    question: 'What\'s the difference between paper trading and live trading?',
    answer: 'Paper Trading uses simulated money to test strategies without risk. All trades execute at real market prices, but no actual money changes hands. Live Trading uses real money with a broker. Stock Predictor generates signals for live trading, but you execute trades through your broker. We recommend 3 months of successful paper trading before going live.',
  },
  {
    id: 'pf-3',
    category: 'Platform Features',
    question: 'Can I export my portfolio data?',
    answer: 'Yes. You can export your portfolio to JSON or CSV format from the Portfolio page. This is useful for analysis, tax reporting, or backing up your trading history.',
  },
  {
    id: 'pf-4',
    category: 'Platform Features',
    question: 'Is there a leaderboard?',
    answer: 'Yes. The platform includes a leaderboard showing top-performing portfolios ranked by total return, Sharpe ratio, or win rate. You can compare your performance against other traders and learn from successful strategies.',
  },

  // Technical & Model Details
  {
    id: 'tm-1',
    category: 'Technical & Model Details',
    question: 'What machine learning models does Stock Predictor use?',
    answer: 'Stock Predictor uses an ensemble of three models: (1) LSTM (Long Short-Term Memory) - a deep learning model that captures long-term price patterns, (2) XGBoost - a gradient boosting model that identifies non-linear relationships, (3) Ensemble - combines predictions from both models using weighted voting. Each model is retrained daily with the latest market data.',
  },
  {
    id: 'tm-2',
    category: 'Technical & Model Details',
    question: 'What technical indicators are used?',
    answer: 'The platform analyzes five core technical indicators: (1) RSI (Relative Strength Index) for overbought/oversold conditions, (2) MACD for momentum and trend changes, (3) Bollinger Bands for volatility and reversals, (4) Volume Analysis for price confirmation, (5) Moving Averages for trend direction and support/resistance.',
  },
  {
    id: 'tm-3',
    category: 'Technical & Model Details',
    question: 'How accurate are the models?',
    answer: 'Backtests show 65-72% directional accuracy on the test set. However, accuracy varies by market condition. During trending markets, accuracy is higher (70-75%). During choppy, sideways markets, accuracy is lower (55-60%). This is why the platform includes confidence scores and risk management.',
  },

  // Pricing & Subscriptions
  {
    id: 'ps-1',
    category: 'Pricing & Subscriptions',
    question: 'What\'s included in the free plan?',
    answer: 'The free plan includes: Access to 50 daily signals (limited), Basic technical analysis, Paper trading simulator, Mobile app access, and Community forum access.',
  },
  {
    id: 'ps-2',
    category: 'Pricing & Subscriptions',
    question: 'Can I cancel anytime?',
    answer: 'Yes. All paid subscriptions can be cancelled anytime with no penalties. Your access continues until the end of your billing period.',
  },
  {
    id: 'ps-3',
    category: 'Pricing & Subscriptions',
    question: 'Is there a free trial?',
    answer: 'Yes. New users get a 14-day free trial of the Pro plan. No credit card required. After the trial ends, you\'ll revert to the free plan unless you choose to upgrade.',
  },
  {
    id: 'ps-4',
    category: 'Pricing & Subscriptions',
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with the platform within 30 days of purchase, we\'ll refund your subscription fee in full.',
  },

  // Account & Security
  {
    id: 'as-1',
    category: 'Account & Security',
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard security: SSL/TLS encryption for all data in transit, AES-256 encryption for sensitive data at rest, Two-factor authentication (2FA) available for account security, No storage of passwords using secure OAuth authentication, and Regular security audits by third-party security firms.',
  },
  {
    id: 'as-2',
    category: 'Account & Security',
    question: 'How do I enable two-factor authentication?',
    answer: 'Go to Settings → Security and click "Enable 2FA". You\'ll be prompted to scan a QR code with an authenticator app (Google Authenticator, Authy, etc.). This adds an extra security layer to your account.',
  },
  {
    id: 'as-3',
    category: 'Account & Security',
    question: 'Can I delete my account?',
    answer: 'Yes. Go to Settings → Account and click "Delete Account". This permanently removes all your data, portfolio history, and signals. This action cannot be undone.',
  },

  // Troubleshooting
  {
    id: 'tr-1',
    category: 'Troubleshooting',
    question: 'Why am I not receiving signals?',
    answer: 'Check the following: (1) Ensure you\'re subscribed to a plan that includes signals, (2) Check your notification settings - signals might be muted, (3) Verify market hours (signals only generate during 9:30 AM - 4:00 PM ET), (4) Check if daily loss limit has been reached, (5) Verify your watchlist has stocks.',
  },
  {
    id: 'tr-2',
    category: 'Troubleshooting',
    question: 'Why is the app slow or unresponsive?',
    answer: 'Try the following: (1) Clear your browser cache and cookies, (2) Disable browser extensions that might interfere, (3) Try a different browser (Chrome, Firefox, Safari), (4) Restart the app, (5) Check your internet connection speed.',
  },
  {
    id: 'tr-3',
    category: 'Troubleshooting',
    question: 'How do I report a bug?',
    answer: 'Email support@stockpredictor.com with: Description of the issue, Steps to reproduce, Screenshots if applicable, and Your browser and device information. Our team typically responds within 24 hours.',
  },
];

const categories = Array.from(new Set(faqItems.map(item => item.category)));

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Find answers to common questions about Stock Predictor
          </p>

          {/* Search */}
          <div className="relative mb-8">
            <Input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            items.length > 0 && (
              <div key={category}>
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">{category}</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden hover:border-cyan-500 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-600 transition-colors"
                      >
                        <span className="text-left font-semibold text-white">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform ${
                            expandedId === item.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedId === item.id && (
                        <div className="px-6 py-4 bg-slate-800 border-t border-slate-600">
                          <p className="text-slate-200 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-slate-400">
                No results found for "{searchTerm}"
              </p>
              <p className="text-slate-500 mt-2">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-slate-700 border border-slate-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Didn't find what you're looking for?
          </h3>
          <p className="text-slate-300 mb-6">
            Our support team is here to help. Reach out to us anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Contact Support
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
              Visit Community Forum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
