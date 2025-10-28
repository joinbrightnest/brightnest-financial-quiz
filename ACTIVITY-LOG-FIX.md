# Activity Log Fix - Outcome Updates Now Visible

## Problem
When a closer updated a lead's outcome (e.g., from the closer dashboard to "not interested"), the change was:
- ✅ Being saved to the database
- ✅ Being logged in the `CloserAuditLog` table
- ❌ **NOT showing up in the admin dashboard's activity timeline**

## Root Cause
The activity API endpoint (`/api/admin/leads/[sessionId]/activity`) was only showing 4 types of activities:
1. Quiz completed
2. Call booked
3. Deal closed (only when outcome = "converted")
4. Notes added

**Missing:**
- ❌ Outcome/status changes (like "not interested", "needs follow up", etc.)
- ❌ Task activities (created, started, finished)

Even though the outcome changes were being logged in `CloserAuditLog`, the activity API wasn't reading from that table.

## Solution Implemented

### Backend Changes (`app/api/admin/leads/[sessionId]/activity/route.ts`)

#### 1. Added Audit Log Fetching
Now fetches all `CloserAuditLog` entries for appointment outcome updates:
```typescript
const auditLogs = quizSession.appointment ? await prisma.closerAuditLog.findMany({
  where: {
    action: 'appointment_outcome_updated',
    details: {
      path: ['appointmentId'],
      equals: quizSession.appointment.id
    }
  },
  include: {
    closer: {
      select: {
        name: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
}) : [];
```

#### 2. Added Task Fetching
Fetches all tasks associated with the lead:
```typescript
const tasks = emailAnswer ? await prisma.task.findMany({
  where: {
    leadEmail: emailAnswer.value
  },
  include: {
    closer: {
      select: {
        name: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
}) : [];
```

#### 3. Process Outcome Updates
Creates activity entries for all outcome changes:
- Shows the new outcome
- Shows the previous outcome (if available)
- Shows sale value (if applicable)
- Shows any notes added with the outcome

#### 4. Process Task Activities
Creates activity entries for:
- Task created (with title, description, priority, due date)
- Task started (when status changes to in_progress)
- Task finished (when status changes to completed)

#### 5. Fallback for Historical Data
If an appointment has an outcome but no audit logs (historical data before audit logging was implemented):
```typescript
if (quizSession.appointment?.outcome && auditLogs.length === 0) {
  // Create activity entry based on appointment.updatedAt
}
```

### Frontend Changes (`app/admin/leads/[sessionId]/page.tsx`)

#### 1. Updated Activity Type Definitions
Added new activity types:
- `outcome_updated`
- `task_created`
- `task_started`
- `task_finished`

#### 2. Added Icons and Colors
- **Outcome Updated**: Orange icon with checkmark
- **Task Activities**: Indigo/cyan/teal icons with clipboard

#### 3. Added Activity Text Descriptions
Examples:
- "**Stefan** updated outcome to **not interested**"
- "**Stefan** created a task"
- "**Stefan** finished the task"

#### 4. Added Details Display

**For Outcome Updates:**
- Shows outcome badge (e.g., "NOT INTERESTED")
- Shows previous outcome (if available)
- Shows sale value (if applicable)
- Shows notes in an expandable section

**For Task Activities:**
- Shows task title
- Shows priority badge (for task_created)
- Shows description (for task_created)
- Shows due date (for task_created)

## Activity Timeline Now Shows

1. ✅ Quiz completed
2. ✅ Call booked
3. ✅ **Outcome updated** (NEW) - All outcome changes including:
   - converted
   - not_interested
   - needs_follow_up
   - wrong_number
   - no_answer
   - callback_requested
   - rescheduled
4. ✅ Deal closed (when converted with commission)
5. ✅ Notes added
6. ✅ **Task created** (NEW)
7. ✅ **Task started** (NEW)
8. ✅ **Task finished** (NEW)

## What Gets Logged

### When Closer Updates Outcome
The endpoint `/api/closer/appointments/[id]/outcome` creates a `CloserAuditLog` entry with:
- Action: `appointment_outcome_updated`
- Details:
  - `appointmentId`
  - `outcome` (new outcome)
  - `saleValue` (if applicable)
  - `commissionAmount` (if applicable)
  - `affiliateCode` (if applicable)
  - `customerName`
  - `recordingLink` (if provided)
- Closer ID
- IP address
- User agent
- Timestamp

### When Task is Created/Updated
Tasks are tracked through the `Task` model with:
- Status changes (pending → in_progress → completed)
- Completion timestamps
- Created/updated timestamps

## Testing Checklist

To verify the fix works:

1. ✅ Go to closer dashboard
2. ✅ Select a lead/appointment
3. ✅ Update the outcome to "not interested" (or any other status)
4. ✅ Add notes and/or recording link
5. ✅ Go to admin dashboard → Leads → View Details for that lead
6. ✅ Check the Activity tab
7. ✅ You should now see: "**[Closer Name]** updated outcome to **not interested**"
8. ✅ The outcome badge should show "NOT INTERESTED" in orange
9. ✅ Any notes should be visible in an expandable section

## Files Modified

1. `/app/api/admin/leads/[sessionId]/activity/route.ts` - Backend API
2. `/app/admin/leads/[sessionId]/page.tsx` - Frontend UI

## Database Tables Used

- `QuizSession` - Lead information
- `Appointment` - Call booking and outcome information
- `CloserAuditLog` - **Now used for outcome tracking**
- `Task` - **Now used for task activity tracking**
- `Note` - Notes added by closers
- `AffiliateConversion` - Commission information for closed deals

## Future Enhancements

Consider adding activity tracking for:
- Appointment assigned to closer
- Appointment rescheduled
- Outcome recording link added/updated
- Task priority changes
- Task due date changes
- Direct admin actions on leads

## Notes

- The audit logs provide a complete audit trail of all outcome changes
- Multiple outcome updates will all appear in the timeline
- Activities are sorted by timestamp (most recent first)
- The system gracefully handles missing data (e.g., historical appointments without audit logs)

