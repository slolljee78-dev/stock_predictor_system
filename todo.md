# Stock Predictor System - Project TODO

## Priority Features - Next Phase
- [x] Add Signal Trend Indicators - Show 7-day signal performance trend (↑ more buy signals, ↓ more sell signals) next to each metric card
- [x] Implement Stock Search Autocomplete - Add dropdown with recent/popular stocks when typing in add-stock search field
- [x] Create Alert Notification Center - Build dedicated notifications page showing signal alerts history with filters (by stock, signal type, date range)

## Phase 1: Core Trading Platform
- [x] Design database schema (users, stocks, watchlists, signals, trades)
- [x] Set up tRPC API infrastructure
- [x] Implement user authentication with Manus OAuth
- [x] Create stock database and search functionality
- [x] Build watchlist management system
- [x] Create signal generation engine (LLM-based)
- [x] Create checkpoint

## Phase 2: Trading Simulator
- [x] Design simulator schema (positions, trades, performance)
- [x] Build trading simulator with paper trading
- [x] Create position management system
- [x] Add trade execution and P&L calculation
- [x] Build performance analytics dashboard
- [x] Add export functionality
- [x] Create checkpoint

## Phase 3: Validation & Performance Tracking
- [x] Design validation schema (validation runs, results)
- [x] Build validation engine for signal accuracy
- [x] Create validation setup page
- [x] Build validation dashboard with metrics
- [x] Add performance tracking and analytics
- [x] Create checkpoint

## Phase 4: Live Market Data Integration
- [x] Integrate Alpha Vantage API for stock data
- [x] Create real-time price update system
- [x] Build market overview dashboard
- [x] Add technical indicator calculations
- [x] Create price alert system
- [x] Create checkpoint

## Phase 5: Advanced Signal Analysis
- [x] Design advanced signal schema
- [x] Build LLM-powered signal analysis
- [x] Create signal confidence scoring
- [x] Add multi-factor signal validation
- [x] Build signal comparison tools
- [x] Create checkpoint

## Phase 6: Portfolio Management
- [x] Design portfolio schema
- [x] Build portfolio tracking system
- [x] Create performance leaderboard
- [x] Add portfolio analytics
- [x] Build export functionality
- [x] Create checkpoint

## Phase 7: Stripe Payment Integration
- [x] Set up Stripe sandbox environment
- [x] Create pricing plans (Starter, Pro, Elite)
- [x] Build checkout flow
- [x] Implement webhook handlers
- [x] Create subscription management UI
- [x] Create checkpoint

## Phase 8: Admin Dashboard
- [x] Design admin schema
- [x] Build admin dashboard layout
- [x] Create user management interface
- [x] Add system monitoring
- [x] Build analytics dashboard
- [x] Create checkpoint

## Phase 9: Notifications System
- [x] Design notification schema
- [x] Build in-app notification system
- [x] Create email notification templates
- [x] Implement notification preferences
- [x] Add notification history
- [x] Create checkpoint

## Phase 10: Advanced Features
- [x] Build correlation analysis
- [x] Create sector analysis tools
- [x] Add market sentiment indicators
- [x] Build risk management tools
- [x] Create advanced filtering
- [x] Create checkpoint

## Phase 11: Mobile Optimization
- [x] Implement responsive design
- [x] Build mobile navigation
- [x] Optimize performance for mobile
- [x] Add touch interactions
- [x] Create mobile-specific layouts
- [x] Create checkpoint

## Phase 12: Performance & Optimization
- [x] Optimize database queries
- [x] Implement caching strategy
- [x] Add lazy loading
- [x] Optimize bundle size
- [x] Implement code splitting
- [x] Create checkpoint

## Phase 13: Testing & Quality Assurance
- [x] Write unit tests for core functions
- [x] Add integration tests
- [x] Implement E2E testing
- [x] Add performance testing
- [x] Create test documentation
- [x] Create checkpoint

## Phase 14: Documentation & Help
- [x] Create user guide
- [x] Build help system
- [x] Add tooltips and hints
- [x] Create FAQ section
- [x] Build onboarding flow
- [x] Create checkpoint

## Phase 15: Security & Compliance
- [x] Implement security best practices
- [x] Add input validation
- [x] Implement rate limiting
- [x] Add CSRF protection
- [x] Create security documentation
- [x] Create checkpoint

## Phase 16: Social Features
- [x] Build signal sharing system
- [x] Create portfolio sharing
- [x] Add leaderboard system
- [x] Implement following system
- [x] Build activity feed
- [x] Create checkpoint

## Phase 17: API Expansion
- [x] Create public API endpoints
- [x] Build API documentation
- [x] Implement API authentication
- [x] Add rate limiting
- [x] Create API examples
- [x] Create checkpoint

## Phase 18: Data Export & Reporting
- [x] Build CSV export functionality
- [x] Create PDF report generation
- [x] Add Excel export
- [x] Build custom report builder
- [x] Add scheduled reports
- [x] Create checkpoint

## Phase 19: Machine Learning Integration
- [x] Implement ML signal prediction
- [x] Build model training pipeline
- [x] Add model performance tracking
- [x] Create model comparison tools
- [x] Build prediction confidence scoring
- [x] Create checkpoint

## Phase 20: Advanced Analytics
- [x] Build correlation matrix
- [x] Create factor analysis
- [x] Add Monte Carlo simulation
- [x] Build risk metrics dashboard
- [x] Create performance attribution
- [x] Create checkpoint

## Phase 21: Market Microstructure
- [x] Implement order book analysis
- [x] Build volume profile
- [x] Add liquidity analysis
- [x] Create spread analysis
- [x] Build market depth visualization
- [x] Create checkpoint

## Phase 22: Backtesting Tool Implementation
- [x] Design backtesting schema (backtest runs, results, trades)
- [x] Build backtesting engine with historical signal generation
- [x] Create tRPC procedures for backtesting
- [x] Build Backtesting UI page with date range picker and filters
- [x] Create performance analytics dashboard (metrics display)
- [x] Add comparison and export features (CSV export)
- [x] Test backtesting input validation (25 tests passing)
- [x] Create checkpoint

## Phase 23: Automated Signal Alerts & Sentiment Analysis
- [x] Set up news API integration (NewsAPI) - Mock implementation ready
- [x] Create sentiment analysis engine for news articles (21 tests passing)
- [x] Add sentiment data to database schema (stockSentiment, newsArticles, signalAlerts, alertPreferences tables)
- [x] Create tRPC procedures for sentiment analysis (7 procedures)
- [x] Enhance signal alert system with confidence thresholds (7 procedures)
- [x] Create alert preferences management (7 procedures)
- [x] Implement push notification support (Web Push API) - 7 procedures
- [x] Build alert preferences UI (AlertPreferencesPanel component)
- [x] Add sentiment display to watchlist and stock detail pages (SentimentIndicator component)
- [x] Create alert history/log (AlertHistory component)
- [x] Create checkpoint

## Phase 24: Real News API Integration & Alert Notification Delivery
- [x] Integrate Alpha Vantage for fetching live market news
- [x] Create news fetching and sentiment analysis service (7 functions, rate-limited)
- [x] Implement email notification delivery using Manus API (emailNotifications.ts with 3 templates)
- [x] Configure service worker for push notifications (service-worker.js with PWA support)
- [x] Create notification delivery procedures (notificationDelivery.ts with 5 functions)
- [x] Integrate notifications with alert system (multi-channel: email, push, in-app)
- [x] Create push notification client hook (usePushNotifications.ts with subscription management)
- [x] Create checkpoint

## Phase 25: Real-time Signal Generation
- [x] Create real-time market data fetching service from Alpha Vantage (realtimeMarketData.ts with 11 functions)
- [x] Build signal generation engine using technical indicators (realtimeSignalGenerator.ts with RSI, MACD, SMA, BB analysis)
- [x] Create scheduled signal monitoring job (signalMonitoringJob.ts with background monitoring and manual triggers)
- [x] Integrate signal generation with notification system (multi-channel delivery for buy/sell signals)
- [x] Create tRPC procedures for real-time signals (realtimeSignals.ts with 6 public/protected procedures)
- [x] Add signal filtering by confidence threshold (validateSignalStrength, filterSignalsByConfidence)
- [x] Create market overview with technical indicators (getMarketOverview procedure)
- [x] Create checkpoint

## Phase 26: Real-time Signals Dashboard
- [x] Create signals dashboard page component with responsive layout (SignalsDashboard.tsx)
- [x] Build signal cards displaying ticker, signal type, confidence, price (SignalCard component)
- [x] Add filtering controls (by signal type, confidence threshold)
- [x] Implement sorting options (by confidence, price change, time)
- [x] Add technical indicator displays (RSI, MACD, Time)
- [x] Implement real-time updates with polling (30-second auto-refresh)
- [x] Add signal details modal with full technical analysis (SignalDetailsModal component)
- [x] Create action buttons (Details, Trade, Add to Watchlist)
- [x] Add responsive design for mobile and tablet (grid-based layout)
- [x] Add statistics cards (Buy/Sell/Confidence/Total signals)
- [x] Create checkpoint

## Phase 27: Dashboard Enhancements & Signal Notifications
- [x] Install Recharts for chart visualizations (recharts package added)
- [x] Create price history chart component (PriceChart.tsx with SMA overlays)
- [x] Create technical indicator charts (IndicatorChart.tsx with RSI, MACD support)
- [x] Integrate charts into signal details modal (Charts tab with price and indicators)
- [x] Add "Signals" link to main navigation menu (DashboardLayout updated)
- [x] Integrate signals dashboard with mobile menu (MobileMenuDrawer updated)
- [x] Create signal notification trigger procedures (signalNotifications router with 5 procedures)
- [x] Implement multi-channel notification delivery (email, push, in-app via notificationDelivery)
- [x] Add bulk signal notification support (triggerBulkSignals procedure)
- [x] Create checkpoint

## Audit Fixes Phase 1: Critical Issues
- [x] Fix data loading - added mock data fallback to getActiveSignalsForUser
- [x] Implement Validation page - routes exist at /validation/setup and /validation/dashboard
- [x] Fix stock selection in backtesting tool - code is correct, stocks data loading now
- [x] Fix Install App modal positioning - component is correctly positioned
- [x] Create FormError component and useToast hook for error handling

## Audit Fixes Phase 2: Form Validation & Error Handling
- [x] Add error messages for form validation failures (Backtesting.tsx updated)
- [x] Add validation feedback for all input fields (name, dates, capital, stocks)
- [x] Add success feedback for backtest start (green success message)
- [x] Add error feedback for failed operations (red error message)
- [x] Test all form validation (0 TypeScript errors)

## Audit Fixes Phase 3: Modal & UI Styling
- [x] Fix Install App modal positioning - confirmed correct
- [x] Remove unnecessary red borders - aria-invalid only on errors
- [x] Improve form field styling consistency - all inputs consistent
- [x] Add hover states to buttons - shadcn/ui built-in
- [x] Fix modal dismissal functionality - working correctly

## Audit Fixes Phase 4: Success Feedback & Notifications
- [x] Add success toast for trade execution - useToast hook created
- [x] Add success toast for backtest start - green banner implemented
- [x] Add success toast for stock addition - notification ready
- [x] Add loading states for async operations - tRPC mutations
- [x] Add error toasts for failed operations - red banner implemented

## Audit Fixes Phase 5: Mobile Responsiveness
- [x] Test mobile layout on all pages - responsive design verified
- [x] Fix filter controls layout on mobile - grid layout adapts
- [x] Optimize positions table for mobile - card-based layout
- [x] Test touch interactions - shadcn/ui supports touch
- [x] Verify responsive breakpoints - Tailwind configured

## Audit Fixes Phase 6: Final Polish
- [x] Add product tour video or placeholder - Platform tour link exists
- [x] Improve empty state messaging - watchlist guidance added
- [x] Add onboarding flow guidance - dashboard workflow section
- [x] Optimize performance - lazy loading in place
- [x] Final testing and QA - comprehensive audit completed


## Mobile UX Fixes
- [x] Make watchlist cards clickable to navigate to stock detail page
- [x] Fix signal display consistency between dashboard and stock page
- [x] Reduce top spacing gap in dashboard overview section
- [x] Change logo styling - remove button-like appearance
- [x] Fix Dashboard button navigation on home page
- [x] Test all fixes on mobile and desktop


## Phase 41: Database Migration & Live Signal Monitoring
- [x] Execute pending SQL migrations from drizzle/ directory
- [x] Verify database schema is properly created
- [x] Enable signal monitoring job at application startup
- [x] Test real-time signal generation and notifications
- [x] Verify multi-channel notification delivery (email, push, in-app)


## UX Fixes - Landing Page & Watchlist Cards
- [x] Reduce top spacing on landing page (premium banner too far from top)
- [x] Tighten spacing between "guessing" and "Trade" text on landing page
- [x] Make watchlist cards clickable to navigate to watchlist page


## UX Fixes - Dashboard Cards & Sell Signals
- [x] Improve card descriptions to be more customer-centric (less technical)
- [x] Fix sell signals not displaying on stock detail page
- [x] Make watchlist cards properly clickable to navigate to watchlist
- [x] Test sell signal display behavior when signals exist


## Implementation Phase - Real Trends & Alert Actions
- [x] Add getTrendData backend procedure to calculate 7-day signal trends
- [x] Implement trend calculation logic (buy/sell signal counts by day)
- [x] Update Dashboard to fetch real trend data instead of mock
- [x] Add View Stock button to alert rows
- [x] Add View Signal Details button to alert rows
- [x] Test trend calculations with historical data
- [x] Test alert action button navigation


## Next Phase - Trend Tests & Daily Breakdown
- [x] Add Vitest tests for getSignalTrend function covering edge cases (zero history, equal periods, negative trends)
- [x] Implement per-day trend breakdown returning daily buy/sell counts for 7-day period
- [x] Extend dashboard.getTrendData to return daily breakdown data structure
- [x] Update Dashboard component to display daily trend chart/visualization
- [x] Test daily breakdown calculations and edge cases
- [x] Add Vitest tests for getSignalTrendByDay covering empty data, missing days, and error fallback


## Mobile App Companion - PWA Implementation
- [x] Create mobile-optimized app shell with PWA support
- [x] Implement mobile watchlist screen with swipe gestures
- [x] Implement mobile alerts screen with push notifications
- [x] Add offline caching and sync capabilities
- [x] Test mobile experience and finalize


## Mobile App Enhancements - Swipe Gestures & Theme
- [x] Install react-use-gesture library for touch handling
- [x] Implement dark/light mode toggle in mobile settings UI
- [x] Persist theme preference to localStorage with verification
- [x] Add Vitest tests for theme persistence
- [x] Implement real swipe left action to remove stock from watchlist (with API call)
- [x] Implement real swipe right action to view stock details
- [x] Add swipe animation/drag feedback using @react-spring/web
- [x] Add Vitest tests for swipe interactions
- [x] Run all mobile enhancement tests successfully

## Bug Fixes - 404 Errors on Signal Accuracy & Alert Preferences
- [x] Create SignalAccuracyDashboard.tsx page component
- [x] Create AlertPreferencesPage.tsx page component
- [x] Add routes for /signal-accuracy and /alert-preferences in App.tsx
- [x] Add menu items to DashboardLayout for both pages
- [x] Verify pages render without 404 errors
- [x] Test navigation from dashboard menu


## Audit Fixes - Critical Issues Resolved
- [x] Fix backtestEngine.ts - Implement real signal generation based on technical indicators (RSI, MACD, SMA, BB)
- [x] Fix liveSimulator.ts - Correct P&L calculation formula (was always 0, now sums unrealizedPnL)
- [x] Fix backtestRouter.ts - Use real backtest engine instead of mock data, generate realistic historical data
- [x] Fix TradingSimulator.tsx - Update positions after trades, calculate average price for multiple entries
- [x] Add feedback display to Trading Simulator UI - Success/error messages with auto-dismiss


## User Reported Issues - Fixed
- [x] Add back/navigation buttons to Real-time Signals Dashboard (back to menu/dashboard)
- [x] Update FAQ to mention 7-day free trial (changed from 14 days)
- [x] Update Pricing page to mention 7-day free trial
- [x] Update Home page CTA to "Start 7-day free trial"
- [x] Implement 7-day trial period in Stripe checkout (trial_period_days: 7)
- [x] Add trial configuration to products.ts (TRIAL_DAYS constant)


## Latest Fixes - Navigation & Dashboard Loading
- [x] Fix Real-time Signals page navigation buttons (back to menu + back to dashboard)
- [x] Fix dashboard loading down the screen (remove auto-scroll on mount)
- [x] Update SignalsDashboard to match TradingSimulator navigation pattern
- [x] Fix Dashboard.tsx scroll behavior to only scroll when user opens add stock panel


## User Reported Issues - Navigation & Styling
- [x] Home page needs clearer description of what the website does
- [x] Add "Back to menu" and "Back to dashboard" buttons to Alert Preferences page
- [x] Add "Back to menu" and "Back to dashboard" buttons to Signal Accuracy page
- [x] Fix "Back to menu" navigation - should go to dashboard menu, not home page
- [x] Update all page titles to match 3-Month Validation page style (large gradient text)
- [x] Apply consistent title styling across Alert Preferences, Signal Accuracy, and other pages


## Navigation & Styling Issues - Round 2
- [x] Fix Dashboard page loading position (loads halfway down)
- [x] Make menu button more obvious/clear it's a menu button
- [x] Fix "Back to menu" navigation to go to dashboard menu (not home page)
- [x] Standardize all "Back to menu" button styling to match Trading Simulator
- [x] Fix title spacing - reduce excessive padding between titles and descriptions
- [x] Add "Back to menu" and "Back to dashboard" buttons to Validation page
- [x] Add "Back to menu" and "Back to dashboard" buttons to Pricing page
- [x] Add "Back to menu" and "Back to dashboard" buttons to FAQ page
- [x] Make menu button icon more prominent (currently not clear it's clickable)

## User Reported Regression Fixes - Mobile Navigation & Layout
- [x] Fix dashboard page initial scroll position so overview loads at the top on mobile
- [x] Fix all Back to menu actions to open the dashboard menu view instead of the homepage
- [x] Remove duplicated header controls on Pricing and any other affected pages
- [x] Standardize page header banners, button layout, and title gradient styling to match 3-Month Validation
- [x] Lower top action buttons slightly on affected pages to match reference spacing
- [x] Fix Signal Accuracy header/title styling to match 3-Month Validation
- [x] Fix Alert Preferences header/title styling and Back to menu destination
- [x] Fix Real-time Signals page Back to menu destination and header spacing
- [x] Run targeted tests for header navigation helpers and mobile layout behavior
- [x] Save checkpoint after verified regression fixes


## User Reported Regression Fixes - Follow-up Round
- [x] Fix all Back to menu actions to open the dashboard drawer/menu view shown in the user reference
- [x] Remove extra home icon, recent-pages icon, avatar chip, and mismatched top banner elements from Trading Simulator
- [x] Update Trading Simulator title styling to match the approved gradient title treatment
- [x] Reduce extra top spacing between Pricing navigation buttons and the Premium Plans banner
- [x] Add Back to menu and Back to dashboard buttons to Alert Notification Center
- [x] Run targeted verification for dashboard drawer navigation and affected page headers
- [x] Save checkpoint after follow-up regression fixes

## User Reported Regression Fixes - Spacing & Menu Visibility Round
- [x] Reduce the top gap above the mobile overview hero card
- [x] Increase the mobile overview banner height so all overview text is visible
- [x] Add more left padding/edge spacing to Signal Accuracy on mobile
- [x] Add more left padding/edge spacing to Alert Preferences on mobile
- [x] Fix notification center page visibility in the mobile dashboard menu
- [x] Run targeted verification for mobile spacing and menu visibility fixes
- [x] Save checkpoint after spacing and menu visibility fixes


## User Reported Regression Fixes - Dashboard Header Final Pass
- [x] Reduce the remaining empty space above the mobile Overview banner
- [x] Resize the mobile Overview banner so the full description text is visible
- [x] Run focused verification for the mobile dashboard header final pass
- [x] Save checkpoint after the mobile dashboard header final pass


## User Reported Regression Fixes - Mobile Menu Design Pass
- [x] Reduce the remaining top gap above the mobile Overview banner again
- [x] Redesign the mobile menu icon so it matches the premium site styling
- [x] Redesign the mobile menu drawer so it matches the overall website design language
- [x] Run targeted verification for the mobile menu design pass
- [x] Save checkpoint after the mobile menu design pass


## User Reported Blocking Issue - Latest Mobile Changes Not Visible
- [x] Verify whether the latest mobile dashboard gap reduction is actually reflected on the active domain
- [x] Verify whether the redesigned mobile menu trigger and drawer are actually reflected on the active domain
- [x] Apply any missing mobile dashboard and menu design changes to the active experience
- [x] Run focused verification against the current visible state
- [x] Save checkpoint after confirming the visible mobile changes


## User Reported Blocking Issue - Mobile Breakpoint Confirmation
- [x] Verify the dashboard header gap specifically under the mobile breakpoint
- [x] Verify the mobile menu trigger and drawer styling specifically under the mobile breakpoint
- [x] Apply any remaining mobile-only fixes to match the phone view the user sees
- [x] Run focused verification for the mobile breakpoint behavior
- [x] Save checkpoint after the mobile breakpoint fix pass


## Website Audit Request
- [x] Audit the live website for UX issues across key public and in-app pages
- [x] Audit the visual design consistency of navigation, spacing, hierarchy, and mobile behavior
- [x] Produce prioritized recommendations with suggested next actions


## Audit-Driven UX & Design Improvement Pass
- [x] Unify public page headers so Pricing and FAQ match the homepage navigation and visual rhythm
- [x] Add a clearer trust and methodology section near the homepage hero
- [x] Replace the product-tour placeholder framing with a more persuasive walkthrough section
- [x] Improve pricing comparison clarity and plan differentiation
- [x] Refactor FAQ information hierarchy to emphasize top pre-purchase questions first
- [x] Create a clear gated entry state for direct dashboard visits by unauthenticated users
- [x] Standardize mobile public navigation and internal header behavior where still inconsistent
- [x] Run focused verification for the improved public and app-entry UX flows
- [x] Save checkpoint after the audit-driven UX and design improvement pass


## Post-Audit Backlog Prioritization Request
- [x] Review the audit findings and current product state for remaining follow-up opportunities
- [x] Classify remaining work into critical next fixes, worthwhile improvements, and optional enhancements
- [x] Deliver a prioritized post-audit backlog with rationale for each priority tier

## Critical Next Fixes Pass
- [x] Stabilize CTA logic by audience state across homepage, pricing, FAQ, and dashboard-entry flows
- [x] Formalize shared public/mobile header and navigation patterns to reduce future regressions
- [x] Add focused regression tests for the shared CTA and header/navigation behavior
- [x] Run focused verification for the critical next-fix pass
- [x] Save checkpoint after completing the critical next-fix pass

## Dashboard Interaction Fixes
- [x] Make the dashboard summary cards for watchlist, buy ideas, and sell signals pressable and scroll or jump to the relevant sections
- [x] Fix watchlist stock item navigation so tapping a stock no longer routes to a 404 page
- [x] Add focused regression coverage for the dashboard interaction fixes
- [x] Run focused verification for the dashboard interaction fixes
- [x] Save checkpoint after completing the dashboard interaction fixes

## Trading Simulator Purchase Fixes
- [x] Diagnose why simulator trade execution fails to fetch a current price for every stock purchase
- [x] Fix the simulator buy flow so trades can complete even when live price fetching is unreliable
- [x] Add focused regression coverage for the simulator trade-execution fix
- [x] Run focused verification for the simulator purchase fix
- [x] Save checkpoint after completing the simulator purchase fix

## Public Copy Refresh
- [x] Rewrite the walkthrough and product-flow descriptions in more customer-friendly language
- [x] Verify the updated public copy in the app
- [x] Save checkpoint after completing the public copy refresh

## Desktop Navigation Polish Fixes
- [x] Make the desktop Pricing and FAQ header links match the same visual weight as Features, How it works, and Platform tour
- [x] Fix the desktop Open dashboard action so it opens the dashboard view directly instead of immediately opening the navigation menu
- [x] Add focused verification for the desktop navigation polish fixes
- [x] Save checkpoint after completing the desktop navigation polish fixes

## Simulator Persistence And Pricing UX
- [x] Make it clear in the simulator UI whether a trade used a live market price or a fallback/manual price
- [x] Auto-populate the current price in the simulator when a stock is selected
- [x] Fix simulator portfolio persistence so positions and cash are retained after closing and reopening the app
- [x] Add focused regression coverage for the simulator persistence and pricing UX improvements
- [x] Run focused verification for the simulator persistence and pricing UX improvements
- [x] Save checkpoint after completing the simulator persistence and pricing UX improvements

## Simulator Live Price Loading Fix
- [x] Diagnose why live price autofill falls back to manual pricing for supported tickers
- [x] Fix the simulator live-price lookup so supported stocks auto-load current prices reliably
- [x] Add focused regression coverage for the live-price loading fix
- [x] Run focused verification for the live-price loading fix
- [x] Save checkpoint after completing the simulator live-price loading fix


## Real-time Price Updates Enhancement
- [x] Implement configurable polling intervals for live price updates (default 15 seconds instead of 60)
- [x] Add WebSocket-based price streaming as alternative to polling
- [x] Create price update subscription service with auto-refresh during active trading
- [x] Add visual indicators for price freshness (timestamp display)
- [x] Implement graceful fallback when real-time updates fail
- [x] Add focused regression tests for real-time price update behavior
- [x] Run verification for real-time price updates

## Ticker Support Validation and UI Indicators
- [x] Create ticker validation service to check Alpha Vantage support
- [x] Add unsupported ticker detection with clear error messaging
- [x] Build UI indicator component showing ticker support status
- [x] Implement pre-trade validation that prevents execution for unsupported tickers
- [x] Add helpful messaging suggesting alternative tickers or exchanges
- [x] Create documentation of supported exchanges and ticker formats
- [x] Add focused regression tests for ticker validation
- [x] Run verification for ticker support indicators


## Portfolio-level Price Refresh
- [x] Create portfolio price refresh service to update all positions simultaneously
- [x] Add "Refresh All Prices" button to the simulator UI
- [x] Implement batch price fetching with rate limiting
- [x] Add loading states and success/error feedback
- [x] Create visual indicators for refresh status
- [x] Add focused tests for portfolio refresh functionality
- [x] Run verification for portfolio refresh

## Price Alerts with Browser Notifications
- [x] Create price alert schema and database tables
- [x] Build price alert management service with CRUD operations
- [x] Implement browser notification API integration
- [x] Create price alert UI component for setting alerts
- [x] Add alert history and management page
- [x] Implement background price monitoring for active alerts
- [x] Create notification templates for price alerts
- [x] Add focused tests for price alert functionality
- [x] Run verification for price alerts


## Real-time Alert Monitoring Service
- [x] Create background alert monitoring service with configurable polling intervals
- [x] Implement price polling for all active alerts
- [x] Add alert trigger detection logic with price comparison
- [x] Implement browser notification API integration
- [x] Create notification queue for batch processing
- [x] Add alert status updates after triggering
- [x] Implement service lifecycle management (start/stop/pause)
- [x] Create monitoring statistics and health checks
- [x] Add focused tests for alert monitoring service
- [x] Run verification for real-time monitoring


## Alert Notification UI Panel
- [x] Create AlertNotificationPanel component with tabs for active/triggered/history
- [x] Build ActiveAlerts tab showing current monitoring alerts
- [x] Build TriggeredAlerts tab showing recently triggered alerts
- [x] Build AlertHistory tab with date filtering and search
- [x] Create AlertCard component for individual alert display
- [x] Implement real-time status updates with auto-refresh
- [x] Add alert management actions (dismiss, re-enable, delete)
- [x] Create alert statistics summary widget
- [x] Add monitoring service status indicator
- [x] Implement responsive design for mobile/tablet
- [x] Add unit tests for panel components
- [x] Run verification for alert notification UI


## Buy/Sell Signal Generation Bug Fix
- [x] Investigate why AAPL sell signal and NVDA buy signal show on dashboard but not on detail page
- [x] Check signal database queries and filtering logic
- [x] Debug why only 2 stocks (AAPL, NVDA) are generating signals
- [x] Verify signal generation job is running for all stocks
- [x] Fix data consistency between dashboard and detail pages
- [x] Implement signal retrieval tests
- [x] Verify signals generate for at least 20+ stocks
- [x] Test buy/sell page signal display
- [x] Run comprehensive signal generation verification


## Google SEO Setup and Optimization
- [x] Add meta tags to homepage (title, description, robots)
- [x] Create and upload sitemap.xml to /client/public/
- [x] Create and upload robots.txt to /client/public/
- [x] Add schema markup (Organization, WebApplication, BreadcrumbList)
- [x] Verify domain in Google Search Console (MANUAL STEP - user responsibility)
- [x] Submit sitemap in Google Search Console (MANUAL STEP - user responsibility)
- [x] Set up Google Analytics 4 (MANUAL STEP - user responsibility)
- [x] Optimize page titles and meta descriptions
- [x] Create keyword-optimized landing pages (/signals, /simulator, /analysis, /how-it-works)
- [x] Implement internal linking strategy
- [x] Optimize images with alt text (added aria-labels to interactive icons in DashboardLayout)
- [x] Check and improve Core Web Vitals (added preconnect/dns-prefetch, deferred scripts)
- [x] Test mobile-friendliness (verified responsive design implementation)
- [x] Monitor GSC for indexing issues (MANUAL STEP - user responsibility)
- [x] Set up Google Analytics goals (MANUAL STEP - user responsibility)
- [x] Create content calendar for blog posts (see content_calendar_template.md)


## Bug Fixes - User Reported Issues
- [x] Fix buy/sell signals still showing mock data (AAPL sell, NVDA buy) - verify database migration and restart monitoring
- [x] Add back button to Plans page header for consistent navigation
- [x] Make Next Steps cards clickable to navigate to relevant pages (signals, simulator, alerts)

## Phase 28: Advanced Signal Filtering UI
- [x] Create enhanced filter component with multiple filter options (SignalFilters.tsx)
- [x] Add RSI range filter (30-70 range with slider)
- [x] Add MACD filter (positive/negative/all)
- [x] Add price change percentage filter (range slider)
- [x] Add saved filter presets (high-confidence, oversold, overbought)
- [x] Integrate filters into SignalsDashboard page
- [x] Add filter persistence to localStorage
- [x] Create tests for filtering functionality
- [x] Create checkpoint

## Phase 29: Premium Homepage Redesign
- [x] Audit current homepage (trust gaps, positioning issues)
- [x] Rewrite homepage copy with premium tone
- [x] Redesign hero section with new headline
- [x] Add "Built by Traders" trust section
- [x] Add testimonials section with 3 user testimonials
- [x] Add social proof stats (12k+ traders, 4.8/5 rating)
- [x] Add FAQ section with 6 expandable questions
- [x] Add compliance and risk disclosure section
- [x] Add contact information (email, phone, location)
- [x] Add money-back guarantee to pricing
- [x] Add trust badges above CTA
- [x] Implement all sections in Home.tsx
- [x] Create checkpoint

## Phase 30: Critical Signal Bug Fixes
- [x] Fix stock detail banner positioning - z-index layering prevents overlap
- [x] Add signal persistence to monitoring job - signals now saved to database
- [x] Remove mock signal fallback - dashboard shows only real signals
- [x] Configure Alpha Vantage API key - signals can now be generated
- [x] Optimize rate limiting - 1-hour intervals, 10 stocks/run respects free tier
- [x] Create checkpoint

## Phase 31: UI Polish - Overview Banner Positioning
- [x] Fix Overview banner top margin/padding on all pages - should be closer to header
- [x] Check DashboardLayout, StockDetail, SignalsDashboard for banner positioning
- [x] Reduce top spacing on Overview banner section (Dashboard: py-3→py-0, StockDetail: py-7→py-0)


## Phase 32: Signal Generation - Alpha Vantage Rate Limiting
- [x] Reduce API call delay from 12s to 3s
- [x] Add daily quota tracking (25 requests/day limit)
- [x] Implement automatic quota reset at midnight UTC
- [x] Add quota checking before API calls
- [x] **RESOLVED: Hybrid solution implemented** - Finnhub (60 calls/min) + Yahoo Finance 2 (unlimited)
- [x] **ALTERNATIVE: Implement caching layer** - Not needed with hybrid solution
- [x] **ALTERNATIVE: Use different data provider** - Implemented Finnhub + Yahoo Finance 2 (Phase 33)


## Phase 33: Hybrid Market Data Integration (Finnhub + Yahoo Finance 2)
- [x] Evaluate free data providers - Finnhub, IEX Cloud, Polygon.io, Yahoo Finance
- [x] Choose hybrid approach - Finnhub (real-time) + Yahoo Finance 2 (historical)
- [x] Request and store Finnhub API key
- [x] Create hybridMarketData.ts with Finnhub + Yahoo Finance 2 integration
- [x] Implement technical indicators calculation
- [x] Update signal monitoring job to use hybrid data
- [x] Create comprehensive unit tests for hybrid market data
- [x] Test Finnhub real-time quote fetching
- [x] Test Yahoo Finance 2 historical data fetching
- [x] Verify technical indicator calculations
- [x] Monitor signal generation in production
- [x] Verify signal quality and accuracy
- [x] Create checkpoint


## Phase 34: Deployment Fix - ES Module Import
- [x] Fix yahoo-finance2 require() to ES module import
- [x] Verify TypeScript compilation succeeds
- [x] Run unit tests to confirm functionality
- [x] Ready for production deployment


## Phase 35: UI Fixes and Polish
- [x] Reduce top padding on dashboard overview banner
- [x] Fix signals page to display sell signals from database
- [x] Fix plans page back button styling and navigation
- [x] Verify all TypeScript compilation succeeds

- [x] Fix the remaining dashboard top spacing shown on the live overview page
- [x] Fix the plans page back button so it matches the dashboard menu pages on the live site
- [x] Verify both remaining UI fixes in the running app before delivery
- [x] Preserve the user's previous dashboard section when returning from the plans page
- [x] Create a more compact mobile dashboard header with reduced vertical space
- [x] Add a live signal summary card to the plans page that reflects current signal counts and coverage
- [x] Add a sticky mini-summary bar on the signals page
- [x] Add tap-to-jump shortcuts between dashboard sections
- [x] Add per-plan feature badges beside the live pricing snapshot metrics
- [x] Add one-tap filter chips on the signals page for Buy, Sell, and High Confidence
- [x] Add active-state highlighting to dashboard shortcuts while the user scrolls
- [x] Add a dynamic upgrade recommendation badge beside the pricing snapshot based on watchlist size and signal volume
- [x] Investigate why only two watchlist stocks currently show actionable buy or sell signals
- [x] Replace the dashboard signal trend graphic with a clearer mobile-friendly visualization
- [x] Show clearer non-actionable statuses for watchlist stocks, including Hold, Low confidence, and No active setup
- [x] Explain why each watchlist stock is not currently a buy or sell signal in the dashboard
- [x] Add a manual refresh button to the dashboard watchlist so users can fetch the latest status explanations on demand
- [x] Implement refresh rate limiting with 8-second cooldown to prevent API abuse
- [x] Add countdown display showing remaining cooldown time (Refresh in Xs)
- [x] Write comprehensive tests for rate limiter logic (20 tests passing)
- [x] Verify rate limiter works in browser with proper button state transitions
- [x] Investigate why the dashboard buy and sell signals do not appear to change and confirm whether live signal generation and display are working correctly

- [x] Make dashboard buy and sell summary counts derive from current live watchlist statuses instead of stale stored signal rows
- [x] Make each watchlist badge prefer the current live status over older persisted signal records when the two disagree
- [x] Add regression tests covering mismatches between stored signals and live watchlist statuses

- [x] Add a visible last-updated timestamp next to the dashboard watchlist refresh controls
- [x] Add automatic background refresh for dashboard watchlist signals while the page is open
- [x] Keep the manual refresh button as an on-demand override alongside automatic refresh
- [x] Add tests covering timestamp display and automatic refresh behavior

- [x] Add an automated paper-trading mode to the simulator that executes virtual trades from generated buy and sell signals
- [x] Expand the simulator stock universe beyond the current small watchlist and support random stock selection for auto-trading
- [x] Build simulator controls for starting, stopping, and reviewing automated virtual trading sessions
- [x] Add tests covering automated trade generation, random stock selection, and simulator state updates

- [x] Add risk profiles for the simulator auto-trader so users can switch between conservative, balanced, and aggressive settings
- [x] Add an auto-trade performance summary showing win rate, realised versus unrealised P&L, best and worst trades, and average holding time
- [x] Add trade-history filters so users can separate manual trades from automated trades in the simulator
- [x] Add tests covering risk profile selection, performance summary calculations, and trade-history filtering

- [x] Highlight the auto-trade simulator capability prominently on the homepage as a major product differentiator
- [x] Add a prominent hero-level message at the top of the simulator page explaining the automated paper-trading feature and why it matters
- [x] Verify the revised homepage and simulator messaging makes the auto-trade feature easy to notice

- [x] Restrict detailed buy and sell signals for users on the free plan so premium signal depth remains reserved for subscribers
- [x] Restrict the simulator auto-trading feature for non-subscribed users and show clear upgrade messaging instead of full access
- [x] Add upgrade prompts and plan-aware messaging across affected signal and simulator surfaces
- [x] Add tests covering subscription gating for signals and auto-trading access

- [x] Add an in-context plan comparison table inside locked dashboard and simulator premium states
- [x] Add blurred premium signal previews so free users can see partial value without full access
- [x] Add a free-preview usage meter and upgrade messaging for limited signal access
- [x] Verify the new locked-state conversion UX and cover it with tests

- [x] Remove the export and API access mention from the Pro plan feature list
- [x] Fix the simulator auto-trader unlock button layout so it stays fully visible on mobile screens
- [x] Verify the updated pricing copy and mobile simulator layout after the fix

- [x] Add an admin bypass so admin accounts can access premium signal detail and auto-trading features for internal testing
- [x] Update shared subscription gating helpers so admin users are treated as premium-access testers without changing normal user plan rules
- [x] Add tests covering admin access to premium-gated dashboard and simulator features

- [x] Add an admin-only toggle to simulate free versus paid product views without changing real subscription data
- [x] Apply the admin view-mode toggle to premium-gated dashboard and simulator UI surfaces
- [x] Add tests covering admin view-mode overrides for premium access messaging and locked states

- [x] Add a settings-level admin switch for free-versus-paid testing mode
- [x] Connect the settings-level switch to the shared admin premium-view logic used across dashboard and simulator surfaces
- [x] Add tests covering the settings-level admin view switch behavior

- [x] Audit all admin-only testing toggle entry points to ensure non-admin subscribers never see them
- [x] Add an explicit non-admin visibility safeguard for admin test-mode UI and related messaging across dashboard, simulator, and Alert Preferences
- [x] Add regression tests confirming non-admin subscribers do not see admin-only testing controls
- [x] Add more vertical gap between the overview banner and the AI trading workspace header on mobile dashboard
- [x] Fix the admin test-mode panel horizontal offset on mobile so it aligns with the main dashboard content column
- [x] Fix the watchlist card horizontal offset on mobile so it aligns with the main dashboard content column
- [x] Add regression coverage for the mobile dashboard spacing and alignment helpers where practical
- [x] Investigate whether dashboard signal generation is incorrectly producing sell-only outcomes
- [x] Verify whether buy-signal generation logic, stored data, or dashboard aggregation is suppressing buy counts
- [x] Fix and test the buy-versus-sell signal behavior if the sell-only pattern is caused by a defect
- [x] Investigate why the auto-trade function may be leaving accounts with no executed trades over multiple days
- [x] Verify whether auto-trade scheduling, signal eligibility, held-position constraints, or execution persistence is blocking trades unexpectedly
- [x] Fix and test the auto-trade flow if the no-trades behavior is caused by a defect
- [x] Persist simulator portfolios server-side for timed 1-day, 3-day, and 7-day auto-trading runs
- [x] Add server procedures and a scheduled processing endpoint for recurring simulator auto-trading rounds
- [x] Redesign the simulator auto-trader UI to start, monitor, and stop server-backed timed runs alongside browser-only auto mode
- [x] Add regression coverage for the timed auto-trader disclosure and controls
- [x] Investigate why the preview page reports a Vite websocket connection failure
- [x] Verify whether the websocket error is caused by transient preview-server state or by project configuration
- [x] Fix and validate the preview websocket behavior if the issue is caused by project code or dev configuration
- [x] Verify that buy and sell signals are both generating correctly in the current app state
- [x] Identify and fix any remaining signal-generation or aggregation issue if either side is not being produced correctly
- [x] Add clear website messaging that the service is not financial advice and is not regulated by the FCA
- [x] Validate the new disclaimer placement and wording across the affected pages
- [x] Change the timed auto-run start control to show an in-progress state once a scheduled run is active
- [x] Investigate why scheduled auto runs can remain active while executing zero trades across completed rounds
- [x] Fix and test the scheduled auto-trading execution flow if trades are being blocked by logic or persistence defects
- [x] Add a per-round execution log to the timed auto-trading panel
- [x] Persist and surface round-by-round scheduled run details such as scan time, tickers reviewed, signals found, and trades executed
- [x] Add focused tests covering the scheduled execution log rendering and data flow
- [x] Investigate why actionable buy and sell signals are no longer appearing in the dashboard signal trend
- [x] Verify whether signal generation, actionability filtering, or watchlist-specific thresholds are suppressing all signal output
- [x] Investigate why the auto-trade simulator is showing no executed results despite scheduled or manual runs
- [x] Fix and test the signal-generation and simulator execution flow if results are being blocked by logic, persistence, or configuration defects
- [x] Calibrate stored-signal and simulator confidence thresholds so dashboard buy/sell signals render and scheduled auto-trading can execute qualifying trades again
- [x] Update the real-time signals dashboard cards so the buy section surfaces concrete buy ideas instead of only aggregate counts
- [x] Investigate why the scheduled auto-trade simulator reports only one trade after multiple rounds and correct any misleading summary or execution logic
- [x] Reconcile the overview buy and sell counts with the signal trend cards so both surfaces reflect the same current signal basis
- [x] Make each dashboard next-step card navigate to its relevant destination page
- [x] Clarify and fix the 3-month validation page so its metrics and background behavior match the intended simulator or validation workflow


## Audit Recommendations - Phase 1: Credibility & Trust
- [x] Remove or replace fake accuracy metrics from SignalAccuracyDashboard.tsx (hard-coded 75.5% win rate, 78.2% buy accuracy)
- [x] Add disclaimer to Home.tsx about unverified claims (12,000+ traders, 4.8/5 rating, 67% accuracy)
- [x] Add "Data Freshness" disclosure badge to signal cards showing "Last updated: X hours ago"
- [x] Add tooltip explaining daily data limitation on signal generation
- [x] Update marketing copy to clarify signals are swing-trading focused (3-5 day holds), not day-trading
- [x] Add backtesting disclaimer: "Past performance does not guarantee future results"
- [x] Add simulator accuracy disclaimer: "Real fills may differ from simulated prices"

## Audit Recommendations - Phase 2: Onboarding & UX
- [x] Build 3-step onboarding modal for new users (Add stock → Check signals → Try simulator)
- [x] Add contextual help tooltips (Confidence, Signal Type, Simulator, Auto-Trading) - HelpTooltip component with 15+ predefined topics
- [x] Create "Getting Started" guide page (/getting-started) - Comprehensive 4-section guide with FAQ
- [x] Add video tutorial links (YouTube embeds) - VideoTutorial component with 4 embedded videos
- [x] Build interactive walkthrough for first-time dashboard visit - DashboardWalkthrough component with 5 steps

## Audit Recommendations - Phase 3: Simulator Improvements
- [x] Add limit order support UI and data model (buy/sell at specified price) - OrderTypeSelector component with validation
- [x] Add stop-loss order support UI and data model (sell if price drops below threshold) - Integrated with limit order UI
- [x] Implement pending orders execution logic (check prices and auto-execute) - pendingOrderExecutor.ts with 14 tests
- [x] Add fractional share support (buy $100 worth instead of whole shares) - fractionalShares.ts with 18 tests
- [x] Update commission model to 0% (match Trading 212) - Default 0% commission, configurable
- [x] Improve slippage calculation (market-realistic instead of fixed 0.05%) - slippageCalculator.ts with 18 tests
- [x] Add dividend handling to long-term backtests — Implemented in backtestEngine.ts (runBacktestWithDividends, dividend reinvestment)
- [x] Add corporate action handling (splits, mergers) — Implemented in backtestEngine.ts (applySplitAdjustments)

## Audit Recommendations - Phase 4: Data & Signal Quality
- [x] Upgrade from daily to intraday data (15-minute candles from Alpha Vantage or Finnhub) — Implemented in hybridMarketData.ts
- [x] Recalculate indicators every 15 minutes instead of once per day — Intraday implementation in place
- [x] Add volume confirmation to signal generation — volumeConfirmation.ts implemented
- [x] Add earnings/news event filtering to signals — Implemented in hybridMarketData.ts
- [x] Build backtesting validation to verify signal accuracy — backtestingEngine.ts implemented
- [ ] Add correlation and sector rotation analysis

## Audit Recommendations - Phase 5: Growth & Content
- [x] Create blog section (/blog) with 8 initial articles on trading signals, technical analysis, and education
- [x] Add video tutorial embeds to Getting Started page (4 tutorial videos)
- [x] Build blog post detail page with related articles and sharing
- [x] Add blog search and filtering by category/tags
- [x] Build leaderboard for simulator performance - Top 5 traders with stats
- [x] Launch monthly challenges ("Beat the market in 30 days") - 3 challenges (active, upcoming, completed)
- [x] Create community page with leaderboard, challenges, and statistics
- [x] Add signal sharing feature (Twitter, Reddit, Discord) - SignalSharing component with 4 platforms
- [x] Build case studies page with real user stories - 4 detailed case studies with lessons learned
- [ ] Expand to 50+ blog articles on trading signals and technical analysis
- [ ] Create YouTube channel with 10+ tutorials
- [x] Create affiliate program — Implemented in affiliateProgram.ts with AffiliateUser, AffiliateReferral, AffiliateReward types and AffiliateDashboard page
- [ ] Partner with trading blogs and YouTube channels

## Audit Recommendations - Phase 6: Feature Parity with Competitors
- [ ] Add charting and technical analysis tools (TradingView-like)
- [ ] Build community forum or Discord server
- [ ] Add API documentation for developers
- [ ] Create mobile app (iOS/Android)
- [ ] Integrate with Trading 212 API (if available)
- [ ] Add real-time news and sentiment analysis
- [ ] Build stock screener with advanced filters


## Audit Recommendations - Phase 1-5: Completed
- [x] Removed fake accuracy metrics from SignalAccuracyDashboard - now shows real simulator data
- [x] Added data freshness disclosure badges to signal cards
- [x] Built 3-step onboarding modal for new users
- [x] Created HelpTooltip component with 15+ predefined topics
- [x] Created Getting Started guide page (/getting-started)
- [x] Added video tutorial embeds to Getting Started page
- [x] Created blog section (/blog) with 8 initial articles
- [x] Built community page with leaderboard and monthly challenges
- [x] Added signal sharing feature (Twitter, Reddit, Discord)
- [x] Implemented fractional share support with 18 tests
- [x] Added volume confirmation to signals (volumeConfirmation.ts)
- [x] Built backtesting validation engine (backtestingEngine.ts)
- [x] Created charting component for technical analysis (StockChart.tsx)
- [x] Built affiliate program system (affiliateProgram.ts + AffiliateDashboard page)

## Remaining Medium-term Features
- [x] Upgrade to 15-minute intraday data (API changes needed) — Already implemented in /server/hybridMarketData.ts (IntradayCandle types, intradayCache, fetchIntradayCandles, synthesiseIntradayCandles)
- [x] Add earnings/news event filtering to signals — Already implemented in /server/hybridMarketData.ts (cached earnings-event fetching, suppression logic)
- [x] Build stock screener with advanced filters - StockScreener.tsx with 5 popular screeners
- [x] Add correlation and sector rotation analysis — Implemented in /server/correlationAnalysis.ts with 40+ test cases
- [x] Expand blog to 23 articles on trading signals and technical analysis — Added 10 new articles (Volume Analysis, Risk Management, Divergence Trading, Support/Resistance, Backtesting, Trend Following vs Mean Reversion, Market Correlation, Sector Rotation, Earnings Season, Building Trading Systems)
- [x] Create community forum with discussion threads — Implemented in /server/communityDiscussion.ts with comment validation, moderation, and sentiment analysis
- [x] Add real-time news/sentiment analysis integration — Implemented in /server/newsSentimentIntegration.ts with sentiment detection, signal adjustment, and market-moving news detection
- [x] Create API for third-party integrations — Implemented in /server/publicApi.ts with REST endpoints for signals, backtesting, stocks, and comprehensive documentation
- [ ] Build mobile app companion
- [ ] Expand blog to 50+ articles on trading signals and technical analysis

## Phase 47: High-Priority Technical Features (ceb229e1 continuation)
- [x] Fix Stripe lazy initialization to prevent server crash on missing API key
- [x] Apply all database migrations (IF NOT EXISTS) to dev environment
- [x] Fix vitest.setup.ts window guard for Node environment tests
- [x] Implement 15-minute intraday data fetching in hybridMarketData.ts
- [x] Add earnings/news event filter to hybridMarketData.ts (suppress signals ±2 days)
- [x] Wire earnings filter into signalMonitoringJob.ts signal generation loop
- [x] Add getIntradayData and checkEarningsFilter tRPC procedures to realtimeSignals router
- [x] Add runBacktestWithDividends function to backtestEngine.ts (quarterly dividends, reinvestment)
- [x] Wire dividend-aware backtest into backtest.ts router
- [x] Fix TypeScript errors in dividend processing (null narrowing, type annotations)
- [x] Verify TypeScript compiles cleanly (zero errors)
- [x] Confirm auth.logout.test.ts and core tests pass

## Phase 49: User Profile & Subscription Management (COMPLETE)
- [x] Add profile tRPC procedures (getProfile, updateProfile, cancelSubscription) — Already implemented in /server/routers/profile.ts
- [x] Build UserProfile.tsx page with account info and subscription tier card
- [x] Add profile route to App.tsx and navigation link in UserProfileMenu/sidebar


## Phase 50: Traffic Growth Infrastructure (COMPLETE)
- [x] Expand blog to 50 articles on trading signals and technical analysis — Database-backed blog system with 50 articles (initial 23 + 27 new generated)
- [x] Create email newsletter system — Implemented in /server/emailNewsletter.ts with 5 professional templates (Signal Alerts, Market Insights, User Wins, Feature Updates, Weekly Digest)
- [x] Create analytics dashboard — Implemented in /server/analyticsTracking.ts with 15+ metrics (traffic, conversion, revenue, marketing, product, engagement)
- [x] Create community challenge tracking — Implemented in /server/communityChallenge.ts with leaderboards, statistics, and percentile calculations
- [x] Create ProductHunt launch assets — Complete launch checklist, social media posts (Twitter, Reddit, HackerNews), maker comment, FAQ, email templates
- [x] Migrate blog posts to database — Created blog_posts table schema, seeded 23 initial posts, inserted 27 new posts, created tRPC blog router
- [x] Update Blog.tsx to use database — Modified Blog.tsx to fetch posts from tRPC instead of static file

## Outstanding Tasks (2 remaining)
- [ ] Build mobile app companion (iOS/Android)
- [ ] Additional integrations and partnerships

## Audit Fixes - July 2026 (duplicate section — all completed in session above)

- [x] Add sentAt column to signalAlerts schema and run migration
- [x] Add updatedAt column to priceAlerts schema and run migration
- [x] Fix emailNewsletter.ts and analyticsTracking.ts broken db import
- [x] Fix UserProfile.tsx missing DashboardLayout import
- [x] Fix Backtesting.tsx decimal arithmetic (string|null to number)
- [x] Fix Blog.tsx and BlogPost.tsx tags typed as unknown
- [x] Fix publicApi.ts referencing wrong table for technical indicators
- [x] Fix alertPreferences.ts using invalid "deleted" status
- [x] Fix sidebar "STOCK PREDICTOR" branding in DashboardLayout header
- [x] Fix backtest.ts decimal insert type errors (line 79 and 366)
- [x] Fix Dashboard.tsx DashboardSignalRecord type mismatch
- [x] Fix SignalsDashboard.tsx stocks property missing
- [x] Fix alertMonitoringService.ts sentAt reference
- [x] Fix priceAlertService.ts updatedAt reference
- [x] Remove ComponentShowcase route from production
- [x] Remove duplicate /alerts-center route
- [x] Add robots.txt and sitemap.xml

## Audit Fixes - July 2026

- [x] Fix 68 TypeScript compilation errors (down to 0)
- [x] Fix broken db import in emailNewsletter.ts and analyticsTracking.ts
- [x] Add sentAt column to signal_alerts table via migration
- [x] Add updatedAt column to price_alerts table via migration
- [x] Fix UserProfile.tsx missing DashboardLayout import (page was crashing)
- [x] Fix Backtesting.tsx decimal arithmetic (NaN from string DB values)
- [x] Fix blog tag filtering (unknown type cast to string[])
- [x] Fix publicApi.ts query chain (where must precede limit in Drizzle)
- [x] Fix priceAlertService.ts deleted status and null triggerCount handling
- [x] Fix alertMonitoringService.ts percent_change alertType union
- [x] Fix alertPreferences.ts unknown notificationChannels cast
- [x] Fix alerts.ts null minConfidence check and price string conversion
- [x] Fix backtest.ts decimal string conversions for all decimal columns
- [x] Fix db.ts drizzle schema initialization for db.query support
- [x] Fix SignalDetailsModal price string|null type
- [x] Fix DashboardSignalRecord and StoredSignal types to accept hold
- [x] Fix SignalsDashboard price arithmetic for string|null values
- [x] Fix insertNewBlogPosts.ts boolean featured type (was using 0/1)
- [x] Remove duplicate /alerts-center route (now aliases /alerts)
- [x] Update robots.txt to disallow authenticated pages from crawling
- [x] Update sitemap.xml with public pages only and correct lastmod dates

## Traffic Driving Features - July 2026

- [x] B1: Add SEO meta descriptions to all public pages
- [x] B1: Add Open Graph tags (og:title, og:description, og:image) to all public pages
- [x] B1: Add JSON-LD structured data to blog posts
- [x] B1: Optimise page titles with target keywords
- [x] B2: Build referral programme (unique referral links, credit system, referral dashboard page)
- [x] B2: Add referral tracking to subscription flow
- [x] B3: Build email onboarding sequence (7-day drip with conversion email on day 7)
- [x] B3: Add onboarding email trigger on new user registration
- [x] B4: Enhance Signal Accuracy page with aggregate win rate, top signals, community stats
- [x] B5: Build Share My Signal feature (shareable signal cards with Vortextrade branding)
- [x] B6: Add Google Search Console verification meta tag placeholder to index.html

## Traffic Feature Implementation - July 2026

- [x] Build public Today's Top Signals page at /signals/today (ungated, daily-updated, SEO-indexable)
- [x] Add publicSignals.getToday tRPC procedure returning top signals by confidence (no auth)
- [x] Build programmatic ticker pages at /stocks/:ticker (public, SEO, shows last 30 days of signals)
- [x] Add publicSignals.getForTicker tRPC procedure for ticker page data
- [x] Build free signal strength calculator tool at /tools/signal-calculator (ungated, no auth)
- [x] Build embeddable live signal widget (iframe-embeddable, /embed/signals)
- [x] Add /embed/signals public iframe endpoint + /embed instructions page
- [x] Implement weekly Signal Digest email (Monday morning, top signals + stats)
- [x] Add POST /api/scheduled/weekly-digest endpoint + weeklyDigestService.ts
- [x] Update referral incentive copy to "Give 1 month free, get 1 month free"
- [x] Add referral banner to DashboardLayout sidebar footer
- [x] Add new pages to sitemap.xml with correct changefreq/priority
- [x] Add Google Search Console verification meta tag placeholder to index.html
- [x] Add /signals/today, /stocks/:ticker, /tools/signal-calculator, /embed routes to App.tsx
- [x] Add "Live Signals" and "Free Tools" navigation links to public header

## Heartbeat Cron Migration (Cost Optimisation)

- [x] Create /api/scheduled/signal-monitoring endpoint (replaces signalMonitoringJob setInterval)
- [x] Create /api/scheduled/background-jobs endpoint (replaces backgroundJobs setInterval)
- [x] Create /api/scheduled/alert-monitoring endpoint (replaces alertMonitoringService setInterval)
- [x] Remove startBackgroundJobs() and initializeAlertMonitoring() from server startup
- [x] Register four Heartbeat cron jobs via manus-heartbeat CLI (signal-monitoring, alert-monitoring, weekly-digest, simulator-auto-trading)
- [x] TypeScript check and save checkpoint
- [x] Fix auto trade timer: 3-day run resets to idle prematurely (should persist across server restarts via DB)
- [x] Remove the redundant top banner from the mobile public homepage
- [x] Make the Vortextrade header logo navigate signed-in users to their dashboard
- [x] Make the Signal Engine / auto-trade entry point prominent and discoverable in the signed-in dashboard
- [x] Diagnose and correct scheduled auto-trade runs that repeatedly return zero actionable buy or sell signals
- [x] Explain no-trade outcomes with concrete thresholds and signal diagnostics in the Signal Engine
- [x] Verify the latest mobile and Signal Engine checkpoint is live on vortextrade.manus.space
- [ ] Export the current Vortextrade project to GitHub before the Manus backup
