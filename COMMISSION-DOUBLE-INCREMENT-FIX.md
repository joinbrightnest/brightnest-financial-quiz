# Commission Double-Increment Bug Fix

## Problem Summary

**Issue:** Affiliate commissions were being counted TWICE, resulting in inflated commission values.

### Root Cause
The `Affiliate.totalCommission` field was being incremented in **two places**:

1. **First increment** (CORRECT): When a sale is marked as "converted"
   - Location: `/app/api/closer/appointments/[id]/outcome/route.ts` line 119-124
   - Action: `totalCommission` += commission amount

2. **Second increment** (BUG): When commission is released from hold
   - Location: `/app/api/admin/process-commission-releases/route.ts` line 72-81
   - Action: `totalCommission` += commission amount **AGAIN**

### Example
- Manuel has $400 in revenue with 10% commission rate
- **Expected commission:** $400 × 0.10 = $40
- **Actual stored value:** $40 + $40 = $80 (doubled!)

### Impact
- **Affiliate Performance table**: Showed $70-80 per affiliate (using doubled database value)
- **Overview "Total Commissions"**: Showed $50 (correctly calculated from appointments)
- **Paid/Pending split**: Used arbitrary 70/30 split instead of actual payout data

---

## Fixes Applied

### 1. ✅ Removed Double Increment
**File:** `/app/api/admin/process-commission-releases/route.ts`

**Change:** Removed the `totalCommission` increment when releasing commissions from hold.

**Reason:** The commission was already added when the sale was created. Releasing from hold should only:
- Change `commissionStatus` from 'held' to 'available'
- Set `releasedAt` timestamp

**Note:** The auto-release cron (`/app/api/auto-release-commissions/route.ts`) was already correct and didn't have this bug.

### 2. ✅ Fixed Commission Calculation in Overview API
**File:** `/app/api/affiliates/overview/route.ts`

**Changes:**
- Now calculates commission from actual revenue: `revenue × commissionRate`
- No longer uses the potentially-doubled `affiliate.totalCommission` field
- Replaced arbitrary 70/30 paid/pending split with actual payout data from database

### 3. ✅ Created Data Migration Script
**File:** `fix-doubled-commissions.sql`

This script will:
- Back up current commission values
- Recalculate `totalCommission` from actual converted appointments
- Show before/after comparison
- Provide rollback instructions if needed

---

## How to Apply the Fix

### Step 1: Deploy Code Changes
```bash
git add -A
git commit -m "Fix: Remove commission double-increment bug

- Remove duplicate totalCommission increment in release process
- Calculate commissions from actual revenue instead of database field
- Use real payout data instead of arbitrary 70/30 split
- Add migration script to fix existing doubled data"
git push origin main
```

### Step 2: Run Database Migration (IMPORTANT!)
**⚠️ This fixes existing doubled commission values in the database**

```bash
# Connect to your production database
# Run the migration script
psql $DATABASE_URL -f fix-doubled-commissions.sql
```

**What the script does:**
1. Shows current state (for verification)
2. Creates backup table with old values
3. Recalculates `totalCommission` from actual sales
4. Shows before/after comparison

**Expected results for Manuel:**
- Old value: $70-80
- New value: $40
- Difference: ~50% reduction (back to correct value)

### Step 3: Verify the Fix
After deploying and running the migration:

1. **Check Affiliate Performance table:**
   - Manuel should show $40 commission (not $70-80)
   - Commission = Revenue × Commission Rate

2. **Check Overview metrics:**
   - "Total Commissions Earned by affiliates" should match sum of individual commissions
   - Paid/Pending should match actual payout records

3. **Check individual affiliate pages:**
   - All commission calculations should be consistent

---

## Rollback (If Needed)

If something looks wrong after migration:

```sql
-- Restore original values from backup
UPDATE "Affiliate" a
SET "totalCommission" = b."oldTotalCommission"
FROM "AffiliateCommissionBackup" b
WHERE a.id = b."affiliateId";
```

---

## Prevention

### Going Forward
- ✅ New commissions will NOT be doubled (code fix prevents this)
- ✅ Commission calculations use actual revenue data (not database field)
- ✅ Paid/Pending splits use actual payout records

### Code Review Checklist
When adding commission-related features, ensure:
- [ ] `totalCommission` is only incremented ONCE per sale
- [ ] Commission = Revenue × Commission Rate
- [ ] Don't increment when changing status (held → available, available → paid)
- [ ] Use calculated values, not stored database fields when possible

---

## Testing

### Before Fix
```
Manuel:
- Revenue: $400
- Commission Rate: 10%
- Expected: $40
- Actual (database): $80 ❌
- Displayed: $70-80 ❌
```

### After Fix
```
Manuel:
- Revenue: $400
- Commission Rate: 10%
- Expected: $40
- Actual (calculated): $40 ✅
- Displayed: $40 ✅
```

---

## Questions?

If you see any inconsistencies after applying this fix:
1. Check the backup table: `SELECT * FROM "AffiliateCommissionBackup"`
2. Verify appointment data: Check converted appointments have correct `saleValue` and `commissionAmount`
3. Review payout records: Ensure payouts match released commissions


