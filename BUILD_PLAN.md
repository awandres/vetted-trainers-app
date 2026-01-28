# Vetted Trainers - Build Plan

This document outlines the implementation plan for the remaining features of the Vetted Trainers application. Each phase is broken into discrete, testable chunks.

---

## 📋 Overview

| Phase | Feature | Estimated Effort | Status |
|-------|---------|------------------|--------|
| 1 | Trainer Dashboard | 2-3 sessions | ✅ Complete |
| 2 | Enhanced Prescription Builder | 2-3 sessions | ✅ Complete |
| 3 | Marketing Email Module | 3-4 sessions | ✅ Complete |
| 4 | Client Portal | 2-3 sessions | ✅ Complete |

---

## Phase 1: Trainer Dashboard 👨‍🏫

**Goal:** Enable trainers to view their clients, upcoming sessions, and tasks from a personalized dashboard.

### 1.1 Role-Based Dashboard Routing ✅
- [x] Update main dashboard (`/`) to detect user role
- [x] Create trainer-specific dashboard layout (`TrainerDashboard.tsx`)
- [x] Redirect trainers to filtered view on login
- [x] Keep full admin view for admin users

### 1.2 Trainer's Client List ✅
- [x] Filter members by `trainerId` matching logged-in trainer
- [x] Show client cards with:
  - Name, status, last visit date
  - Days since last visit (with color coding)
  - Quick actions: View, Log Session, Send Prescription
- [x] Add client search/filter
- [x] Created `/my-clients` page
- [x] Created `/api/trainers/my-clients` endpoint
- [x] Created `/api/trainers/my-sessions` endpoint

### 1.3 Trainer's Session View ✅
- [x] Create "My Sessions" page for trainers
- [x] Show sessions for trainer's clients only
- [x] Today's sessions highlighted
- [x] Week view calendar with session counts
- [x] Week navigator (previous/next)
- [x] Sessions grouped by date
- [x] Stats: sessions, revenue, clients trained

### 1.4 Reminders & Tasks System ✅
- [x] Used existing `vtTasks` table
- [x] API endpoints for task CRUD (`/api/trainers/my-tasks`)
- [x] Auto-generate reminders from inactive/churned clients
- [x] TasksWidget component on trainer dashboard
- [x] Mark as complete functionality
- [x] Add new task inline form

### 1.5 Trainer Payroll Summary ✅
- [x] Show trainer's own payroll data (`/my-payroll`)
- [x] Current period sessions & estimated pay
- [x] Historical pay periods (last 12 weeks)
- [x] YTD stats (earnings, sessions, avg per session)
- [x] Period selector with navigation

### 1.6 Trainer Quick Actions ✅
- [x] "Log Session" shortcut
- [x] "New Prescription" shortcut
- [x] "View My Clients" shortcut
- [x] "My Sessions" shortcut
- [x] "My Payroll" shortcut

---

## Phase 2: Enhanced Prescription Builder 💪 ✅

**Goal:** Create an intuitive, visual prescription/workout builder with drag-and-drop, templates, and client delivery.

### 2.1 Exercise Library Enhancement ✅
- [x] Enhanced exercise filters (category, body area, difficulty)
- [x] Difficulty badges (Beginner/Intermediate/Advanced)
- [x] Body area badges with icons
- [x] "Clear filters" button
- [x] Filter count display

### 2.2 Visual Workout Builder ✅
- [x] Created prescription builder page (`/prescriptions/new`)
- [x] Exercise picker dialog with multi-select
- [x] Reorder exercises via up/down buttons
- [x] Remove exercise from prescription
- [x] Expand/collapse exercise details
- [x] Exercise preview with video embed
- [x] Notes field per exercise
- [x] Live preview sidebar

### 2.3 Prescription Templates ✅
- [x] Created `vtWorkoutTemplates` table
- [x] Created `vtWorkoutTemplateExercises` table
- [x] Save current prescription as template
- [x] Load template into builder
- [x] Template picker dialog
- [x] Public/private template visibility
- [x] API endpoints: `/api/templates` (GET, POST), `/api/templates/[id]` (GET, PATCH, DELETE)

### 2.4 Set/Rep Configuration ✅
- [x] Sets input field per exercise
- [x] Reps input field (supports ranges like "10-12")
- [x] Duration input field (supports "30s", "1min", etc.)
- [x] Notes field for additional instructions
- [x] Quick config row on each exercise card
- [x] Updated `vtPrescriptionExercises` table with sets, reps, duration columns
- [x] Updated `vtPrescriptions` table with name column

### 2.5 Prescription Delivery ✅
- [x] Assign prescription to member (client selector)
- [x] Enhanced send endpoint with member details
- [x] Prepared email data structure for future email service
- [x] Generate client portal URL for prescription
- [x] Track sent/viewed status
- [x] Save & Send button (marks as sent immediately)
- [x] Save Draft button

### 2.6 Prescription History & Progress ✅
- [x] Prescription detail page (`/prescriptions/[id]`)
- [x] View all exercises with full details
- [x] Expand/collapse exercises with video playback
- [x] Coaching cues display
- [x] Timeline sidebar (created, sent, viewed dates)
- [x] Member prescriptions section on member profile enhanced
- [x] "New Prescription" quick action on member profile
- [x] Clickable prescription links to detail view

---

## Phase 3: Marketing Email Module 📧 ✅

**Goal:** Enable admin to design, schedule, and send marketing emails with template management and analytics.

### 3.1 Email Service Integration ✅
- [x] Added `@vt/email` package
- [x] Integrated Resend SDK
- [x] Created email sending utility (`sendEmail`, `sendBatchEmails`)
- [x] Email validation utility
- [x] Environment variables: `RESEND_API_KEY`, `EMAIL_FROM`

### 3.2 Email Templates (React Email) ✅
- [x] Set up React Email in `packages/email`
- [x] Created `BaseTemplate` with branding and footer
- [x] `NewsletterTemplate` - Regular updates and tips
- [x] `PromotionTemplate` - Special offers with promo codes
- [x] `ReminderTemplate` - Session/check-in reminders
- [x] `PrescriptionTemplate` - Exercise prescription emails
- [x] Preview templates with `pnpm --filter @vt/email dev`

### 3.3 Campaign Management UI ✅
- [x] Created `/marketing` section in admin
- [x] Campaign list page with stats, status, actions
- [x] Open rate, click rate display
- [x] Duplicate and delete campaigns
- [x] Status badges: Draft, Scheduled, Sending, Sent, Failed

### 3.4 Email Builder ✅
- [x] Created `/marketing/new` campaign page
- [x] Subject line and preview text inputs
- [x] Template selection (Newsletter, Promotion, Reminder)
- [x] Dynamic content fields per template type
- [x] Headline, body content, CTA button fields
- [x] Promotion-specific: offer amount, promo code
- [x] Save as draft functionality

### 3.5 Audience & Segmentation ✅
- [x] Audience API (`/api/marketing/audience`)
- [x] Segments: All, Active, Inactive, Churned, New (30 days)
- [x] Real-time recipient count
- [x] Filters out opted-out members
- [x] Test send to self functionality

### 3.6 Scheduling & Sending ✅
- [x] Send now option with confirmation
- [x] Campaign send API (`/api/marketing/campaigns/[id]/send`)
- [x] Test email functionality
- [x] Status updates during send
- [x] Batch email sending

### 3.7 Campaign Analytics ✅
- [x] Created `vtEmailCampaigns` table with stats
- [x] Created `vtEmailEvents` table for tracking
- [x] Campaign detail page (`/marketing/[id]`)
- [x] Summary stats cards (sent, opened, clicked, bounced)
- [x] Recent activity event log
- [x] Performance comparison to industry averages

### 3.8 Unsubscribe & Compliance ✅
- [x] Added `emailOptOut` and `emailOptOutAt` to members
- [x] Unsubscribe API endpoint (`/api/marketing/unsubscribe`)
- [x] Unsubscribe landing page (`/unsubscribe`)
- [x] Automatic opt-out filtering in audience queries
- [x] CAN-SPAM compliant footer in BaseTemplate

---

## Phase 4: Client Portal 📱 ✅

**Goal:** A member-facing portal where clients can view their prescriptions, upcoming sessions, and communicate with their trainer.

### 4.1 Client Authentication ✅
- [x] AuthProvider context for client app
- [x] Login page with email/password
- [x] Session management via `@vt/auth`
- [x] Link user accounts to member records (via email)
- [x] Protected routes with redirect to login
- [x] Sign out functionality

### 4.2 Client Dashboard ✅
- [x] Personalized welcome message with name
- [x] Stats cards: sessions, prescriptions, trainer info
- [x] Recent prescriptions list with "New" badge
- [x] Recent sessions list
- [x] Quick action cards (Exercises, Sessions, Progress)

### 4.3 My Prescriptions ✅
- [x] `/prescriptions` - List of assigned prescriptions
- [x] `/prescriptions/[id]` - Exercise detail view
- [x] Embedded YouTube videos for exercises
- [x] Coaching cues and descriptions
- [x] Sets/reps/duration display
- [x] Trainer notes per exercise
- [x] Expand/collapse all functionality
- [x] Auto-mark as "viewed" on open

### 4.4 Session History ✅
- [x] `/sessions` - Past sessions list
- [x] Stats: this month, total, last session
- [x] Sessions grouped by month
- [x] Session type and trainer display
- [x] Session notes display

### 4.5 Progress Tracking ✅
- [x] `/progress` - Progress dashboard
- [x] Stats overview (total sessions, monthly, activity score)
- [x] Monthly goal progress bar
- [x] Achievement badges system
- [x] Unlockable achievements based on activity

### 4.6 Messaging (Future)
- [ ] Simple message thread with trainer
- [ ] Notifications

---

## Database Schema Additions

### New Tables Needed

```sql
-- Reminders/Tasks (Phase 1)
CREATE TABLE vt_reminders (
  id TEXT PRIMARY KEY,
  trainer_id TEXT REFERENCES users(id),
  member_id TEXT REFERENCES vt_members(id),
  type TEXT NOT NULL, -- 'follow_up', 'send_prescription', 'payroll', 'custom'
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMP,
  snoozed_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prescription Templates (Phase 2)
CREATE TABLE vt_prescription_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Full prescription structure
  category TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Campaigns (Phase 3)
CREATE TABLE vt_email_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content JSONB NOT NULL, -- Email template data
  template_id TEXT,
  segment TEXT NOT NULL, -- 'all', 'active', 'inactive', 'new', 'custom'
  segment_filters JSONB,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent'
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  stats JSONB, -- { sent, delivered, opened, clicked, bounced }
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vt_email_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES vt_email_campaigns(id),
  member_id TEXT REFERENCES vt_members(id),
  email TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Tech Stack Additions

| Package | Purpose | Phase |
|---------|---------|-------|
| `@hello-pangea/dnd` | Drag-and-drop for prescription builder | 2 |
| `resend` | Email service SDK | 3 |
| `@react-email/components` | Email template components | 3 |
| `react-email` | Email preview/rendering | 3 |

---

## Getting Started

To begin a phase, run:

```bash
# Make sure dependencies are installed
pnpm install

# Start the dev server
pnpm dev

# Check current database state
pnpm db:studio
```

Then refer to the specific phase section above and work through each checkbox item.

---

## Progress Tracking

Update this section as work progresses:

### Current Phase: 2 - Enhanced Prescription Builder
### Current Chunk: 2.1 - Exercise Library Enhancement
### Last Updated: 2026-01-28

#### Completed:
- ✅ Phase 1: Trainer Dashboard (all chunks complete)
  - 1.1 Role-Based Dashboard Routing
  - 1.2 Trainer's Client List
  - 1.3 Trainer's Session View
  - 1.4 Reminders & Tasks System
  - 1.5 Trainer Payroll Summary
  - 1.6 Trainer Quick Actions

---

## Notes

- Each chunk should be testable independently
- Commit after completing each chunk
- Update this document as requirements evolve
- Consider mobile responsiveness for all new UI
