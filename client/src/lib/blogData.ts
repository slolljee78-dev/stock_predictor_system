export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: 'signals' | 'trading' | 'technical-analysis' | 'strategy' | 'education';
  readTime: number; // in minutes
  featured?: boolean;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding RSI: The Relative Strength Index Explained',
    slug: 'understanding-rsi-relative-strength-index',
    excerpt: 'Learn how the RSI indicator works and how to use it to identify overbought and oversold conditions in the market.',
    author: 'Stock Predictor Team',
    date: '2026-05-18',
    category: 'technical-analysis',
    readTime: 6,
    featured: true,
    tags: ['RSI', 'Technical Analysis', 'Indicators', 'Trading Signals'],
    content: `# Understanding RSI: The Relative Strength Index Explained

The Relative Strength Index (RSI) is one of the most popular technical indicators used by traders worldwide. It measures the magnitude of recent price changes to evaluate overbought or oversold conditions.

## What is RSI?

RSI is a momentum oscillator that measures the speed and magnitude of price changes. It oscillates between 0 and 100, with readings above 70 indicating overbought conditions and readings below 30 indicating oversold conditions.

## How RSI Works

RSI is calculated using the following formula:
- RSI = 100 - (100 / (1 + RS))
- Where RS = Average Gain / Average Loss over a 14-period timeframe

## Using RSI in Trading

1. **Overbought Signals**: When RSI > 70, the asset may be overbought and due for a pullback
2. **Oversold Signals**: When RSI < 30, the asset may be oversold and due for a bounce
3. **Divergence**: When price makes a new high but RSI doesn't, it can signal weakness

## Stock Predictor and RSI

Stock Predictor uses RSI as one of four key technical indicators to generate trading signals. When RSI aligns with other indicators (MACD, Bollinger Bands, SMA), it increases the confidence score of the signal.

## Key Takeaways

- RSI is best used in ranging markets, not strong trends
- Combine RSI with other indicators for better accuracy
- Extreme readings (>80 or <20) can signal stronger moves
- Use RSI to time entries and exits, not as a standalone signal`,
  },
  {
    id: '2',
    title: 'MACD Trading Strategy: How to Use Moving Average Convergence Divergence',
    slug: 'macd-trading-strategy',
    excerpt: 'Master the MACD indicator and learn how to use it to identify trend changes and momentum shifts.',
    author: 'Stock Predictor Team',
    date: '2026-05-17',
    category: 'technical-analysis',
    readTime: 8,
    featured: true,
    tags: ['MACD', 'Technical Analysis', 'Momentum', 'Trading Signals'],
    content: `# MACD Trading Strategy: How to Use Moving Average Convergence Divergence

MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator that shows the relationship between two moving averages.

## MACD Components

1. **MACD Line**: 12-period EMA minus 26-period EMA
2. **Signal Line**: 9-period EMA of the MACD line
3. **Histogram**: Difference between MACD and Signal line

## Trading Signals

- **Bullish Signal**: MACD crosses above the signal line
- **Bearish Signal**: MACD crosses below the signal line
- **Momentum**: Histogram shows strength of the move

## Using MACD with Stock Predictor

Stock Predictor combines MACD with RSI, Bollinger Bands, and SMA to create high-confidence trading signals. When MACD confirms other indicators, the signal confidence increases significantly.

## Best Practices

- Use MACD on daily or weekly charts for swing trading
- Combine with support/resistance levels
- Watch for divergences between price and MACD
- Use in trending markets for best results`,
  },
  {
    id: '3',
    title: 'Bollinger Bands: A Complete Guide to Volatility Trading',
    slug: 'bollinger-bands-volatility-trading',
    excerpt: 'Discover how to use Bollinger Bands to identify volatility levels and find trading opportunities.',
    author: 'Stock Predictor Team',
    date: '2026-05-16',
    category: 'technical-analysis',
    readTime: 7,
    featured: true,
    tags: ['Bollinger Bands', 'Volatility', 'Technical Analysis', 'Trading'],
    content: `# Bollinger Bands: A Complete Guide to Volatility Trading

Bollinger Bands are a volatility indicator that consists of three lines: a middle band (SMA) and upper/lower bands (standard deviations).

## Understanding Bollinger Bands

- **Middle Band**: 20-period Simple Moving Average
- **Upper Band**: Middle band + 2 standard deviations
- **Lower Band**: Middle band - 2 standard deviations

## Trading Signals

- **Overbought**: Price touches upper band
- **Oversold**: Price touches lower band
- **Squeeze**: Bands narrow, indicating low volatility
- **Expansion**: Bands widen, indicating high volatility

## Bollinger Bands in Stock Predictor

Stock Predictor uses Bollinger Bands to identify extreme price conditions. When price reaches the upper or lower band and other indicators confirm, it generates high-confidence trading signals.

## Trading Strategies

1. **Mean Reversion**: Buy when price touches lower band, sell at middle band
2. **Breakout**: Trade breakouts when bands expand
3. **Squeeze Play**: Prepare for breakout when bands squeeze`,
  },
  {
    id: '4',
    title: 'Simple Moving Average (SMA): The Foundation of Trend Trading',
    slug: 'simple-moving-average-sma-trend-trading',
    excerpt: 'Learn how to use the Simple Moving Average to identify trends and trade in the direction of the trend.',
    author: 'Stock Predictor Team',
    date: '2026-05-15',
    category: 'technical-analysis',
    readTime: 5,
    featured: false,
    tags: ['SMA', 'Moving Averages', 'Trends', 'Technical Analysis'],
    content: `# Simple Moving Average (SMA): The Foundation of Trend Trading

The Simple Moving Average (SMA) is the most basic moving average, calculated by taking the average price over a specific number of periods.

## How SMA Works

- **Calculation**: Sum of prices / Number of periods
- **Common Periods**: 20 (short-term), 50 (medium-term), 200 (long-term)
- **Smoothing**: Removes noise from price data

## Trading with SMA

- **Uptrend**: Price above SMA
- **Downtrend**: Price below SMA
- **Support/Resistance**: SMA acts as dynamic support/resistance
- **Crossovers**: When price crosses SMA, it signals trend change

## Stock Predictor's Use of SMA

Stock Predictor uses SMA to confirm trend direction. When price is above SMA and other indicators are bullish, it generates buy signals. When price is below SMA and other indicators are bearish, it generates sell signals.

## Best Practices

- Use multiple SMAs for confirmation
- Combine with other indicators
- Use on daily charts for swing trading
- Remember: SMA lags price action`,
  },
  {
    id: '5',
    title: 'What Are Trading Signals? A Beginner\'s Guide',
    slug: 'what-are-trading-signals-beginners-guide',
    excerpt: 'Understand what trading signals are, how they work, and how to use them to improve your trading decisions.',
    author: 'Stock Predictor Team',
    date: '2026-05-14',
    category: 'education',
    readTime: 5,
    featured: true,
    tags: ['Trading Signals', 'Beginner', 'Education', 'Technical Analysis'],
    content: `# What Are Trading Signals? A Beginner's Guide

Trading signals are recommendations to buy, sell, or hold a security based on technical analysis or other data.

## Types of Trading Signals

1. **Buy Signals**: Indicators suggest it's time to enter a long position
2. **Sell Signals**: Indicators suggest it's time to exit or enter a short position
3. **Hold Signals**: Indicators suggest maintaining current position

## How Trading Signals Work

Trading signals are generated by analyzing:
- Technical indicators (RSI, MACD, Bollinger Bands, SMA)
- Price action and patterns
- Volume and momentum
- Market sentiment

## Stock Predictor's Signal Generation

Stock Predictor generates signals by analyzing four key technical indicators:
1. RSI (Relative Strength Index)
2. MACD (Moving Average Convergence Divergence)
3. Bollinger Bands
4. SMA (Simple Moving Average)

When multiple indicators align, the signal confidence increases.

## Important Disclaimer

Trading signals are not guaranteed to be profitable. Past performance does not guarantee future results. Always do your own research and manage risk carefully.`,
  },
  {
    id: '6',
    title: 'Swing Trading vs Day Trading: Which Strategy Is Right for You?',
    slug: 'swing-trading-vs-day-trading',
    excerpt: 'Compare swing trading and day trading strategies to find the approach that fits your trading style.',
    author: 'Stock Predictor Team',
    date: '2026-05-13',
    category: 'strategy',
    readTime: 7,
    featured: false,
    tags: ['Swing Trading', 'Day Trading', 'Strategy', 'Trading Styles'],
    content: `# Swing Trading vs Day Trading: Which Strategy Is Right for You?

Swing trading and day trading are two popular short-term trading strategies. Here's how they compare.

## Swing Trading

- **Timeframe**: 3-5 days to weeks
- **Holding Period**: Overnight positions allowed
- **Indicators**: Technical analysis, trend following
- **Time Commitment**: 1-2 hours per day
- **Advantages**: Less stressful, better for working professionals
- **Disadvantages**: Overnight gaps, less frequent trades

## Day Trading

- **Timeframe**: Minutes to hours
- **Holding Period**: No overnight positions
- **Indicators**: Intraday charts, momentum indicators
- **Time Commitment**: 6+ hours per day
- **Advantages**: No overnight risk, quick profits
- **Disadvantages**: High stress, requires constant monitoring

## Stock Predictor and Swing Trading

Stock Predictor's signals are optimized for swing trading using daily technical analysis. The signals are designed to capture 3-5 day moves, not intraday price action.

## Choosing Your Strategy

Consider:
- Your available time
- Risk tolerance
- Trading capital
- Personality and stress tolerance
- Market conditions

Stock Predictor works best for swing traders who want to automate signal generation and test strategies with paper trading.`,
  },
  {
    id: '7',
    title: 'How to Use Stock Predictor for Paper Trading: A Step-by-Step Guide',
    slug: 'how-to-use-stock-predictor-paper-trading',
    excerpt: 'Learn how to use Stock Predictor\'s paper trading simulator to test strategies and build trading skills.',
    author: 'Stock Predictor Team',
    date: '2026-05-12',
    category: 'education',
    readTime: 8,
    featured: true,
    tags: ['Paper Trading', 'Simulator', 'Stock Predictor', 'Tutorial'],
    content: `# How to Use Stock Predictor for Paper Trading: A Step-by-Step Guide

Paper trading (virtual trading) is the best way to learn trading without risking real money. Here's how to use Stock Predictor's simulator.

## Step 1: Create a Portfolio

1. Go to Trading Simulator
2. Click "Create Portfolio"
3. Set initial capital ($10,000 recommended for beginners)
4. Name your portfolio

## Step 2: Add Stocks

1. Search for stocks you want to trade
2. View the latest signals and technical analysis
3. Add to your watchlist

## Step 3: Place Trades

1. Select a stock from your watchlist
2. Enter quantity
3. Choose order type (market, limit, stop-loss)
4. Execute the trade

## Step 4: Monitor Performance

1. Track your portfolio value
2. Review trade history
3. Calculate win rate and return percentage
4. Identify patterns in your trading

## Step 5: Test Strategies

1. Try different entry and exit rules
2. Test different stock sectors
3. Experiment with position sizing
4. Refine your approach

## Tips for Success

- Start with stocks you know
- Follow your trading plan
- Keep detailed notes
- Review trades regularly
- Learn from losses
- Don't overtrade

## Moving to Real Trading

Once you're consistently profitable in the simulator:
1. Start with small real positions
2. Use the same strategy
3. Manage risk carefully
4. Keep emotions in check`,
  },
  {
    id: '8',
    title: 'Technical Analysis for Beginners: The Complete Guide',
    slug: 'technical-analysis-beginners-complete-guide',
    excerpt: 'Master the fundamentals of technical analysis and start making better trading decisions.',
    author: 'Stock Predictor Team',
    date: '2026-05-11',
    category: 'education',
    readTime: 10,
    featured: true,
    tags: ['Technical Analysis', 'Beginner', 'Fundamentals', 'Education'],
    content: `# Technical Analysis for Beginners: The Complete Guide

Technical analysis is the study of price action to predict future market movements. Here's everything you need to know.

## Core Principles

1. **Price Discounts Everything**: All information is reflected in price
2. **History Repeats**: Price patterns repeat over time
3. **Trends Exist**: Markets move in trends, not randomly

## Key Concepts

### Support and Resistance
- **Support**: Price level where buyers step in
- **Resistance**: Price level where sellers step in

### Trends
- **Uptrend**: Higher highs and higher lows
- **Downtrend**: Lower highs and lower lows
- **Sideways**: Ranging between support and resistance

### Volume
- **Increasing Volume**: Confirms price moves
- **Decreasing Volume**: Suggests weakness

## Technical Indicators

Stock Predictor uses four main indicators:
1. **RSI**: Momentum oscillator (0-100)
2. **MACD**: Trend-following momentum indicator
3. **Bollinger Bands**: Volatility indicator
4. **SMA**: Trend direction indicator

## Chart Patterns

- **Head and Shoulders**: Reversal pattern
- **Double Top/Bottom**: Reversal pattern
- **Triangles**: Continuation pattern
- **Flags and Pennants**: Continuation patterns

## Getting Started

1. Learn the basics (support, resistance, trends)
2. Study technical indicators
3. Practice on paper trading
4. Develop your own trading plan
5. Start trading with small positions

## Important Reminder

Technical analysis is not foolproof. Combine with:
- Fundamental analysis
- Risk management
- Trading discipline
- Continuous learning`,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter(post => post.featured).slice(0, 3);
}

export function getPostsByCategory(category: BlogPost['category']): BlogPost[] {
  return BLOG_POSTS.filter(post => post.category === category).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostsByTag(tag: string): BlogPost[] {
  return BLOG_POSTS.filter(post => post.tags.includes(tag)).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllCategories(): BlogPost['category'][] {
  const categories = new Set(BLOG_POSTS.map(post => post.category));
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  BLOG_POSTS.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}
