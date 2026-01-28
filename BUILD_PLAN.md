# Vetted Trainers - Build Plan

This document outlines the implementation plan for the remaining features of the Vetted Trainers application. Each phase is broken into discrete, testable chunks.

---

## 📋 Overview

| Phase | Feature | Estimated Effort | Status |
|-------|---------|------------------|--------|
| 1 | Trainer Dashboard | 2-3 sessions | 🔲 Not Started |
| 2 | Enhanced Prescription Builder | 2-3 sessions | 🔲 Not Started |
| 3 | Marketing Email Module | 3-4 sessions | 🔲 Not Started |
| 4 | Client Portal (Future) | 2-3 sessions | 🔲 Not Started |

---

## Phase 1: Trainer Dashboard 👨‍🏫

**Goal:** Enable trainers to view their clients, upcoming sessions, and tasks from a personalized dashboard.

### 1.1 Role-Based Dashboard Routing
- [ ] Update main dashboard (`/`) to detect user role
- [ ] Create trainer-specific dashboard layout
- [ ] Redirect trainers to filtered view on login
- [ ] Keep full admin view for admin users

### 1.2 Trainer's Client List
- [ ] Filter members by `trainerId` matching logged-in trainer
- [ ] Show client cards with:
  - Name, status, last visit date
  - Days since last visit (with color coding)
  - Quick actions: View, Log Session, Send Prescription
- [ ] Add client search/filter

### 1.3 Trainer's Session View
- [ ] Create "My Sessions" page for trainers
- [ ] Show sessions for trainer's clients only
- [ ] Today's sessions highlighted
- [ ] Week view calendar (optional)
- [ ] Quick session logging form

### 1.4 Reminders & Tasks System
- [ ] Create `vtReminders` table in database schema
  ```sql
  - id, trainerId, memberId, type, title, dueDate, completedAt, createdAt
  ```
- [ ] Auto-generate reminders:
  - "Follow up with inactive client [Name]" (7+ days since visit)
  - "Send exercise plan to [Name]" (new client, no prescription)
  - "Enter payroll hours" (weekly, if not submitted)
- [ ] Reminders widget on trainer dashboard
- [ ] Mark as complete / snooze functionality

### 1.5 Trainer Payroll Summary
- [ ] Show trainer's own payroll data
- [ ] Current period sessions & estimated pay
- [ ] Historical pay periods
- [ ] Hours entry form (if applicable)

### 1.6 Trainer Quick Actions
- [ ] "Log Session" shortcut
- [ ] "New Prescription" shortcut
- [ ] "View My Clients" shortcut
- [ ] Notification badge for pending tasks

---

## Phase 2: Enhanced Prescription Builder 💪

**Goal:** Create an intuitive, visual prescription/workout builder with drag-and-drop, templates, and client delivery.

### 2.1 Exercise Library Enhancement
- [ ] Add exercise categories/tags to schema
- [ ] Exercise search with filters (body part, equipment, difficulty)
- [ ] Exercise cards with:
  - Name, thumbnail/video
  - Primary muscles, equipment needed
  - Difficulty level
- [ ] Admin: Add/edit exercises with media upload

### 2.2 Visual Workout Builder
- [ ] Create prescription builder page (`/prescriptions/new`)
- [ ] Drag-and-drop interface for adding exercises
- [ ] Workout structure:
  ```
  Prescription
  └── Day/Section (e.g., "Day 1 - Upper Body")
      └── Exercise Block
          - Exercise reference
          - Sets, reps, rest, tempo
          - Notes/cues
          - Superset grouping (optional)
  ```
- [ ] Reorder exercises via drag-and-drop
- [ ] Duplicate/remove exercise blocks
- [ ] Preview mode (client view)

### 2.3 Prescription Templates
- [ ] Create `vtPrescriptionTemplates` table
- [ ] Save current prescription as template
- [ ] Template library page
- [ ] Load template into builder
- [ ] Default templates:
  - Full Body Strength
  - Upper/Lower Split
  - Mobility & Recovery
  - Beginner Program

### 2.4 Set/Rep Configuration
- [ ] Visual set/rep editor
- [ ] Support for:
  - Standard sets (3x10)
  - Drop sets, pyramid sets
  - Time-based (30 sec hold)
  - AMRAP (as many reps as possible)
- [ ] Rest period configuration
- [ ] Tempo notation (3-1-2-0)
- [ ] RPE/difficulty scale

### 2.5 Prescription Delivery
- [ ] Assign prescription to member
- [ ] Email prescription to client (PDF or link)
- [ ] "Send to Client Portal" (Phase 4)
- [ ] Track sent/viewed status

### 2.6 Prescription History & Tracking
- [ ] View past prescriptions for member
- [ ] Clone/modify previous prescription
- [ ] Progress notes per prescription
- [ ] (Future) Client feedback/completion tracking

---

## Phase 3: Marketing Email Module 📧

**Goal:** Enable admin to design, schedule, and send marketing emails with template management and analytics.

### 3.1 Email Service Integration
- [ ] Add `@vt/email` package
- [ ] Integrate Resend (or SendGrid) SDK
- [ ] Create email sending utility
- [ ] Environment variables for API keys
- [ ] Test email sending

### 3.2 Email Templates (React Email)
- [ ] Set up React Email in `packages/email`
- [ ] Create base branded template
- [ ] Newsletter template
- [ ] Promotion/offer template
- [ ] Reminder template
- [ ] Preview templates in browser

### 3.3 Campaign Management UI
- [ ] Create `/marketing` section in admin
- [ ] Campaign list page with:
  - Campaign name, status, sent date
  - Open rate, click rate
  - Actions: Edit, Duplicate, Delete
- [ ] Campaign statuses: Draft, Scheduled, Sent

### 3.4 Email Builder
- [ ] Create `/marketing/new` campaign page
- [ ] Email builder with:
  - Subject line
  - Preview text
  - Template selection
  - Content blocks (text, image, button, divider)
  - WYSIWYG for text blocks (reuse Tiptap)
- [ ] Live preview pane
- [ ] Save as draft

### 3.5 Audience & Segmentation
- [ ] Create audience segments:
  - All members
  - Active members only
  - Inactive members (re-engagement)
  - New members (last 30 days)
  - By trainer assignment
- [ ] Custom filters (optional)
- [ ] Recipient count preview
- [ ] Test send to self

### 3.6 Scheduling & Sending
- [ ] Send now option
- [ ] Schedule for later (date/time picker)
- [ ] Confirm before sending
- [ ] Send progress indicator
- [ ] Handle bounces/failures

### 3.7 Campaign Analytics
- [ ] Create `vtEmailCampaigns` and `vtEmailEvents` tables
- [ ] Track: sent, delivered, opened, clicked, bounced
- [ ] Campaign detail page with:
  - Summary stats (cards)
  - Open/click charts over time
  - Recipient list with individual status
- [ ] Webhook handler for email events

### 3.8 Unsubscribe & Compliance
- [ ] Add `emailOptOut` field to members
- [ ] Unsubscribe link in all emails
- [ ] Unsubscribe landing page
- [ ] Filter out opted-out members from sends
- [ ] CAN-SPAM compliance footer

---

## Phase 4: Client Portal (Future) 📱

**Goal:** A member-facing portal where clients can view their prescriptions, upcoming sessions, and communicate with their trainer.

### 4.1 Client Authentication
- [ ] Enable member login via `@vt/auth`
- [ ] Link user accounts to member records
- [ ] Client-specific session handling

### 4.2 Client Dashboard
- [ ] Welcome message with trainer info
- [ ] Upcoming sessions
- [ ] Current prescription/workout plan
- [ ] Quick actions

### 4.3 My Prescriptions
- [ ] List of assigned prescriptions
- [ ] Exercise detail view with videos
- [ ] Mark workout as completed
- [ ] Log notes/feedback

### 4.4 Session History
- [ ] Past sessions list
- [ ] Session details and notes

### 4.5 Progress Tracking (Optional)
- [ ] Weight/measurement logging
- [ ] Progress photos (secure upload)
- [ ] Charts/trends

### 4.6 Messaging (Optional)
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

### Current Phase: 1 - Trainer Dashboard
### Current Chunk: 1.1 - Role-Based Dashboard Routing
### Last Updated: 2026-01-27

---

## Notes

- Each chunk should be testable independently
- Commit after completing each chunk
- Update this document as requirements evolve
- Consider mobile responsiveness for all new UI
