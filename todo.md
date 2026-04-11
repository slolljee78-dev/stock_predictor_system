# Stock Predictor System - Project TODO

## Phase 1: Research & Architecture
- [x] Research Trading 212 stock list and API availability
- [x] Evaluate free stock data APIs (yfinance, Alpha Vantage, EODHD)
- [x] Document ML signal generation approach (LSTM, XGBoost, LLM analysis)
- [x] Finalize tech stack and data flow architecture

## Phase 2: Database Schema & Backend
- [x] Design and implement database schema (stocks, watchlists, signals, alerts, user preferences)
- [x] Create stock data ingestion pipeline
- [x] Implement query helpers for stocks, watchlists, and signals
- [ ] Set up background job system for periodic signal generation

## Phase 3: ML Signal Engine
- [x] Implement technical indicator calculations (RSI, MACD, Bollinger Bands, SMA, EMA)
- [x] Build LLM-powered signal generation (price pattern analysis)
- [x] Create signal storage and history tracking
- [x] Implement confidence score calculation

## Phase 4: Frontend - Premium UI
- [x] Design and implement elegant dashboard layout
- [x] Build stock search bar with Trading 212 filtering
- [ ] Create interactive candlestick/line chart component
- [ ] Implement technical indicator overlay system
- [x] Build watchlist management UI
- [x] Create signal history log with confidence scores
- [ ] Implement market overview panel
- [x] Design stock detail page with all analytics

## Phase 5: Alerts & Notifications
- [ ] Implement email alert system
- [ ] Build in-app notification system
- [ ] Create alert preference management UI per stock
- [ ] Integrate alert triggering with signal generation
- [ ] Set up email delivery pipeline

## Phase 6: Testing & Polish
- [ ] Write unit tests for signal generation
- [ ] Test end-to-end alert flows
- [ ] Verify Trading 212 stock list accuracy
- [ ] Polish UI/UX and refine visual design
- [ ] Performance optimization for real-time updates

## Phase 7: Deployment
- [ ] Final QA and bug fixes
- [ ] Create checkpoint for deployment
- [ ] Deliver to user
