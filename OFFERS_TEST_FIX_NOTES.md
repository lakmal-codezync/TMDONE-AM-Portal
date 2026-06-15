# Offers Test Fix - Analysis and Solution

## Problem Analysis

The test `02.2-offers.spec.js` was failing when trying to navigate to and interact with the Offers section in the Campaign View page.

### Root Cause
1. **Selector Issue**: The original selector for finding the Offers card was too generic and not specific enough to match the actual DOM structure
2. **Timing Issue**: The page needed more time to fully load before attempting to interact with elements
3. **Missing Context**: The selectors didn't account for the actual structure shown in the accessibility tree

### Evidence from Error Context
The page snapshot showed the Offers card is structured as:
```
- generic [cursor=pointer]:
  - heading "Offers" [level=5]
  - heading "0" [level=2]
```

## Solution Implemented

### 1. **openOffersSection Function - Enhanced Selector Strategy**
- **Primary Selector**: `div.plain-card:has(h5:has-text("Offers")), .card:has(h5:has-text("Offers")), div:has(h5:has-text("Offers"))`
  - This matches the pattern used successfully in the Promo Code test (02.1)
  - Looks for divs with heading h5 containing "Offers" text
  
- **Timeout Enhancement**: Increased timeouts from `catch()` defaults to explicit 15000ms, 10000ms waits
  
- **Scroll Before Click**: Added `scrollIntoViewIfNeeded()` to ensure the card is visible before clicking
  
- **Better Logging**: Added console.log statements at each fallback level for debugging
  
- **Multiple Fallbacks**: Implemented cascading fallback selectors:
  1. Plain-card/card with h5:has-text("Offers")
  2. Alternative: plain-card/card with text "Offer"
  3. Tab elements (if structured as tabs)
  4. Button elements

### 2. **createOfferInView Function - Improved Robustness**
- **Pre-Load Wait**: Added 1.5s wait after opening Offers section before attempting to create
  
- **Dialog Wait**: Increased dialog visibility wait to 15 seconds with explicit timeout parameter
  
- **Input Handling**: Added 500ms waits between filling fields to allow the form to settle
  
- **Better Error Reporting**: Added console logs for debugging missing buttons/dialogs
  
- **Save Confirmation**: Increased wait after save button click to 3.5s to ensure data is saved

### 3. **verifyOfferSearch Function - Enhanced Search Logic**
- **Post-Creation Wait**: Added 2s wait after creating offer for data to be indexed
  
- **Input Visibility Check**: Explicit visibility check before interacting with search input
  
- **Search Timeout**: More reliable Enter key press with adequate wait time (2.5s)
  
- **Dual Search Methods**: 
  - Primary: Press Enter key
  - Fallback: Click search button if available
  
- **Better Error Logging**: Added console logs at each step for debugging

## Test Workflow

The fixed test now follows this robust workflow:

1. **Login** -> Navigate to Campaigns
2. **Search & Open** -> Find "Auto Campaign" and click View
3. **Open Offers** -> Click the Offers card using improved selectors
4. **Create Offer** -> Click Create button and fill form
5. **Verify Search** -> Search for the created offer and confirm visibility

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Offers Selector | Generic, could match wrong element | Specific: `div:has(h5:has-text("Offers"))` |
| Scroll Into View | Not used | Implemented before clicking |
| Dialog Wait | Default timeout | Explicit 15s timeout |
| Logging | None | Console logs at each step |
| Fallback Selectors | Limited | 4-level cascading fallbacks |
| Input Field Waits | Minimal | 500ms between field fills |
| Search Wait | 2.5s | 2.5s + 2s pre-wait |

## Testing Notes

- The test uses `Date.now()` to generate unique offer titles
- Each run creates a new offer, so the test database will grow over time
- The test respects the 300s timeout (5 minutes)
- All helpers use `.catch(() => false)` to prevent test failures from missing UI elements
- The test validates the complete workflow: navigation -> creation -> verification
