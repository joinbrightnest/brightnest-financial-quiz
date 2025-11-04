# Lead Analytics Closer Assignment Audit

## Executive Summary

This audit investigates why some leads in the Lead Analytics dashboard show "Unassigned" in the Deal Owner column while others show a closer name.

## Root Cause Analysis

### The Problem

In the Lead Analytics dashboard (`/app/admin/dashboard/page.tsx` and `/app/admin/leads/page.tsx`), the "Deal Owner" column displays:
- **Closer name** if the lead has an appointment with an assigned closer
- **"Unassigned"** if the lead has no appointment OR the appointment has no closer assigned

### How Leads Are Linked to Closers

1. **Lead Data Source**: Leads come from `QuizSession` records (completed quiz sessions with name and email)
2. **Closer Assignment**: Closers are assigned via `Appointment` records
3. **Linking Mechanism**: Leads are matched to appointments by email:
   - Email is extracted from quiz answers (questions containing "email")
   - Appointments are matched by `customerEmail` field
   - If an appointment exists and has a `closerId`, the closer name is displayed

### Code Flow

**API Endpoint**: `/api/admin/basic-stats/route.ts` (lines 350-458)

```typescript
// 1. Extract emails from leads
const leadEmails: Record<string, string> = {};
allLeads.forEach(lead => {
  const emailAnswer = lead.answers.find((a: any) => 
    a.question?.prompt?.toLowerCase().includes('email') ||
    a.question?.type === 'email'
  );
  if (emailAnswer?.value) {
    leadEmails[lead.id] = emailAnswer.value as string;
  }
});

// 2. Fetch appointments by email
const appointments = await prisma.appointment.findMany({
  where: { 
    customerEmail: { in: emails }
  },
  include: {
    closer: {
      select: {
        id: true,
        name: true
      }
    }
  }
});

// 3. Extract closer name
closerName: appointment?.closer?.name || null
```

**UI Display**: `/app/admin/dashboard/page.tsx` (line 2397)

```typescript
{lead.closerName || lead.appointment?.closer?.name || 'Unassigned'}
```

## Why Some Appointments Don't Have Closers

### 1. Calendly Webhook Auto-Assignment Failure

**Location**: `/api/calendly/webhook/route.ts` (lines 203-266)

The webhook creates appointments and attempts auto-assignment:

```typescript
async function autoAssignToCloser(appointmentId: string) {
  // Find all active, approved closers
  const availableClosers = await prisma.closer.findMany({
    where: {
      isActive: true,
      isApproved: true
    },
    orderBy: {
      totalCalls: 'asc' // Round-robin
    }
  });

  if (availableClosers.length === 0) {
    console.log('⚠️ No available closers for auto-assignment');
    return; // ❌ FAILS SILENTLY - appointment created without closer
  }
  
  // ... assignment logic
}
```

**Issue**: If no active/approved closers exist when the appointment is created, the assignment fails silently and the appointment remains unassigned.

### 2. Manual Appointment Creation

**Location**: `/app/admin/components/CloserManagement.tsx` (lines 229-264)

Appointments can be created manually via the admin interface. There's no automatic closer assignment in the POST endpoint for manual creation.

### 3. Historical Appointments

Appointments created before the auto-assignment logic was implemented (or before closers were added to the system) may not have closers assigned.

### 4. Edge Cases

- Closer may have been deleted (`onDelete: SetNull` in schema), leaving appointment without a closer
- Appointments created via other endpoints (e.g., `/api/track-closer-booking`) may have different assignment logic

## Data Analysis

### Expected Behavior

1. **New appointments from Calendly**: Should always have a closer assigned (if closers are available)
2. **Manual appointments**: Should prompt for closer assignment or auto-assign
3. **Existing unassigned appointments**: Should be fixed via admin action

### Current Issues

1. ✅ **Silent failures**: Auto-assignment fails without notification
2. ✅ **No retry mechanism**: Failed assignments aren't retried later
3. ✅ **Manual creation**: No automatic assignment for manually created appointments
4. ✅ **No audit trail**: No logging of why assignments failed

## Recommendations

### Immediate Fixes

1. **Fix Existing Unassigned Appointments**
   - Create API endpoint to assign closers to existing unassigned appointments
   - Use round-robin assignment (same logic as webhook)
   - Admin can trigger this from the dashboard

2. **Improve Auto-Assignment Logic**
   - Add error handling and logging
   - Retry failed assignments when closers become available
   - Send notifications when assignments fail

3. **Manual Appointment Creation**
   - Auto-assign closers when appointments are created manually
   - Or prompt admin to select a closer before saving

### Long-Term Improvements

1. **Assignment Queue System**
   - Queue appointments for assignment when no closers available
   - Auto-assign when closers become available

2. **Assignment Rules**
   - Allow custom assignment rules (e.g., by timezone, expertise, etc.)
   - Support manual override of auto-assignments

3. **Monitoring & Alerts**
   - Track unassigned appointment count
   - Alert when assignment failure rate is high
   - Dashboard showing assignment success rate

## Implementation Plan

### Phase 1: Fix Existing Data (Immediate)
- [x] Create audit document
- [ ] Create API endpoint to fix unassigned appointments
- [ ] Add admin UI button to trigger fix
- [ ] Run fix on existing data

### Phase 2: Prevent Future Issues (Short-term)
- [ ] Improve auto-assignment error handling
- [ ] Add assignment to manual appointment creation
- [ ] Add logging and monitoring

### Phase 3: Enhance System (Long-term)
- [ ] Implement assignment queue
- [ ] Add assignment rules engine
- [ ] Create monitoring dashboard

## Files Modified

- `app/api/admin/basic-stats/route.ts` - Lead data fetching
- `app/api/calendly/webhook/route.ts` - Auto-assignment logic
- `app/admin/components/CloserManagement.tsx` - Manual appointment creation
- `app/admin/dashboard/page.tsx` - UI display
- `app/admin/leads/page.tsx` - Lead Analytics page

## Testing Checklist

- [ ] Verify unassigned appointments are fixed
- [ ] Verify new appointments get assigned
- [ ] Verify manual appointments get assigned
- [ ] Verify error handling works correctly
- [ ] Verify UI displays correct closer names
- [ ] Test with no closers available
- [ ] Test with multiple closers (round-robin)

## Conclusion

The issue is caused by appointments being created without closer assignments in several scenarios. The fix involves:
1. Assigning closers to existing unassigned appointments
2. Ensuring all future appointment creation paths include auto-assignment
3. Adding proper error handling and logging

