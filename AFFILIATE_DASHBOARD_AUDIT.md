# Affiliate Dashboard Full Audit Report

## Date: January 2025
## Scope: Complete review of affiliate dashboard logic and data flow

---

## 🎯 EXECUTIVE SUMMARY

The affiliate dashboard has **critical logic inconsistencies** that create **multiple sources of truth** and incorrect commission calculations.

---

## 🚨 CRITICAL ISSUES FOUND

### 1. **DUPLICATE DATA SOURCES FOR SALES** ❌
**Location**: `app/api/affiliate/stats/route.ts` lines 122-145

**Problem**:
- Sales are counted from TWO different sources:
  1. `allAppointments` (converted appointments) - line 124-133
  2. `allSaleConversions` (AffiliateConversion records) - line 272-285

**Issue**: When a sale happens:
- An `Appointment` record gets `outcome: 'converted'` 
- An `AffiliateConversion` record with `conversionType: "sale"` is created
- These represent the SAME sale but are counted differently

**Lines 145 vs 365**:
```typescript
// Line 145: Total sales from appointments
const totalSales = convertedAppointments.length;

// Line 365: Daily sales from conversions
const daySales = allSaleConversions.filter(...)
```

**Result**: Sales count can be inconsistent between the summary card and the chart.

---

### 2. **COMMISSION CALCULATION MISMATCH** ❌
**Location**: `app/api/affiliate/stats/route.ts` lines 161-168

**Problem**:
- Main `totalCommission` uses `dailyStats.reduce()` (line 161)
- But `totalSales` uses `convertedAppointments.length` (line 145)
- These come from DIFFERENT sources

**What happens**:
```typescript
// Line 161: Commission from dailyStats (AffiliateConversion records)
const calculatedTotalCommission = dailyStats.reduce((sum, day) => sum + day.commission, 0);

// Line 168: This is used as totalCommission
totalCommission: calculatedTotalCommission

// Line 145: But totalSales uses appointments
const totalSales = convertedAppointments.length;
```

**Bug**: If an appointment doesn't have a corresponding AffiliateConversion, the commission won't show up but the sale will.

---

### 3. **DATE RANGE INCONSISTENCY** ⚠️
**Location**: Lines 84-108 vs 124-133

**Problem**:
- Related data (clicks, conversions, payouts) uses `createdAt: { gte: startDate }` with NO upper bound
- But appointments use `updatedAt` with no explicit bounds
- `dailyStats` function uses BOTH `gte` and `lte` (lines 258-259)

**Result**: Different date ranges for different data sources create inconsistencies.

---

### 4. **TOTALCLICKS COUNTED FROM DIFFERENT SOURCE** 🔍
**Location**: Line 139

**Issue**:
- `totalClicks` uses `affiliateWithData.clicks.length` (line 139)
- But `dailyStats` counts clicks from `allClicks` (line 255-261)
- These are the SAME query, but filtered differently

**Potentially OK** but should be verified.

---

### 5. **POTENTIAL DATE FILTER MISMATCH** ⚠️
**Location**: Line 84-133

**Problem**:
- Line 84-90: Fetch clicks with `createdAt >= startDate`
- Line 92-98: Fetch conversions with `createdAt >= startDate`
- Line 100-106: Fetch payouts with `createdAt >= startDate`
- Line 124-133: Fetch appointments with `updatedAt >= startDate` (different field!)

**Why this is wrong**:
- Clicks and conversions use `createdAt` (when created)
- Appointments use `updatedAt` (when updated, i.e., when converted)
- This is INCONSISTENT with the date filter

**Result**: A sale converted yesterday appears in "Last 24 hours" even if booked weeks ago.

---

## ✅ CORRECT DATA FLOW (as intended)

Based on the code that creates records:

1. **Click** → `AffiliateClick.createdAt` (when link clicked)
2. **Quiz Completion** → `AffiliateConversion` with `conversionType: "quiz_completion"` + `createdAt`
3. **Booking** → `AffiliateConversion` with `conversionType: "booking"` + `createdAt`
4. **Sale** → TWO records created:
   - `Appointment.outcome = 'converted'` (updated `updatedAt`)
   - `AffiliateConversion` with `conversionType: "sale"` + `createdAt`

**Source of Truth for Sales**:
- `AffiliateConversion` with `conversionType: "sale"` is the SINGLE source of truth
- `Appointment.outcome = 'converted'` is redundant

---

## 🔧 REQUIRED FIXES

### Fix 1: Use AffiliateConversion as Single Source of Truth ✅
**Location**: Line 139-145

**Change**:
```typescript
// OLD (Line 139-145)
const totalClicks = affiliateWithData.clicks.length;
const totalLeads = leadData.totalLeads;
const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
const totalSales = convertedAppointments.length;

// NEW (Use conversions only)
const totalClicks = affiliateWithData.clicks.length;
const totalLeads = affiliateWithData.conversions.filter(c => c.conversionType === "quiz_completion").length;
const totalBookings = affiliateWithData.conversions.filter(c => c.conversionType === "booking").length;
const totalSales = affiliateWithData.conversions.filter(c => c.conversionType === "sale").length;
```

### Fix 2: Remove Duplicate Appointment Query ✅
**Location**: Line 122-136

**Action**: Delete this entire section:
```typescript
// DELETE THIS ENTIRE SECTION (lines 122-136)
const allAppointments = await prisma.appointment.findMany({
  where: {
    affiliateCode: affiliate.referralCode,
    outcome: 'converted',
    updatedAt: { gte: startDate },
    saleValue: { not: null }
  },
}).catch(() => []);
const convertedAppointments = allAppointments;
```

### Fix 3: Fix Date Range Filtering Consistency ✅
**Location**: Lines 84-133

**Action**: Ensure all queries use `createdAt` with BOTH upper and lower bounds:
```typescript
where: {
  affiliateId: affiliate.id,
  createdAt: {
    gte: startDate,
    lte: endDate  // ADD THIS
  },
}
```

### Fix 4: Remove Redundant leadData Calculation ✅
**Location**: Line 140

**Action**: Use conversions directly instead of calling `calculateLeadsByCode` which may use different logic.

---

## 📊 DATA SOURCE MAPPING (Current vs Recommended)

| Metric | Current Source | Recommended Source | Status |
|--------|---------------|-------------------|---------|
| Total Clicks | clicks.length | clicks.length | ✅ OK |
| Total Leads | calculateLeadsByCode() | conversions (quiz_completion) | ⚠️ Needs fix |
| Total Bookings | conversions (booking) | conversions (booking) | ✅ OK |
| Total Sales | appointments (converted) | conversions (sale) | ❌ WRONG |
| Total Commission | dailyStats.reduce() | dailyStats.reduce() | ✅ OK (but inconsistent with sales) |

---

## 🎯 RECOMMENDED CHANGES

### Priority 1 (CRITICAL) 🔴
1. Remove duplicate appointment query (line 122-136)
2. Use AffiliateConversion as single source of truth for ALL conversions
3. Fix totalSales to use conversions, not appointments

### Priority 2 (HIGH) 🟡
1. Ensure all queries use `createdAt` with both `gte` and `lte`
2. Remove redundant `calculateLeadsByCode` call
3. Add proper TypeScript typing for all conversions

### Priority 3 (MEDIUM) 🟢
1. Add validation to ensure commission totals match
2. Add unit tests for each metric calculation
3. Add logging for debugging discrepancies

---

## 🔍 TESTING RECOMMENDATIONS

1. **Test Case**: Create one sale and verify:
   - totalSales = 1
   - totalCommission = correct amount
   - dailyStats shows correct sale

2. **Test Case**: Filter by "Last 24 hours":
   - Create a sale now
   - Verify it appears in the summary cards
   - Verify it appears in the chart

3. **Test Case**: Filter by "Last 7 days":
   - Create multiple sales over 7 days
   - Verify all sales appear
   - Verify commission totals match

4. **Test Case**: Cross-validate:
   - Compare sales count from conversions vs appointments
   - They should match (or remove appointment query if they don't)

---

## ✅ CONCLUSION

The affiliate dashboard has **fundamental architectural issues** that create multiple sources of truth and inconsistent data. These need to be fixed before the dashboard can be considered reliable.

**Recommended Action**: Implement all Priority 1 fixes immediately, test thoroughly, then deploy.

