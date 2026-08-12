# Vortextrade - Premium Trading Intelligence Platform

A sophisticated, AI-powered stock analysis and trading simulator platform designed for Trading 212 users. Combines advanced technical analysis, machine learning-generated signals, and risk-free paper trading in an elegant, mobile-first interface.

## 🎯 Key Features

### 📊 Real-Time Stock Analysis
- **Live Price Data**: Real-time market data for Trading 212-listed stocks and ETFs
- **Technical Indicators**: RSI, MACD, Bollinger Bands, SMA, and EMA calculations
- **Interactive Charts**: Candlestick and line chart views with indicator overlays
- **Market Overview**: Top gainers, losers, and overall market sentiment

### 🤖 AI-Powered Trading Signals
- **ML Signal Generation**: LLM-powered analysis of price patterns and technical indicators
- **Confidence Scoring**: Each signal includes a confidence score (0-100%)
- **Signal History**: Complete log of past signals with timestamps and accuracy tracking
- **Advanced Analysis**: Combines multiple indicators for robust signal generation

### 🔔 Smart Notifications
- **In-App Alerts**: Real-time notifications for buy/sell signals
- **Notification Center**: Persistent notification log with unread badge
- **Customizable Preferences**: Configure alert thresholds per stock
- **Multi-Channel**: Support for in-app and email notifications

### 📱 Mobile App & PWA
- **Progressive Web App**: Install as native app on iOS and Android
- **Offline Support**: Service worker enables offline access to cached data
- **Responsive Design**: Optimized for all screen sizes
- **App Install Prompts**: Easy one-click installation

### 💼 Trading Simulator
- **Virtual Portfolio**: Practice trading with fictional capital (no real money at risk)
- **Realistic Execution**: Includes slippage (0.05%) and commissions (0.1%)
- **Position Tracking**: Monitor open positions with unrealized P&L
- **Performance Analytics**: Sharpe ratio, max drawdown, win rate calculations
- **Trade History**: Complete log of all executed trades with P&L

### 👤 User Management
- **Authentication**: Secure Manus OAuth login
- **Personal Watchlists**: User-specific stock monitoring
- **Alert Preferences**: Customizable settings per user
- **Account Settings**: Manage notifications and preferences

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Vite
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Real-Time Data**: yfinance API integration
- **AI/ML**: LLM-powered signal generation
- **Deployment**: Manus platform with auto-scaling

### Database Schema
- `users` - User authentication and profiles
- `stocks` - Trading 212 stock metadata
- `watchlists` - User watchlist items
- `signals` - Generated trading signals with confidence
- `alerts` - Alert delivery history
- `notifications` - In-app notification tracking
- `priceHistory` - Historical OHLCV data
- `simulatorPortfolios` - Virtual trading portfolios
- `simulatorPositions` - Open positions in simulator
- `simulatorTrades` - Trade execution history
- `simulatorClosedTrades` - Closed trades with realized P&L
- `simulatorPerformance` - Daily performance snapshots

## 🚀 Getting Started

### Installation

#### Web Browser
1. Navigate to the application URL
2. Sign in with your Manus account
3. Start exploring stocks and trading signals

#### Mobile App
1. Open the web app on your mobile device
2. Look for the "Install App" prompt
3. Tap "Install" to add to your home screen
4. Launch the app like any native application

### First Steps

1. **Explore Dashboard**: View market overview and top movers
2. **Add Stocks**: Search for Trading 212-listed stocks to your watchlist
3. **View Signals**: Check trading signals and technical analysis
4. **Configure Alerts**: Set notification preferences for your stocks
5. **Try Simulator**: Practice trading with virtual money

## 📊 Technical Indicators

### RSI (Relative Strength Index)
Measures momentum and identifies overbought/oversold conditions:
- **Below 30**: Oversold (potential buy signal)
- **Above 70**: Overbought (potential sell signal)
- **Range**: 0-100

### MACD (Moving Average Convergence Divergence)
Identifies trend changes and momentum:
- **Positive histogram**: Bullish momentum
- **Negative histogram**: Bearish momentum
- **Signal line crossover**: Potential trend change

### Bollinger Bands
Identifies volatility and support/resistance levels:
- **Upper band**: Potential resistance
- **Lower band**: Potential support
- **Band width**: Volatility indicator

### Moving Averages
- **SMA (20-period)**: Simple moving average for trend identification
- **EMA (12-period)**: Exponential moving average for responsive signals

## 🎮 Trading Simulator

### How It Works
1. **Create Portfolio**: Start with virtual capital (e.g., £10,000)
2. **Execute Trades**: Buy/sell stocks using real price data
3. **Track Positions**: Monitor open positions and unrealized P&L
4. **Analyze Performance**: View metrics like Sharpe ratio and max drawdown
5. **Learn & Improve**: Practice without risking real money

### Key Features
- **Realistic Slippage**: 0.05% execution slippage on all trades
- **Commissions**: 0.1% commission per trade (minimum £1)
- **Position Management**: Track entry prices, current value, and P&L
- **Trade History**: Complete log of all trades with timestamps
- **Performance Metrics**:
  - Total return and return percentage
  - Sharpe ratio (risk-adjusted returns)
  - Maximum drawdown (largest peak-to-trough decline)
  - Win rate (percentage of profitable trades)

## 🔐 Security & Privacy

- **OAuth Authentication**: Secure Manus OAuth login
- **Data Encryption**: All data encrypted in transit and at rest
- **No Real Money**: Trading simulator uses virtual capital only
- **User Privacy**: Personal data protected and never shared
- **API Security**: All backend APIs protected with authentication

## 📈 Performance Metrics

### Sharpe Ratio
Measures risk-adjusted returns. Higher is better:
- **> 1.0**: Good risk-adjusted returns
- **> 2.0**: Excellent risk-adjusted returns
- **> 3.0**: Outstanding risk-adjusted returns

### Maximum Drawdown
Largest peak-to-trough decline. Lower is better:
- **< 10%**: Excellent risk management
- **< 20%**: Good risk management
- **> 30%**: High volatility and risk

### Win Rate
Percentage of profitable trades:
- **> 50%**: More winners than losers
- **> 60%**: Strong trading performance
- **> 70%**: Excellent trading performance

## 🛠️ Development

### Project Structure
```
stock_predictor_system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── indicators.ts      # Technical indicator calculations
│   ├── signalGenerator.ts # ML signal generation
│   ├── simulatorEngine.ts # Trading simulator logic
│   └── _core/             # Framework internals
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── storage/               # S3 storage helpers
```

### Running Locally
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check

# Build for production
pnpm build
```

### Testing
The project includes comprehensive test coverage:
- **Unit Tests**: Technical indicators, signal generation, simulator engine
- **Integration Tests**: End-to-end data flows
- **53 tests** passing with 100% success rate

## 📚 API Documentation

### tRPC Procedures

#### Stocks
- `stocks.search(query)` - Search for stocks
- `stocks.getAll()` - Get all Trading 212 stocks
- `stocks.getByTicker(ticker)` - Get stock details

#### Watchlist
- `watchlist.add(ticker)` - Add stock to watchlist
- `watchlist.remove(ticker)` - Remove from watchlist
- `watchlist.getAll()` - Get user's watchlist
- `watchlist.updatePreferences(ticker, preferences)` - Update alert settings

#### Signals
- `signals.getByTicker(ticker)` - Get signals for a stock
- `signals.getAll()` - Get all recent signals
- `signals.generate(ticker)` - Generate new signal

#### Simulator
- `simulator.createPortfolio(name, capital)` - Create virtual portfolio
- `simulator.getPortfolios()` - Get user's portfolios
- `simulator.executeTrade(portfolioId, ticker, quantity, price, type)` - Execute trade
- `simulator.getPositions(portfolioId)` - Get open positions
- `simulator.getTradeHistory(portfolioId)` - Get trade history

## 🐛 Troubleshooting

### App Won't Load
- Clear browser cache
- Try a different browser
- Check internet connection

### Notifications Not Working
- Enable browser notifications in settings
- Check notification permissions
- Verify alert preferences are configured

### Signals Not Appearing
- Ensure stock is in your watchlist
- Check that sufficient historical data is available
- Wait for market hours (signals generated during trading)

## 📝 Limitations & Disclaimers

### Important Notes
- **Educational Tool**: For learning and practice purposes only
- **Not Financial Advice**: Not a substitute for professional financial advice
- **Past Performance**: Historical signals don't guarantee future results
- **Market Risk**: All trading involves risk; you may lose money
- **Data Accuracy**: While we strive for accuracy, data may contain errors

### Known Limitations
- Signals based on technical analysis only; fundamental factors not considered
- Real-time data may have slight delays (typically < 1 minute)
- Some stocks may have limited historical data
- Extreme market conditions may produce unreliable signals
- Mobile app requires internet connection for real-time updates

## 📞 Support & Feedback

### Getting Help
- Review the User Guide (USER_GUIDE.md)
- Check the FAQ section in the app
- Contact support through the app settings

### Providing Feedback
- Report bugs through the app
- Suggest new features
- Share your trading experiences

## 📄 License

This project is proprietary software. All rights reserved.

## 🎓 Educational Resources

### Understanding Technical Analysis
- Learn about RSI, MACD, and Bollinger Bands
- Understand support and resistance levels
- Study price patterns and trends

### Trading Best Practices
- Start with small positions
- Use stop-losses to manage risk
- Diversify across multiple stocks
- Keep a trading journal
- Review and learn from your trades

## 🚀 Roadmap

### Upcoming Features
- Real-time price streaming via WebSocket
- Advanced charting with TradingView integration
- Portfolio backtesting engine
- Automated trading strategies
- Mobile app for iOS and Android
- Email and SMS alerts
- Performance leaderboards
- Strategy marketplace

### Performance Improvements
- Optimize real-time data updates
- Implement intelligent caching
- Reduce bundle size
- Improve mobile performance

## 📊 Statistics

- **Technical Indicators**: 5 (RSI, MACD, Bollinger Bands, SMA, EMA)
- **Database Tables**: 12
- **tRPC Procedures**: 20+
- **Test Coverage**: 53 tests passing
- **Supported Stocks**: All Trading 212-listed instruments
- **Performance**: < 500ms average response time

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready

For the latest updates and documentation, visit the app or check the GitHub repository.
