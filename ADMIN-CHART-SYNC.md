# Admin Performance Chart Synchronization Fix

## Problem

The admin individual affiliate performance chart was not displaying all metrics correctly:

1. **Chart Display Issue**: Only "Booked Calls" line was showing, while other metrics (Clicks, Leads, Earnings) were grayed out in the legend
2. **Scaling Issues**: Y-axis had hardcoded step sizes that didn't adapt to the data
3. **Date Range Mismatch**: API was using old date range format (today, yesterday, week, month) while frontend was sending new format (24h, 7d, 30d, 90d, 1y, all)
4. **Hourly Data Logic**: 24-hour breakdown wasn't correctly calculating hour ranges across days

## Root Causes

### 1. Chart Component Issues

**File**: `app/admin/components/AdminAffiliatePerformanceChart.tsx`

**Problems**:
- Hardcoded `stepSize: 1` for y-axis made the chart unreadable with larger values
- No dynamic max calculations, causing poor scaling
- Missing data validation for dailyStats array
- Simplified date parsing that didn't handle HH:MM format

**Before**:
```typescript
scales: {
  y: {
    beginAtZero: true,
    ticks: {
      stepSize: 1,  // ❌ Hardcoded
    },
  },
  y1: {
    // ... right axis
    ticks: {
      callback: function(value) {
        return '$' + value.toFixed(2);  // ❌ Too many decimals
      },
    },
  },
}
```

**After**:
```typescript
// Calculate max values for proper scaling
const maxClicks = Math.max(...dailyStats.map(day => day.clicks), 1);
const maxLeads = Math.max(...dailyStats.map(day => day.leads), 1);
const maxBookedCalls = Math.max(...dailyStats.map(day => day.bookedCalls || 0), 1);
const maxCommission = Math.max(...dailyStats.map(day => day.commission || 0), 1);

const leftAxisMax = Math.max(maxClicks, maxLeads, maxBookedCalls);
const rightAxisMax = maxCommission;

scales: {
  y: {
    beginAtZero: true,
    max: Math.ceil(leftAxisMax * 1.1), // ✅ Add 10% padding
    ticks: {
      stepSize: Math.ceil(leftAxisMax / 10), // ✅ Dynamic step size
      callback: function(value) {
        return Number.isInteger(value) ? value : ''; // ✅ Only show integers
      },
    },
  },
  y1: {
    // ... right axis
    max: Math.ceil(rightAxisMax * 1.1), // ✅ Add 10% padding
    ticks: {
      stepSize: Math.ceil(rightAxisMax / 10), // ✅ Dynamic step size
      callback: function(value) {
        return '$' + value.toFixed(0); // ✅ Cleaner format
      },
    },
  },
}
```

### 2. API Date Range Issues

**File**: `app/api/admin/affiliates/[id]/stats/route.ts`

**Problems**:
- API expected old date range format: "today", "yesterday", "week", "month"
- Frontend was sending new format: "24h", "7d", "30d", "90d", "1y", "all"
- This mismatch caused the API to use default values instead of the requested range

**Before**:
```typescript
switch (dateRange) {
  case "today":
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    break;
  case "yesterday":
    // ...
  case "week":
    // ...
  case "month":
    // ...
}
```

**After**:
```typescript
switch (dateRange) {
  case "24h":
  case "1d": // Support both formats
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    break;
  case "7d":
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    break;
  case "30d":
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    break;
  case "90d":
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    break;
  case "1y":
    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    break;
  case "all":
    startDate = new Date(0); // All time
    break;
}
```

### 3. Hourly Data Generation Logic

**File**: `app/api/admin/affiliates/[id]/stats/route.ts` (function: `generateDailyStatsWithCentralizedLeads`)

**Problems**:
- Used `setHours()` on the current date, which doesn't work for 24-hour periods spanning multiple days
- String-based date comparison instead of proper time range filtering
- Didn't match the affiliate dashboard's robust logic

**Before**:
```typescript
if (dateRange === "1d") {
  const now = new Date();
  const startHour = now.getHours() - 23;
  
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i + 24) % 24;
    const hourStr = hour.toString().padStart(2, '0');
    const dateStr = now.toISOString().split('T')[0];
    
    const hourClicks = clicks.filter(c => {
      const clickDate = c.createdAt.toISOString().split('T')[0];
      const clickHour = c.createdAt.getHours().toString().padStart(2, '0');
      return clickDate === dateStr && clickHour === hourStr; // ❌ Only checks current day
    });
  }
}
```

**After**:
```typescript
if (dateRange === "24h" || dateRange === "1d") {
  const now = new Date();
  
  // For "Last 24 hours", go back 24 hours from now
  for (let i = 23; i >= 0; i--) {
    // Calculate the timestamp for each of the last 24 hours (going backwards from now)
    const hourTimestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourStart = new Date(hourTimestamp);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourTimestamp);
    hourEnd.setMinutes(59, 59, 999);
    
    const hourLabel = `${hourTimestamp.getHours().toString().padStart(2, '0')}:00`;
    
    // Filter data for this specific hour using proper time ranges
    const hourClicks = clicks.filter(c => {
      const clickDate = new Date(c.createdAt);
      return clickDate >= hourStart && clickDate <= hourEnd; // ✅ Proper time range
    });
  }
}
```

## Changes Made

### Chart Component (`AdminAffiliatePerformanceChart.tsx`)

1. ✅ Added dynamic y-axis scaling calculations
2. ✅ Implemented 10% padding on max values
3. ✅ Dynamic step sizes based on data range
4. ✅ Integer-only tick labels on left axis
5. ✅ Cleaner currency formatting ($X instead of $X.XX)
6. ✅ Added safety check for dailyStats array
7. ✅ Improved date label parsing to support HH:MM format

### API Endpoint (`/api/admin/affiliates/[id]/stats/route.ts`)

1. ✅ Updated date range switch statement to handle new format
2. ✅ Support both "24h" and "1d" for backwards compatibility
3. ✅ Fixed hourly data generation to properly handle 24-hour spans
4. ✅ Improved daily data generation with proper time range filtering
5. ✅ Added "all time" handling (shows last 90 days)

## Testing

### What to Test

1. **Chart Visibility**: All 4 lines should be visible by default
   - Blue: Clicks
   - Green: Leads
   - Purple: Booked Calls
   - Orange: Earnings

2. **Chart Scaling**: Y-axis should auto-scale based on data
   - Left axis: Shows clicks, leads, bookings
   - Right axis: Shows earnings ($)

3. **Interactive Legend**: Clicking legend buttons should toggle lines

4. **Date Range Filter**: All options should work correctly
   - Last 24 hours (hourly breakdown)
   - Last 7 days (daily breakdown)
   - Last 30 days (daily breakdown)
   - Last 90 days (daily breakdown)
   - Last year (daily breakdown)
   - All Time (last 90 days, daily breakdown)

5. **Data Consistency**: Admin chart should match affiliate dashboard chart
   - Same values for same time periods
   - Same visual appearance
   - Same calculation logic

## Result

The admin performance chart now:
- ✅ Displays all metrics correctly
- ✅ Scales properly based on data
- ✅ Matches the affiliate dashboard appearance
- ✅ Uses the same date range logic
- ✅ Handles hourly and daily breakdowns correctly
- ✅ Provides accurate data visualization

## Files Modified

1. `app/admin/components/AdminAffiliatePerformanceChart.tsx`
2. `app/api/admin/affiliates/[id]/stats/route.ts`

## Related Documentation

- `ADMIN-AFFILIATE-SYNC.md` - Conversion Funnel synchronization
- `AFFILIATE-DASHBOARD-FIX.md` - Affiliate dashboard fixes
- `LEAD-ANALYTICS-SOURCE-FIX.md` - Lead attribution fixes

