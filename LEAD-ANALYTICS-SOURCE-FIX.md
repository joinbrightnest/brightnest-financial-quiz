# Lead Analytics Source Attribution Fix

## User Question
"How are there 3 booked calls? Look in this table there are only 2 booked calls from Manuel"

## Investigation Summary

### What I Found

Manuel actually **does have 3 booked calls** from his affiliate link. The affiliate dashboard was **correct** in showing 3 booked calls. 

The discrepancy was in the **Lead Analytics table**, which was only showing 2 leads with "Manuel" as the source.

### Root Cause

The issue occurred because:

1. **Aloe** - booked a call through Manuel's affiliate link
   - Quiz session: Completed but **NO affiliate code** was captured
   - Appointment: Has Manuel's affiliate code ✓

2. **oppoewa** - booked call and converted ($200 sale)
   - Quiz session: Has Manuel's affiliate code ✓
   - Appointment: Has Manuel's affiliate code ✓

3. **skk** - booked call and converted ($100 sale)
   - Quiz session: Has Manuel's affiliate code ✓
   - Appointment: Has Manuel's affiliate code ✓

### The Bug

The Lead Analytics source attribution was **only checking the quiz session's affiliate code**, not the appointment's affiliate code.

**Old logic:**
```typescript
// Only checked quiz session affiliate code
let source = 'Website';
if (lead.affiliateCode) {  // This is from quiz session only
  const mappedName = affiliateMap[lead.affiliateCode];
  if (mappedName) {
    source = mappedName;
  }
}
```

This caused Aloe to show as "Website" instead of "Manuel" because their quiz session didn't have the affiliate code, even though their appointment did.

## The Fix

Updated the source attribution logic to check **both** quiz session and appointment affiliate codes:

### 1. Updated Affiliate Code Collection
```typescript
// Get affiliate codes from BOTH quiz sessions and appointments
const leadsAffiliateCodes = allLeads
  .filter(lead => lead.affiliateCode)
  .map(lead => lead.affiliateCode!);

const appointmentAffiliateCodes = await prisma.appointment.findMany({
  where: {
    affiliateCode: { not: null }
  },
  select: {
    affiliateCode: true
  },
  distinct: ['affiliateCode']
});

const affiliateCodes = [...new Set([
  ...leadsAffiliateCodes,
  ...appointmentAffiliateCodes.map(a => a.affiliateCode).filter(...)
])];
```

### 2. Updated Source Determination
```typescript
// Check both quiz session AND appointment affiliate codes
let source = 'Website';
let affiliateCodeToCheck = lead.affiliateCode || appointment?.affiliateCode;

if (affiliateCodeToCheck) {
  const mappedName = affiliateMap[affiliateCodeToCheck];
  if (mappedName) {
    source = mappedName;
  }
}
```

## Impact

### Before Fix
- Lead Analytics table showed Aloe with source: "Website"
- Only 2 of Manuel's 3 leads were properly attributed

### After Fix
- Lead Analytics table shows Aloe with source: "Manuel"
- All 3 of Manuel's booked calls are properly attributed
- Works correctly even when quiz session doesn't capture affiliate code but appointment does

## Why This Matters

This fix ensures accurate affiliate attribution in cases where:
- Users book calls directly without completing the quiz
- Quiz tracking fails but appointment tracking succeeds
- Users complete quiz but tracking cookie/parameter is lost before quiz completion
- Any other scenario where appointment has affiliate code but quiz session doesn't

## Files Modified

- `app/api/admin/basic-stats/route.ts` (Lines 253-277, 380-396)

## No Data Migration Needed

This is a display/calculation fix. The data is already in the database correctly. The fix just ensures we look at both sources (quiz session and appointment) when determining the affiliate source.

## Testing

Verified with Manuel's actual data:
- ✅ 3 appointments with affiliate code "manuel"
- ✅ 2 quiz sessions with affiliate code "manuel"  
- ✅ 1 quiz session (Aloe) without affiliate code but appointment has it
- ✅ All 3 leads now show correct source attribution

---

**Commit:** a5943cf
**Date:** October 27, 2025

