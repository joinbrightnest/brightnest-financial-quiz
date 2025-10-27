# Affiliate Dashboard Conversion Funnel Fix

## Issues Fixed

### Issue 1: Incorrect Label
**Problem:** The Conversion Funnel showed "Quiz Completions" instead of "Total Leads"

**Location:** `app/affiliates/dashboard/page.tsx` line 417

**Fix:** Changed the label from "Quiz Completions" to "Total Leads" to match the terminology used in the metric cards at the top of the dashboard.

```typescript
// BEFORE
<span className="text-xs sm:text-sm font-semibold text-slate-900">Quiz Completions</span>

// AFTER
<span className="text-xs sm:text-sm font-semibold text-slate-900">Total Leads</span>
```

### Issue 2: Incorrect Leads Calculation
**Problem:** Total Leads were calculated by counting `AffiliateConversion` records with `conversionType === "quiz_completion"`, which was inconsistent with the centralized lead calculation logic.

**Location:** `app/api/affiliate/stats/route.ts` line 158

**Root Cause:** 
- The code was looking for conversion records in the `AffiliateConversion` table
- This could lead to inconsistencies with how leads are actually defined in the system
- Leads should be counted from completed quiz sessions that have both name AND email

**Fix:** Changed to use the centralized lead calculation function from `lib/lead-calculation.ts`

```typescript
// BEFORE (WRONG)
const totalLeads = affiliateWithData.conversions.filter(c => c.conversionType === "quiz_completion").length;

// AFTER (CORRECT)
// Use centralized lead calculation for consistency
const leadsData = await calculateLeadsWithDateRange(
  startDate,
  endDate || now,
  undefined,
  affiliate.referralCode
);
const totalLeads = leadsData.totalLeads;
```

### Additional Fix: Variable Scope
**Problem:** The `endDate` variable was declared inside a try block but needed outside that scope.

**Location:** `app/api/affiliate/stats/route.ts` lines 82-107

**Fix:** Moved the `endDate` variable declaration outside the try block to make it accessible throughout the function.

## How Leads Are Calculated (Correctly)

According to `lib/lead-calculation.ts`, a **lead** is defined as:
> A completed quiz session that has both name AND email answers

This ensures:
- ✅ Consistency across all APIs
- ✅ Accurate lead counting based on actual data collection
- ✅ Proper filtering by date range
- ✅ Single source of truth for lead calculations

## Benefits of This Fix

1. **Consistency**: All APIs now use the same method to calculate leads
2. **Accuracy**: Leads are counted from actual quiz data (sessions with name + email)
3. **Clarity**: The label "Total Leads" matches the metric cards and is more intuitive
4. **Reliability**: Uses the centralized calculation function that's already tested and proven

## Testing

Verified with Manuel's data:
- 2 completed quiz sessions with name + email
- Both sessions within last 30 days
- Conversion funnel now correctly displays "Total Leads" instead of "Quiz Completions"
- Lead calculation now uses the same logic as the admin analytics

## Files Modified

1. **`app/affiliates/dashboard/page.tsx`**
   - Line 417: Changed label from "Quiz Completions" to "Total Leads"

2. **`app/api/affiliate/stats/route.ts`**
   - Lines 82-107: Moved `endDate` declaration outside try block
   - Lines 158-166: Changed to use centralized lead calculation function

## No Migration Needed

This is purely a calculation and display fix. No database changes or data migrations are required. The correct data will display immediately after deployment.

