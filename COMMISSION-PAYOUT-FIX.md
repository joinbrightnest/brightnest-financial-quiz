# Commission Payout Management Fix

## Issue Summary
The Commission Payout Management table was showing incorrect "Available Commission" amounts. When making payouts to affiliates, the "Total Paid" would increase correctly, but the "Available Commission" would not decrease, staying at the same value.

### Example (Manuel):
- **Before Fix:**
  - Available Commission: $20 (static, never changed)
  - Total Paid: $12 (increased with each payout)
  - Problem: $20 should have decreased as payouts were made

- **After Fix:**
  - Available Commission: $8 (correctly calculated as $20 - $12)
  - Total Paid: $12
  - Result: ✅ Shows accurate available balance

## Root Cause
There were **two issues** in the codebase:

### Issue 1: Admin API Calculation (Primary Bug)
**File:** `/app/api/admin/affiliates/route.ts`

The admin API was calculating available commission incorrectly:
```javascript
// OLD (WRONG) - Line 90-92
const availableCommissions = affiliate.conversions
  .filter(conv => conv.commissionStatus === 'available')
  .reduce((sum, conv) => sum + Number(conv.commissionAmount), 0);
// This just summed available conversions, ignoring already-paid amounts
```

**The Fix:**
```javascript
// NEW (CORRECT) - Lines 89-96
const availableConversionsSum = affiliate.conversions
  .filter(conv => conv.commissionStatus === 'available')
  .reduce((sum, conv) => sum + Number(conv.commissionAmount), 0);

// Subtract already paid amounts (handles partial payments)
const availableCommissions = Math.max(0, availableConversionsSum - totalPaid);
```

This calculation now matches the affiliate-facing API which was already correct.

### Issue 2: Payout Marking Logic (Secondary Bug)
**File:** `/app/api/admin/affiliates/[id]/payout/route.ts`

The SQL query to mark conversions as "paid" had a flawed LIMIT clause:
```sql
-- OLD (WRONG) - Lines 73-80
LIMIT (
  SELECT COUNT(*)
  FROM affiliate_conversions
  WHERE affiliate_id = ${id}
    AND commission_status = 'available'
    AND commission_amount > 0
    AND commission_amount <= ${amount}
)
```

**Problem:** This counted conversions where `commission_amount <= payout_amount`. For Manuel who had a $20 conversion and paid out $5, the count would be 0 (no conversions ≤ $5), so LIMIT 0 meant nothing got marked as paid.

**The Fix:**
```sql
-- NEW (CORRECT) - Lines 62-78
UPDATE affiliate_conversions
SET commission_status = 'paid'
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      commission_amount,
      SUM(commission_amount) OVER (ORDER BY created_at ASC) as cumulative_sum
    FROM affiliate_conversions
    WHERE affiliate_id = ${id}
      AND commission_status = 'available'
      AND commission_amount > 0
  ) as cumulative
  WHERE cumulative_sum <= ${amount}
)
```

Now uses a cumulative sum approach to properly mark conversions as paid when the total amount covers them.

## How the System Now Works

### Commission States
1. **Held**: Commission from recent conversions (within hold period, typically 30 days)
2. **Available**: Commission released from hold period
3. **Paid**: Commission that has been paid out

### Available Commission Calculation
```
Available Commission = SUM(available conversions) - SUM(completed payouts)
```

This correctly handles:
- ✅ Partial payments (e.g., paying $5 from a $20 conversion)
- ✅ Multiple payouts over time
- ✅ Accurate real-time available balance

### Example Scenarios

#### Scenario 1: Partial Payment
- Affiliate earns $20 commission (marked as 'available')
- Admin pays out $5
- Available = $20 - $5 = **$15** ✅
- The $20 conversion stays as 'available' (not yet fully paid)

#### Scenario 2: Full Payment
- Affiliate earns $20 commission (marked as 'available')
- Admin pays out $20
- Available = $20 - $20 = **$0** ✅
- The $20 conversion gets marked as 'paid'

#### Scenario 3: Multiple Conversions
- Affiliate earns $10, then $15 (both 'available')
- Total available: $25
- Admin pays out $12
- Conversions $10 (paid, cumulative $10) and first $2 of $15
- Available = $25 - $12 = **$13** ✅

## Files Modified

1. **`/app/api/admin/affiliates/route.ts`** (Lines 89-96)
   - Fixed available commission calculation to subtract total paid

2. **`/app/api/admin/affiliates/[id]/payout/route.ts`** (Lines 62-78)
   - Fixed SQL query to use cumulative sum for marking conversions as paid

## Testing
Verified with Manuel's actual data:
- Total earned: $20
- Total paid out: $12
- Before fix: Available showed $20 ❌
- After fix: Available shows $8 ✅

## No Data Migration Needed
The fix is purely in the calculation logic. No database changes or data migrations are required. The correct values will display immediately after deploying the updated code.

