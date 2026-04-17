# Audit Fixes Implementation Plan

## Phase 1: Critical Issues

### Issue 1: Data Not Loading (Signals showing "Awaiting signal refresh")
**Root Cause:** Database queries returning empty results or mock data not configured
**Fix:** 
- Check if `getActiveSignalsForUser` returns mock data or empty array
- Ensure watchlist.list returns the 6 stocks that are shown in UI
- Add mock signal data for testing

**Status:** IN PROGRESS

### Issue 2: Validation Page Returns 404
**Root Cause:** Navigation to /validation instead of /validation/setup
**Fix:** 
- Routes exist: /validation/setup and /validation/dashboard
- This is not a bug - user navigated to wrong URL
- Documentation should clarify correct routes

**Status:** NOT A BUG - Routes exist correctly

### Issue 3: Stock Selection Not Registering in Backtesting
**Root Cause:** Code is correct, but stocks data not loading from API
**Fix:**
- Ensure `trpc.stocks.getAll` returns stock data
- Add fallback mock data if API fails
- Display loading state while stocks are fetching

**Status:** IN PROGRESS

### Issue 4: Red Borders on Form Fields
**Root Cause:** Input component has `aria-invalid:border-destructive` styling
**Fix:**
- Only set aria-invalid when there's actual validation error
- Remove aria-invalid from inputs that don't have errors
- Add proper validation error messages

**Status:** IN PROGRESS

### Issue 5: Install App Modal Blocking Content
**Root Cause:** Modal positioning or z-index issue
**Fix:**
- Check AppInstallPrompt component positioning
- Ensure modal can be dismissed
- Verify z-index doesn't block other content

**Status:** IN PROGRESS

## Phase 2: Medium Priority Issues

### Issue 6: Product Tour Video Not Loading
**Fix:** Add fallback or placeholder for video

### Issue 7: No Error Messages for Form Validation
**Fix:** Add error message display below form fields

### Issue 8: No Success Feedback for Actions
**Fix:** Add toast notifications for trade execution, backtest start, stock addition

### Issue 9: Filter Controls Layout on Mobile
**Fix:** Optimize filter layout for mobile screens

### Issue 10: Positions Table Horizontal Scroll
**Fix:** Make positions table responsive or use card layout on mobile

## Phase 3: Low Priority Issues

### Issue 11: Typography Variety
**Fix:** Add more font variety for visual interest

### Issue 12: Icon Descriptions
**Fix:** Make icons more descriptive with tooltips

### Issue 13: Empty State Messaging
**Fix:** Improve messaging in empty states

### Issue 14: Onboarding Flow
**Fix:** Guide users to add stocks first

---

# Implementation Progress

## Completed
- [x] Identified all issues
- [x] Determined root causes
- [x] Created fix plan

## In Progress
- [ ] Fix data loading issues
- [ ] Fix form validation styling
- [ ] Fix modal positioning
- [ ] Add error messages
- [ ] Add success feedback
- [ ] Test mobile responsiveness

## Next Steps
1. Fix data loading in db.ts
2. Update form components to only show red borders on errors
3. Fix modal positioning in AppInstallPrompt
4. Add toast notifications
5. Test all fixes
6. Create checkpoint
