# Stock Predictor - Frequently Asked Questions

## Getting Started

### What is Stock Predictor?

Stock Predictor is an advanced AI-powered trading intelligence platform designed for retail investors. It combines machine learning models, technical analysis, and real-time market data to generate high-conviction trading signals. The platform includes a paper trading simulator with comprehensive risk management to help you validate strategies before risking real capital.

### Do I need trading experience to use Stock Predictor?

No. Stock Predictor is designed for both beginners and experienced traders. The platform provides educational resources, signal explanations, and automated risk management that protects your portfolio even if you're new to trading. All signals include confidence scores and reasoning to help you understand each recommendation.

### Is Stock Predictor available on mobile?

Yes. Stock Predictor is a Progressive Web App (PWA) that works on iOS and Android devices. You can install it directly from your browser, and it works offline for viewing your portfolio and historical data.

### What markets does Stock Predictor cover?

Currently, Stock Predictor focuses on US equities (stocks) and ETFs listed on NASDAQ and NYSE. We cover over 5,000 securities including large-cap, mid-cap, and small-cap stocks across all major sectors.

---

## Trading & Signals

### How often does Stock Predictor generate signals?

The system generates new signals continuously throughout market hours (9:30 AM - 4:00 PM ET). Signals are updated in real-time as new price data arrives. You'll receive notifications for high-conviction signals that meet our quality filters.

### What does the confidence score mean?

The confidence score (0-100%) represents the model's certainty about a signal's direction. A score of 85% means the ensemble of ML models agrees with 85% confidence that the stock will move in the predicted direction. Higher confidence signals historically have better win rates.

### Can I trade on signals immediately?

Yes. Each signal includes a recommended entry price and stop-loss level. You can execute trades immediately through the simulator or your broker. However, we recommend waiting for market confirmation, especially during high-volatility periods (when VIX > 25).

### What's the difference between BUY and SELL signals?

**BUY signals** indicate the model predicts upward price movement. **SELL signals** indicate predicted downward movement. SELL signals can be used for short selling or to exit existing long positions. The platform supports both long and short strategies.

### How many signals should I trade per day?

The platform includes a trade frequency limiter that recommends no more than 10 trades per day to avoid overtrading. Most successful traders on our platform execute 2-5 trades daily, focusing on high-conviction signals with >80% confidence.

### What's the average win rate?

Historical backtests show a 62-68% win rate across all signals. However, when filtered through our quick-win filters (volatility, profit-taking, signal strength), win rates improve to 72-78%. Individual results vary based on market conditions and trading discipline.

---

## Risk Management

### How does Stock Predictor protect my portfolio?

The platform includes multiple layers of protection:

1. **Position Sizing** - Uses Kelly Criterion to calculate optimal position sizes based on your account and signal confidence
2. **Stop-Loss Enforcement** - Automatically calculates and enforces stop-loss levels (typically 2-3% below entry)
3. **Daily Loss Limits** - Prevents trading once daily losses exceed 2% of portfolio capital
4. **Concentration Limits** - Prevents over-concentration in single stocks or sectors
5. **Volatility Filters** - Skips trading when market volatility (VIX) exceeds safe thresholds

### What's the maximum daily loss limit?

The default daily loss limit is 2% of your starting capital. This means if you start with $10,000, you stop trading once losses reach $200 for the day. You can adjust this limit in settings, but we recommend keeping it at 2% or lower.

### How do stop-losses work?

Each signal includes a calculated stop-loss price. If you execute the trade, the platform tracks the position and alerts you if the stop-loss is hit. In the simulator, stops are automatically executed. With real brokers, you should set stop-loss orders manually or use our broker integration.

### What's the Sharpe ratio and why does it matter?

The Sharpe ratio measures risk-adjusted returns. A Sharpe ratio > 1.0 is considered good, > 2.0 is excellent. Stock Predictor aims for a Sharpe ratio > 1.5, meaning you're earning strong returns without excessive volatility. This metric helps you understand if profits come from skill or just taking excessive risk.

### Can I lose more than my starting capital?

In the simulator, no. Your account cannot go below zero. With real brokers and margin accounts, yes, you could lose more than your starting capital if you use leverage. We recommend starting with a cash account and no leverage until you're profitable.

### What's the maximum drawdown?

Maximum drawdown is the largest peak-to-trough decline in your portfolio value. Stock Predictor targets a maximum drawdown of 5% or less. For example, if your portfolio reaches $11,000 (peak), a 5% drawdown would bring it to $10,450 (trough).

---

## Platform Features

### What are quick-win filters?

Quick-win filters are automated rules that improve signal quality by filtering out low-probability trades:

1. **Volatility Filter** - Skips signals when VIX > 25 (high market stress)
2. **Profit-Taking Filter** - Auto-closes winners at +2% or +5% gains
3. **Signal Strength Filter** - Only trades signals with >75% confidence
4. **Market Hours Filter** - Avoids pre-market and after-hours trading
5. **Correlation Filter** - Prevents correlated positions that increase portfolio risk
6. **Trade Frequency Limiter** - Caps trades at 10 per day to avoid overtrading

You can enable/disable each filter based on your trading style.

### What's the difference between paper trading and live trading?

**Paper Trading** uses simulated money to test strategies without risk. All trades are executed at real market prices, but no actual money changes hands. This is perfect for learning and validating strategies.

**Live Trading** uses real money with a broker. Stock Predictor can generate signals for live trading, but you execute trades through your broker account. We recommend 3 months of successful paper trading before going live.

### Can I export my portfolio data?

Yes. You can export your portfolio to JSON or CSV format from the Portfolio page. This is useful for analysis, tax reporting, or backing up your trading history.

### Is there a leaderboard?

Yes. The platform includes a leaderboard showing top-performing portfolios ranked by total return, Sharpe ratio, or win rate. You can compare your performance against other traders and learn from successful strategies.

### Can I customize the dashboard?

Yes. You can customize which metrics appear on your dashboard, choose between light and dark themes, and set alert preferences for notifications.

---

## Technical & Model Details

### What machine learning models does Stock Predictor use?

Stock Predictor uses an ensemble of three models:

1. **LSTM (Long Short-Term Memory)** - Deep learning model that captures long-term price patterns and trends
2. **XGBoost** - Gradient boosting model that excels at identifying non-linear relationships in market data
3. **Ensemble** - Combines predictions from both models using weighted voting for final signals

Each model is retrained daily with the latest market data.

### What technical indicators are used?

The platform analyzes five core technical indicators:

1. **RSI (Relative Strength Index)** - Identifies overbought/oversold conditions
2. **MACD (Moving Average Convergence Divergence)** - Detects momentum and trend changes
3. **Bollinger Bands** - Identifies volatility and potential reversal points
4. **Volume Analysis** - Confirms price moves with volume strength
5. **Moving Averages** - Identifies trend direction and support/resistance levels

### How often are models retrained?

Models are retrained daily after market close using the latest price data. This ensures the models adapt to changing market conditions and recent price patterns.

### What data does Stock Predictor use?

The platform uses:
- **Real-time price data** - Updated every minute during market hours
- **Historical price data** - 5+ years of historical prices for pattern recognition
- **Volume data** - Trading volume for signal confirmation
- **Market regime data** - VIX, market breadth, sector rotation
- **Sentiment data** - News sentiment and social media mentions

All data is sourced from reliable financial data providers.

### How accurate are the models?

Backtests show 65-72% directional accuracy on the test set. However, accuracy varies by market condition. During trending markets, accuracy is higher (70-75%). During choppy, sideways markets, accuracy is lower (55-60%). This is why the platform includes confidence scores and risk management.

---

## Pricing & Subscriptions

### What's included in the free plan?

The free plan includes:
- Access to 50 daily signals (limited)
- Basic technical analysis
- Paper trading simulator
- Mobile app access
- Community forum

### What's the difference between plans?

| Feature | Free | Starter | Pro | Elite |
|---------|------|---------|-----|-------|
| Daily Signals | 50 | Unlimited | Unlimited | Unlimited |
| Real-time Updates | 1 hour delay | Real-time | Real-time | Real-time |
| Advanced Filters | No | Yes | Yes | Yes |
| Risk Dashboard | Basic | Full | Full | Full |
| API Access | No | No | Yes | Yes |
| Priority Support | No | No | Yes | Yes |
| Portfolio Export | No | Yes | Yes | Yes |
| Price | Free | $9.99/mo | $29.99/mo | $99.99/mo |

### Can I cancel anytime?

Yes. All paid subscriptions can be cancelled anytime with no penalties. Your access continues until the end of your billing period.

### Is there a free trial?

Yes. New users get a 14-day free trial of the Pro plan. No credit card required. After the trial ends, you'll revert to the free plan unless you choose to upgrade.

### Do you offer refunds?

We offer a 30-day money-back guarantee. If you're not satisfied with the platform within 30 days of purchase, we'll refund your subscription fee in full.

---

## Account & Security

### How do I create an account?

Click "Sign Up" on the homepage and authenticate with your email or social account (Google, GitHub). You'll receive a verification email to confirm your account.

### Is my data secure?

Yes. We use industry-standard security:
- **SSL/TLS encryption** for all data in transit
- **AES-256 encryption** for sensitive data at rest
- **Two-factor authentication (2FA)** available for account security
- **No storage of passwords** - we use secure OAuth authentication
- **Regular security audits** by third-party security firms

### Can I connect my broker account?

Currently, Stock Predictor generates signals but doesn't directly connect to brokers. You execute trades manually through your broker. We're working on direct broker integrations for one-click trading.

### How do I enable two-factor authentication?

Go to Settings → Security and click "Enable 2FA". You'll be prompted to scan a QR code with an authenticator app (Google Authenticator, Authy, etc.). This adds an extra security layer to your account.

### Can I delete my account?

Yes. Go to Settings → Account and click "Delete Account". This permanently removes all your data, portfolio history, and signals. This action cannot be undone.

---

## Troubleshooting

### Why am I not receiving signals?

Check the following:
1. Ensure you're subscribed to a plan that includes signals
2. Check your notification settings - signals might be muted
3. Verify market hours (signals only generate during 9:30 AM - 4:00 PM ET)
4. Check if daily loss limit has been reached (trading pauses at 2% daily loss)
5. Verify your watchlist has stocks - signals are only generated for stocks you're watching

### Why is the app slow or unresponsive?

Try the following:
1. Clear your browser cache and cookies
2. Disable browser extensions that might interfere
3. Try a different browser (Chrome, Firefox, Safari)
4. Restart the app
5. Check your internet connection speed

### How do I report a bug?

Email support@stockpredictor.com with:
- Description of the issue
- Steps to reproduce
- Screenshots if applicable
- Your browser and device information

Our team typically responds within 24 hours.

### Why did I miss a signal?

Signals are generated continuously, but you might miss them if:
1. You're not subscribed to notifications
2. Notifications are muted in your browser/phone settings
3. You're outside market hours
4. Your daily loss limit has been reached
5. The signal was filtered out by your active filters

### How do I contact support?

Email: support@stockpredictor.com
Live Chat: Available in-app during market hours (9:30 AM - 4:00 PM ET)
Community Forum: Ask questions and get help from other traders

---

## Advanced Topics

### Can I use an API to access signals?

Yes. Pro and Elite plans include API access. You can programmatically fetch signals, portfolio data, and historical performance. API documentation is available in your account dashboard.

### Can I backtest strategies?

Yes. The backtesting engine lets you test any strategy on 5+ years of historical data. You can customize parameters like entry/exit rules, position sizing, and risk limits. Results show win rate, Sharpe ratio, and maximum drawdown.

### How do I interpret the signal reasoning?

Each signal includes a detailed explanation of why the model made that prediction. This includes:
- Technical indicators that triggered the signal
- Recent price patterns that match historical winners
- Market regime context (trending vs. choppy)
- Risk/reward ratio for the trade

### Can I create custom watchlists?

Yes. Create unlimited watchlists to organize stocks by sector, strategy, or custom criteria. Signals are generated for all stocks in your watchlists.

### How do I set up alerts?

Go to Settings → Alerts and customize:
- Which signal types trigger alerts (BUY, SELL, or both)
- Minimum confidence threshold
- Alert method (in-app, email, push notification)
- Quiet hours (e.g., no alerts before 8 AM or after 6 PM)

---

## Performance & Results

### What are typical returns?

Historical backtests show average monthly returns of 8-12% during bull markets and 2-4% during bear markets. However, individual results vary significantly based on market conditions, trading discipline, and risk management adherence.

### How long does it take to see results?

Most traders see meaningful results within 2-4 weeks of consistent trading. However, we recommend at least 3 months of paper trading before evaluating performance, as this provides enough data to account for different market conditions.

### What's the best strategy for beginners?

We recommend:
1. Start with paper trading for 3 months
2. Trade only high-confidence signals (>80%)
3. Enable all quick-win filters
4. Keep position sizes small (1-2% of portfolio per trade)
5. Follow the daily loss limit strictly
6. Review and learn from every trade

### How do I improve my win rate?

1. **Trade only high-confidence signals** - Filter for signals >80% confidence
2. **Use quick-win filters** - Enable volatility and profit-taking filters
3. **Follow risk management** - Stick to stop-losses and daily loss limits
4. **Avoid overtrading** - Limit to 5-10 trades per day
5. **Trade with the trend** - Avoid counter-trend trades
6. **Review your trades** - Learn from losses and adjust your approach

---

## Legal & Compliance

### Is Stock Predictor a financial advisor?

No. Stock Predictor is a trading tool that generates signals based on technical analysis and machine learning. We do not provide personalized financial advice. Always do your own research and consult a financial advisor before making investment decisions.

### Is trading risky?

Yes. Trading stocks involves significant risk, including the potential loss of your entire investment. Past performance does not guarantee future results. Only trade with money you can afford to lose.

### What are the tax implications?

Stock trading is subject to capital gains taxes. Short-term gains (held <1 year) are taxed as ordinary income. Long-term gains (held >1 year) typically receive preferential tax treatment. Consult a tax professional for your specific situation.

### Is Stock Predictor registered with the SEC?

Stock Predictor is not a registered investment advisor or broker. We're a software platform that provides trading signals and tools. You execute trades through a licensed broker.

### What's your privacy policy?

We never sell your data to third parties. We collect minimal personal information and use it only to provide our service. See our full Privacy Policy for details.

---

## Getting Help

### Where can I find more resources?

- **User Guide** - Comprehensive documentation in Settings → Help
- **Video Tutorials** - Step-by-step guides on YouTube channel
- **Community Forum** - Ask questions and learn from other traders
- **Blog** - Weekly market analysis and trading tips
- **Webinars** - Live Q&A sessions with our team (monthly)

### How do I provide feedback?

We'd love to hear from you! Send feedback to feedback@stockpredictor.com or use the feedback form in Settings → Feedback. We read every suggestion and use it to improve the platform.

### How often is the FAQ updated?

We update this FAQ monthly based on common questions and platform changes. Check back regularly for new information.
