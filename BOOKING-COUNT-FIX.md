# Admin Booking Count Fix - Critical Data Accuracy Issue

## Problem

The admin individual affiliate performance page was showing **incorrect booking counts**:
- **Chart showed**: 2 booked calls (1 on Oct 25, 1 on Oct 26)
- **Actual reality**: 4 booked calls
- **User-facing affiliate dashboard**: Correctly showed 4 booked calls

This created a serious discrepancy where:
- Affiliates saw one number in their dashboard
- Admins saw a different (wrong) number in the admin panel
- Commission calculations could be affected
- Trust in the system data was compromised

## Root Cause

The admin API was counting bookings from the **wrong database table**.

### Two Sources of Booking Data

1. **`affiliate_conversions` table**:
   - Used for tracking conversion events
   - Sometimes used to record booking events
   - **NOT the source of truth for bookings**
   - Can miss bookings that come through other flows

2. **`appointment` table** ✅:
   - **THE SOURCE OF TRUTH for bookings**
   - Every booking creates an appointment record
   - Has `affiliateCode` field for attribution
   - Used by Calendly webhook integration
   - **This is what we should count**

### The Bug

**File**: `app/api/admin/affiliates/[id]/stats/route.ts`

**Before (WRONG)**:
```typescript
// Only fetching conversions
const conversions = await prisma.affiliateConversion.findMany({
  where: {
    affiliateId: affiliate.id,
    createdAt: { gte: startDate },
  },
});

// Counting bookings from conversions ❌
const totalBookings = conversions.filter(c => c.conversionType === "booking").length;
```

**Problem**: This misses bookings that:
- Come directly through Calendly
- Are created by the booking flow but not recorded in conversions
- Have different timing between conversion record and appointment creation

## The Fix

### 1. Fetch Appointments

```typescript
// Now fetching appointments alongside other data
[clicks, conversions, quizSessions, appointments] = await Promise.all([
  // ... other queries ...
  prisma.appointment.findMany({
    where: {
      affiliateCode: affiliate.referralCode,
      createdAt: { gte: startDate },
    },
  }),
]);
```

### 2. Count from Appointments

```typescript
// Count actual bookings from appointments table (source of truth) ✅
const totalBookings = appointments.length;
```

### 3. Update Chart Data Generation

**Function signature updated**:
```typescript
async function generateDailyStatsWithCentralizedLeads(
  affiliateId: string, 
  clicks: any[], 
  conversions: any[], 
  appointments: any[], // ✅ Added appointments parameter
  dateRange: string
)
```

**Hourly breakdown**:
```typescript
// Before ❌
bookedCalls: hourConversions.filter(c => c.conversionType === "booking").length

// After ✅
const hourAppointments = appointments.filter(a => {
  const aptDate = new Date(a.createdAt);
  return aptDate >= hourStart && aptDate <= hourEnd;
});
bookedCalls: hourAppointments.length
```

**Daily breakdown**:
```typescript
// Before ❌
const dayBookings = dayConversions.filter(c => c.conversionType === "booking");
bookedCalls: dayBookings.length

// After ✅
const dayAppointments = appointments.filter(a => {
  const aptDate = new Date(a.createdAt);
  return aptDate >= dayStart && aptDate <= dayEnd;
});
bookedCalls: dayAppointments.length
```

## Consistency Across Codebase

This fix aligns the admin individual stats API with the **correct patterns** already used elsewhere:

### ✅ Correct Implementations (using appointments)

1. **`app/api/affiliates/overview/route.ts`**:
```typescript
const appointments = await prisma.appointment.findMany({
  where: { affiliateCode: affiliate.referralCode },
});
const bookingCount = appointments.length; // ✅ Correct
```

2. **`app/api/admin/affiliate-performance/route.ts`**:
```typescript
const appointments = await prisma.appointment.findMany({
  where: { affiliateCode: affiliate.referralCode, createdAt: { gte: startDate } },
});
const bookingCount = appointments.length; // ✅ Correct
```

### ❌ Incorrect Implementation (fixed)

3. **`app/api/admin/affiliates/[id]/stats/route.ts`** (BEFORE):
```typescript
const totalBookings = conversions.filter(c => c.conversionType === "booking").length; // ❌ Wrong
```

## Why This Matters

### Data Integrity
- **Before**: Admins and affiliates saw different numbers
- **After**: Both see the same accurate data

### Trust
- **Before**: Affiliates might question if their bookings are being tracked
- **After**: Transparent, accurate tracking

### Commission Accuracy
- **Before**: Risk of undercounting affiliate performance
- **After**: Accurate performance metrics for fair commissions

### Debugging
- **Before**: Hard to track down why numbers don't match
- **After**: Single source of truth makes debugging easier

## Testing Checklist

After deploying, verify:

1. ✅ **Admin chart shows all bookings**:
   - Navigate to Admin → Affiliates → Click individual affiliate
   - Check "Performance Over Time" chart
   - Purple "Booked Calls" line should show all appointments

2. ✅ **Booking count matches**:
   - Admin individual page: Check "Booked Calls" card
   - Affiliate dashboard: Check "Booked Calls" card
   - Numbers should be identical

3. ✅ **Chart breakdown is accurate**:
   - For 24h: Hourly data should show bookings in correct hours
   - For 7d/30d/90d: Daily data should show bookings on correct days

4. ✅ **Console logs confirm**:
   - Check browser console for: `Retrieved clicks: X, conversions: Y, quiz sessions: Z, appointments: W`
   - `appointments` count should match visible bookings

## Database Schema Reference

### appointment table (Source of Truth)
```sql
CREATE TABLE "appointments" (
  "id" TEXT PRIMARY KEY,
  "customer_name" TEXT NOT NULL,
  "customer_email" TEXT NOT NULL,
  "scheduled_at" TIMESTAMP NOT NULL,
  "status" TEXT DEFAULT 'scheduled',
  "affiliate_code" TEXT, -- ✅ This links to affiliate
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- ... other fields
);
```

### affiliate_conversions table (Secondary tracking)
```sql
CREATE TABLE "affiliate_conversions" (
  "id" TEXT PRIMARY KEY,
  "affiliate_id" TEXT NOT NULL,
  "conversion_type" TEXT NOT NULL, -- Can be "booking", "sale", etc.
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- ... other fields
);
```

## Related Files

- `app/api/admin/affiliates/[id]/stats/route.ts` - Main fix location
- `app/api/affiliates/overview/route.ts` - Reference implementation
- `app/api/admin/affiliate-performance/route.ts` - Reference implementation
- `prisma/schema.prisma` - Database schema
- `app/admin/components/AdminAffiliatePerformanceChart.tsx` - Chart display

## Related Documentation

- `ADMIN-CHART-SYNC.md` - Chart synchronization fixes
- `ADMIN-AFFILIATE-SYNC.md` - Conversion funnel synchronization
- `AFFILIATE-DASHBOARD-FIX.md` - Affiliate dashboard fixes

