# Vetted Trainers App - Implementation Plan

## 📋 Executive Summary

This document outlines the complete migration of Vetted Trainers' Google Sheets-based business management system to a modern web application. The goal is to replicate **100% of existing spreadsheet functionality** while adding improved user experience, automation, and real-time calculations.

---

## 🎯 Project Goals

1. **Complete Feature Parity** - Every spreadsheet function works in the app
2. **Improved UX** - Faster data entry, better visualizations, mobile access
3. **Automation** - Auto-calculations, alerts, and notifications
4. **Data Integrity** - Proper relationships, validation, audit trails
5. **Real-time Updates** - No manual formula refreshes needed

---

## 📊 Functional Specification: Data Management Features

### Overview of Data Domains

| Domain | Spreadsheet Source | Primary Purpose |
|--------|-------------------|-----------------|
| **Member Management** | Member Tracker, Visits | Track gym members, status, assignments |
| **Trainer Management** | Trainer Metrics | Track trainer performance, pay rates, reviews |
| **Session Tracking** | KPI, Visits | Log training sessions and non-session work |
| **Financial Management** | Financials, Paycheck Calculator | Revenue, expenses, payroll |
| **Contract Management** | New Members 2025 | Membership agreements, commissions |
| **Exercise Library** | Movement Library | Video database with instructions |
| **Prescriptions** | Mobility Prescriptions | Member exercise assignments |
| **Task Management** | VT Command Center | Internal task tracking |

---

## 1️⃣ MEMBER MANAGEMENT

### 1.1 Member Tracker (Core)

**Spreadsheet Columns → App Fields:**

| CSV Column | App Field | Type | Notes |
|------------|-----------|------|-------|
| Last Visit | `lastVisitDate` | Date | Updated when session logged |
| Member | `firstName`, `lastName` | Text | Split into two fields |
| Trainer | `trainerId` | Relation | Links to trainer record |
| Price per Session | `pricePerSession` | Integer (cents) | Stored in cents for precision |
| Email | `email` | Text | For prescriptions, notifications |
| Days Since | `daysSinceVisit` | Computed | `TODAY() - lastVisitDate` |
| Status | `status` | Enum | Auto-calculated from Days Since |

**Status Calculation Logic:**
```
IF daysSinceVisit ≤ 14 → "active"
IF daysSinceVisit ≤ 45 → "inactive"  
IF daysSinceVisit > 45 → "churned"
Manual override → "paused"
```

**App Features to Build:**
- [ ] **Member List Page** (exists, needs enhancement)
  - Status badges with color coding (green/yellow/red)
  - Filter by status, trainer
  - Sort by days since visit
  - Quick actions: edit, view prescriptions, log visit

- [ ] **Member Detail Page**
  - Contact info, pricing
  - Assigned trainer (with transfer history)
  - Visit history timeline
  - Active contracts
  - Prescriptions sent
  - Referral info

- [ ] **Inactive/Churned Alerts Widget**
  - Dashboard widget showing:
    - Inactive members (14-45 days) grouped by trainer
    - Churned members (45+ days) grouped by trainer
  - One-click "reach out" actions

- [ ] **Member Transfer Tracking**
  - Log when member switches trainers
  - Previous trainer, new trainer, date
  - Show in Trainer Metrics

### 1.2 Visits Log

**Spreadsheet: Visits 2026**

| CSV Column | App Field | Notes |
|------------|-----------|-------|
| Last Visit | `sessionDate` | Date of visit |
| Member | `memberId` | Link to member |
| Trainer | `trainerId` | Who conducted session |
| Price per Session | `priceCharged` | Price at time of session |
| Referred By | `referredBy` on member | One-time capture |

**App Features:**
- [ ] **Quick Visit Logger**
  - Select member from dropdown (with search)
  - Auto-fill trainer and price from member record
  - Option to override price
  - Auto-updates member's `lastVisitDate`

- [ ] **Referral Tracking**
  - Capture "Referred By" on first visit
  - Link to referrer member if they exist
  - Count referrals in Trainer Metrics

---

## 2️⃣ TRAINER MANAGEMENT

### 2.1 Trainer Profiles

**Spreadsheet: Trainer Metrics 2026**

| CSV Column | App Field | Notes |
|------------|-----------|-------|
| Trainer | `firstName`, `lastName` | Name |
| Active Members | Computed | COUNT where status = active |
| Inactive Members | Computed | COUNT where daysSince 14-45 |
| Churned Members | Computed | COUNT where daysSince > 45 |
| Switched Members | Computed | COUNT of transfers this period |
| Total Members | Computed | SUM of all assigned |
| Referrals | Computed | COUNT of referrals |
| Retention % | Computed | Active / Total |
| Avg. Price/Session | Computed | AVG of member prices |
| Sessions | From KPI | This week's sessions |
| Non-Sessions | From KPI | This week's non-session hours |
| Earnings | From Paycheck | This week's total pay |
| Approx. Revenue | Computed | Sessions × Avg Price |
| Last Raise Date | `lastRaiseDate` | Manual input |
| 6-Mo Check In | `sixMonthReviewDate` | Computed from hire/raise |
| 12-Mo Pay Review | `twelveMonthReviewDate` | Computed from hire/raise |
| Raise Status | Computed | ✅ CURRENT or ⚠️ DUE |
| Current Session Rate | `sessionRate` | In cents |
| Current Non-Session Rate | `nonSessionRate` | In cents |

**App Features:**
- [ ] **Trainer List Page** (exists, needs enhancement)
  - Show key metrics inline
  - Raise status indicator
  - Quick link to their members

- [ ] **Trainer Detail Page**
  - Profile info, rates
  - Assigned members list
  - Performance metrics (current + history)
  - Raise/review timeline
  - Pay history

- [ ] **Raise Impact Calculator**
  - From spreadsheet: shows $/week impact of $1-5 raises
  - Based on current session volume
  - `Volume × Raise Amount = Weekly Impact`

### 2.2 Weekly Trainer Metrics Snapshot

**Purpose:** Capture weekly KPIs for historical tracking

| Metric | Calculation |
|--------|-------------|
| `activeMembers` | COUNT members with status = active |
| `inactiveMembers` | COUNT members with 14 < days ≤ 45 |
| `churnedMembers` | COUNT members with days > 45 |
| `switchedMembers` | COUNT transfers this week |
| `totalMembers` | SUM of above |
| `referrals` | COUNT new referrals this week |
| `retentionRate` | active / total |
| `avgPricePerSession` | AVG of member prices |
| `totalSessions` | From weekly KPI entry |
| `nonSessionHours` | From weekly KPI entry |
| `earnings` | From payroll calculation |
| `approximateRevenue` | sessions × avgPrice |

**App Features:**
- [ ] **Weekly Metrics Snapshot Job**
  - Run every Sunday (or manual trigger)
  - Creates `vt_trainer_metrics` record for each trainer
  - Stores point-in-time data for trends

- [ ] **Trainer Metrics Dashboard**
  - Current week vs previous week comparison
  - Trend charts (retention, sessions, revenue)
  - Leaderboard view

---

## 3️⃣ SESSION & WORK TRACKING

### 3.1 Weekly KPI Entry

**Spreadsheet: KPI 2026**

The KPI sheet tracks per-trainer production each week:

| Section | Fields |
|---------|--------|
| **Session Production** | In Gym Sessions, 90min Session, Release Sessions, Release Modifier, Strength Assessment |
| **Calculated** | Total Sessions, Goal Sessions, Utilization % |
| **Non-Session** | Non-Session Hours, Member Journey Onboarding, Damage Assessment |
| **Calculated** | Total Non-Session Hours, Total Hours Worked |
| **Notes** | Training Agreements sold, Enrollment Fees, Refunds |

**Session Types & Values:**
```
in_gym = 1.0 session
90min = 1.5 sessions (counts as 1.5)
release = 1.0 session
release_modifier = 0.5 session (added to release)
strength_assessment = 1.0 session
member_journey = 0.5 session (non-session category)
damage_assessment = 1.5 sessions (non-session category)
```

**App Features:**
- [ ] **Weekly KPI Entry Page**
  - Select week ending date
  - Grid view: all trainers as rows
  - Columns for each session type
  - Auto-calculate totals and utilization
  - Notes field per trainer

- [ ] **KPI Dashboard**
  - Team total sessions vs goal
  - Team utilization percentage
  - Per-trainer utilization bars
  - Week-over-week comparison

- [ ] **Goal Management**
  - Set session goals per trainer
  - Adjust goals over time
  - Default: from Trainer Metrics sheet

---

## 4️⃣ FINANCIAL MANAGEMENT

### 4.1 Weekly Financials

**Spreadsheet: Financials 2026**

**YTD Totals Section:**
| Metric | Calculation |
|--------|-------------|
| S2S Revenue | SUM of session-to-session revenue |
| CM Revenue | SUM of contracted member revenue |
| Total Revenue | S2S + CM |
| Target Revenue | $1,300,000 annual ($25K/week) |
| Net Profit | Revenue - Expenses |
| Fixed Expenses | Weekly fixed costs ($1,648.35) |
| Net Margin | Net Profit / Revenue |

**Weekly Row Data:**
| Column | App Field | Notes |
|--------|-----------|-------|
| Week Ending | `weekEnding` | Saturday date |
| Total Sessions | `totalSessions` | From KPI |
| 8 wk Average | Computed | Rolling average |
| Goal Sessions | `goalSessions` | Team target |
| Utilization % | Computed | Sessions / Goal |
| S2S Revenue | `s2sRevenue` | Pay-as-you-go revenue |
| CM Revenue | `contractedRevenue` | Contract member revenue |
| Total Revenue | `totalRevenue` | Sum |
| Rev/Session | Computed | Revenue / Sessions |
| Target Revenue | `targetRevenue` | Weekly target |
| Total Payout | `totalPayout` | Sum of trainer pay |
| Fixed Expenses | `fixedExpenses` | Rent, utilities, etc. |
| Total Expenses | `totalExpenses` | Payout + Fixed |
| Net Profit | `netProfit` | Revenue - Expenses |
| Profit Margin | `profitMargin` | Profit / Revenue |
| Payout Ratio | `payoutRatio` | Payout / Revenue |
| Cum. Revenue | Computed | Running total |
| Cum. Target | Computed | Running target |

**App Features:**
- [ ] **Financial Dashboard**
  - YTD summary cards (revenue, profit, margin)
  - Revenue vs Target line chart
  - Cumulative revenue vs target chart
  - Weekly profit trend
  - Payout ratio tracking

- [ ] **Weekly Financial Entry**
  - Auto-pull from KPI (sessions)
  - Auto-pull from Payroll (payout)
  - Manual entry: S2S revenue, CM revenue
  - Fixed expenses (default or override)

- [ ] **Revenue Calculator**
  - Estimate weekly revenue from:
    - Active member count × avg price × avg sessions
  - Compare to actual

### 4.2 Payroll System

**Spreadsheet: Paycheck Calculator 2026**

**Per-Trainer Calculation:**

| Section | Fields | Formula |
|---------|--------|---------|
| **Session Pay** | Total Sessions, Session Rate | Sessions × Rate |
| **Non-Session Pay** | Total Hours, Non-Session Rate | Hours × Rate |
| **S2S Commission** | S2S Revenue share | Revenue × % split |
| **Sales Commission** | Contract sales | From New Members |
| **Leadership Bonus** | Manual | For leads/mentors |
| **Other Bonus** | Manual | Misc bonuses |
| **Total Pay** | Sum | All sections |

**Team Summary (sidebar):**
- Team Total Sessions
- Product Sales
- Termination Fees
- Enrollment Fees
- Total Payout
- S2S Revenue
- CM Revenue

**App Features:**
- [ ] **Payroll Calculator Page**
  - Select week ending date
  - Auto-import from KPI entry:
    - Sessions per trainer
    - Non-session hours per trainer
  - Auto-calculate:
    - Session pay (sessions × rate)
    - Non-session pay (hours × rate)
  - Manual entry:
    - S2S commission amounts
    - Sales commission (from contracts)
    - Bonuses
  - Show totals per trainer and team

- [ ] **Payroll History**
  - View past weeks
  - Compare week-over-week
  - Export for accounting

- [ ] **Commission Calculator**
  - Pull contracts sold this week
  - Apply commission rates automatically
  - Track who sold what

---

## 5️⃣ CONTRACT MANAGEMENT

### 5.1 Contract Tracking

**Spreadsheet: New Members 2025**

**Contract Fields:**
| CSV Column | App Field | Notes |
|------------|-----------|-------|
| Member | `memberId` | Link to member |
| Program Type | `contractType` | training_agreement, price_lock, session_to_session |
| Program Length (Weeks) | `lengthWeeks` | 13, 26, 52, or null |
| Program Price | `pricePerSession` | Per-session rate |
| Weekly Sessions | `weeklySessions` | 1, 2, 3, etc. |
| Contract Start Date | `startDate` | When contract begins |
| Contract End Date | `endDate` | Calculated or manual |
| Monetary Total | `totalValue` | Calculated |
| Commission | `commissionRate` | 5%, 2.5%, or 0% |
| Total | `commissionAmount` | Calculated |
| Initial Trainer | `initialTrainerId` | Who sold it |
| Enrollment Fee | `hasEnrollmentFee` | Yes/No |
| Contract Status | `contractNotes` | Resigned, Upgrade, Downgrade, New |
| Alert Status | `alertStatus` | Initial, Done |

**Contract Type Rules:**
```
Training Agreement:
  - Commission: 5%
  - Requires commitment (13/26/52 weeks)
  - Initial + Final check alerts

Price Lock:
  - Commission: 2.5%
  - Locked rate for duration
  - Same alert structure

Session to Session:
  - Commission: 0%
  - No commitment
  - Enrollment fee required
  - Simpler alerts
```

**Alert Logic (from spreadsheet):**
```
1. Initial Check
   - Triggers: 4+ weeks after start
   - Condition: Alert Status is blank
   - Action: Set to "Initial"

2. Final Check (6-month contracts)
   - Triggers: 12+ weeks after start
   - Condition: Length ≠ 52 AND Status = Initial
   - Action: Set to "Done"

3. Final Check (12-month contracts)
   - Triggers: 26+ weeks after start
   - Condition: Length = 52 AND Status = Initial
   - Action: Set to "Done"

4. Expiring Soon
   - Triggers: 0-14 days before end date
   - Action: Alert trainer/admin

5. Expired
   - Triggers: End date passed
   - Action: Set to "Done"
```

**App Features:**
- [ ] **Contract List Page**
  - Filter by status, type, trainer
  - Sort by end date, start date
  - Alert badges (expiring, needs check)
  - Quick actions: view, edit, renew

- [ ] **Contract Detail Page**
  - All contract info
  - Member link
  - Financial summary
  - Check-in history
  - Renewal options

- [ ] **New Contract Form**
  - Select member (or create new)
  - Contract type dropdown
  - Auto-calculate:
    - End date (start + weeks)
    - Total value (price × sessions × weeks)
    - Commission (total × rate)
  - Enrollment fee checkbox

- [ ] **Contract Alerts Dashboard**
  - Expiring this week
  - Needs initial check
  - Needs final check
  - Recently expired (for follow-up)

- [ ] **Commission Tracking**
  - Weekly sales commission by trainer
  - YTD commission totals
  - Auto-populate payroll

---

## 6️⃣ EXERCISE & PRESCRIPTION SYSTEM

### 6.1 Movement Library

**Spreadsheet: Movement Library**

| CSV Column | App Field | Notes |
|------------|-----------|-------|
| Move Name | `name` | Exercise name |
| Video Link | `videoUrl` | YouTube URL |
| Cues/Notes | `cues` | Array of coaching cues |
| (Category) | `category` | release, stretch, movement |
| (Body Area) | `bodyArea` | Derived from name/category |

**Categories (derived from structure):**
- Soft Tissue Releases
- Stretches
- Movements (Strength/Mobility)

**App Features:**
- [ ] **Exercise Library Page** (exists, needs enhancement)
  - Filter by category, body area
  - Search by name
  - Video preview
  - Copy link for sharing

- [ ] **Exercise Detail Page**
  - Embedded video player
  - Coaching cues list
  - Related exercises
  - Usage stats (how often prescribed)

- [ ] **Exercise Management**
  - Add new exercises
  - Edit cues/notes
  - Upload videos (or link YouTube)
  - Categorize and tag

### 6.2 Mobility Prescriptions

**Spreadsheet: Mobility Prescriptions**

| CSV Column | App Field | Notes |
|------------|-----------|-------|
| Member Name | `memberId` | Link to member |
| Status | `status` | draft, sent, viewed |
| Member Email | From member | For sending |
| Move 1-5 | `exercises` | Junction table |

**App Features:**
- [ ] **Prescription Builder**
  - Select member
  - Search/browse exercises
  - Drag to add (1-5 exercises)
  - Reorder exercises
  - Add notes per exercise
  - Preview before sending

- [ ] **Send Prescription**
  - Generates email with:
    - Member name
    - Exercise list with video links
    - Coaching cues
  - Tracks sent timestamp
  - BCC trainer

- [ ] **Prescription History**
  - View all prescriptions for member
  - See which were viewed
  - Resend option

- [ ] **Prescription Templates**
  - Save common combinations
  - Quick-apply to members

---

## 7️⃣ TASK MANAGEMENT

### 7.1 Command Center

**Spreadsheet: VT Command Center**

| CSV Column | App Field | Notes |
|------------|-----------|-------|
| Tasks | `title` | Task description |
| Owner | `ownerName` or `ownerId` | Who's responsible |
| Priority | `priority` | High, Medium, Low |
| Due Date | `dueDate` | When due |
| Status | `status` | Not Started, In Progress, Upcoming, Done |

**Stats (computed):**
- Active Tasks: COUNT where status ≠ Done
- Completed Tasks: COUNT where status = Done
- Completion %: Completed / Total

**App Features:**
- [ ] **Task Board**
  - Kanban view by status
  - Or list view with filters
  - Quick status change (drag or click)
  - Filter by owner, priority
  - Search tasks

- [ ] **Task Form**
  - Title, description
  - Assign owner (dropdown)
  - Priority selector
  - Due date picker
  - Status selector

- [ ] **My Tasks View**
  - Filter to logged-in user's tasks
  - Sorted by priority/due date
  - Quick complete action

---

## 📅 Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Data import and core CRUD

| Task | Priority | Effort |
|------|----------|--------|
| Update import script for new CSV paths | High | 2 hrs |
| Import all 2026 data | High | 1 hr |
| Verify data relationships | High | 2 hrs |
| Add missing schema fields if needed | Medium | 2 hrs |
| Member CRUD forms (create/edit/delete) | High | 4 hrs |
| Trainer CRUD forms | High | 3 hrs |
| Exercise CRUD forms | Medium | 3 hrs |

### Phase 2: Core Features (Week 2-3)
**Goal:** Session tracking and status automation

| Task | Priority | Effort |
|------|----------|--------|
| Visit/session logging form | High | 4 hrs |
| Auto-update member lastVisitDate | High | 2 hrs |
| Auto-calculate daysSinceVisit | High | 2 hrs |
| Auto-calculate member status | High | 2 hrs |
| Inactive/Churned alerts widget | High | 3 hrs |
| Weekly KPI entry form | High | 6 hrs |
| KPI dashboard with charts | High | 4 hrs |

### Phase 3: Financial Features (Week 3-4)
**Goal:** Payroll and financial tracking

| Task | Priority | Effort |
|------|----------|--------|
| Payroll calculator page | High | 8 hrs |
| Auto-calculate session pay | High | 2 hrs |
| Commission tracking integration | High | 4 hrs |
| Financial dashboard | High | 6 hrs |
| Revenue vs target charts | High | 3 hrs |
| Weekly financial entry form | Medium | 4 hrs |

### Phase 4: Contract System (Week 4-5)
**Goal:** Full contract lifecycle

| Task | Priority | Effort |
|------|----------|--------|
| Contract list page with filters | High | 4 hrs |
| New contract form with auto-calc | High | 5 hrs |
| Contract alerts system | High | 4 hrs |
| Alert status automation | High | 3 hrs |
| Contract renewal flow | Medium | 4 hrs |
| Commission auto-population | Medium | 3 hrs |

### Phase 5: Prescriptions & Tasks (Week 5-6)
**Goal:** Complete feature parity

| Task | Priority | Effort |
|------|----------|--------|
| Prescription builder UI | Medium | 6 hrs |
| Email sending integration | Medium | 4 hrs |
| Prescription templates | Low | 3 hrs |
| Task board (Kanban) | Medium | 5 hrs |
| Task CRUD forms | Medium | 3 hrs |
| My tasks view | Low | 2 hrs |

### Phase 6: Polish & Automation (Week 6-7)
**Goal:** Production-ready

| Task | Priority | Effort |
|------|----------|--------|
| Trainer metrics dashboard | High | 5 hrs |
| Raise/review tracking | Medium | 3 hrs |
| Weekly snapshot automation | Medium | 4 hrs |
| Email notifications | Medium | 4 hrs |
| Mobile responsiveness audit | Medium | 4 hrs |
| Authentication setup | High | 3 hrs |
| Deploy to production | High | 4 hrs |

---

## 📊 Dashboard Specifications

### Main Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  VETTED TRAINERS ADMIN                            [User Menu]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │ 197 Active   │ │ 17 Inactive  │ │ 0 Churned    │ │ $42,771 ││
│  │ Members      │ │ > 14 days    │ │ > 45 days    │ │ YTD Rev ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ THIS WEEK                   │ │ ALERTS                      ││
│  │ Sessions: 300.25 / 436 goal │ │ ⚠️ 5 contracts expiring     ││
│  │ Utilization: 68.86%         │ │ ⚠️ 3 members need check-in  ││
│  │ Revenue: $22,681            │ │ 📋 8 tasks due today         ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ QUICK ACTIONS                                               ││
│  │ [Log Visit] [New Contract] [Send Prescription] [Add Task]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Members] [Trainers] [KPI] [Payroll] [Contracts] [Tasks]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### KPI Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  WEEKLY KPI - Week Ending: 1/11/2026                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Team: 300.25 sessions | 68.86% utilization | Goal: 436        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ TRAINER BREAKDOWN                                           ││
│  │                                                             ││
│  │ Joey Bomango    ████████████████████░░░░ 34/46   73.91%    ││
│  │ Jose Recio      █████████████████████░░░ 35.5/38 93.42%    ││
│  │ Kade Arrington  █████████████████████░░░ 39.5/42 94.05%    ││
│  │ Nick Rispoli    ██████████████████░░░░░░ 28.75/35 82.14%   ││
│  │ Shane Mullen    █████████████████████░░░ 39/40   97.50%    ││
│  │ ...                                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Enter This Week's Data] [View History] [Export]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Financial Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  FINANCIALS - 2026                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ $42,771     │ │ $1.3M       │ │ 3.3%        │ │ 18.50%     ││
│  │ YTD Revenue │ │ Target      │ │ Progress    │ │ Profit Mrg ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ REVENUE vs TARGET (Cumulative)                              ││
│  │                                                    Target ──││
│  │                                               ╱            ││
│  │                                          ╱                 ││
│  │                                     ╱     ── Actual        ││
│  │                                ╱                           ││
│  │                           ╱                                ││
│  │ $50K ─────────────────────                                 ││
│  │      Week 1    Week 2                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ WEEKLY BREAKDOWN                                            ││
│  │ Week    │ Sessions │ Revenue  │ Payout   │ Profit │ Margin ││
│  │ 1/4/26  │ 272.00   │ $20,090  │ $15,105  │ $3,336 │ 16.61% ││
│  │ 1/11/26 │ 300.25   │ $22,681  │ $16,836  │ $4,196 │ 18.50% ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Requirements

### API Endpoints Needed

```
Members:
  GET    /api/members              - List with filters
  GET    /api/members/:id          - Detail with relations
  POST   /api/members              - Create
  PUT    /api/members/:id          - Update
  DELETE /api/members/:id          - Delete
  POST   /api/members/:id/visit    - Log visit

Trainers:
  GET    /api/trainers             - List with metrics
  GET    /api/trainers/:id         - Detail with members
  PUT    /api/trainers/:id         - Update
  GET    /api/trainers/:id/metrics - Historical metrics

KPI:
  GET    /api/kpi                  - List weeks
  GET    /api/kpi/:weekEnding      - Week detail
  POST   /api/kpi                  - Create/update week
  
Payroll:
  GET    /api/payroll              - List periods
  GET    /api/payroll/:weekEnding  - Period detail
  POST   /api/payroll              - Create period
  PUT    /api/payroll/:id          - Update period

Contracts:
  GET    /api/contracts            - List with filters
  GET    /api/contracts/:id        - Detail
  POST   /api/contracts            - Create
  PUT    /api/contracts/:id        - Update
  GET    /api/contracts/alerts     - Pending alerts

Prescriptions:
  GET    /api/prescriptions        - List
  GET    /api/prescriptions/:id    - Detail with exercises
  POST   /api/prescriptions        - Create
  POST   /api/prescriptions/:id/send - Send email

Tasks:
  GET    /api/tasks                - List with filters
  POST   /api/tasks                - Create
  PUT    /api/tasks/:id            - Update
  DELETE /api/tasks/:id            - Delete

Financials:
  GET    /api/financials           - List weeks
  GET    /api/financials/summary   - YTD summary
  POST   /api/financials           - Create/update week
```

### Background Jobs

1. **Daily: Update Member Status**
   - Recalculate `daysSinceVisit` for all members
   - Update status based on thresholds

2. **Daily: Contract Alerts**
   - Check for expiring contracts
   - Update alert statuses
   - Send notifications

3. **Weekly: Trainer Metrics Snapshot**
   - Create metrics record for each trainer
   - Capture point-in-time data

4. **Weekly: Financial Rollup**
   - Calculate cumulative totals
   - Update running averages

---

## ✅ Success Criteria

1. **Data Accuracy**
   - All calculations match spreadsheet formulas
   - No data loss during migration

2. **Feature Completeness**
   - Every spreadsheet function has an app equivalent
   - Users can do everything they did in sheets

3. **Performance**
   - Pages load in < 2 seconds
   - Calculations are instant

4. **Usability**
   - Staff can use without training
   - Mobile-friendly for on-the-go access

5. **Reliability**
   - 99.9% uptime
   - Daily backups
   - No data corruption

---

## 📝 Notes

- All monetary values stored in cents (integer) for precision
- Dates use ISO format (YYYY-MM-DD)
- Week ending dates are always Saturdays
- Commission rates stored as decimals (0.05 = 5%)
- Session values can be fractional (1.5 for 90-min)

---

## 🎉 Completed Work (as of January 2026)

### Website CMS System ✅
- **WYSIWYG Editor** - Tiptap-based rich text editing
- **Image Upload** - Cloudflare R2 integration
- **Version History** - Every edit creates history record in `website_block_history`
- **Version Rollback** - API endpoint to restore previous versions
- **Draft/Publish** - Content saved as drafts, published when ready
- **Vercel Deploy Hook** - One-click publish triggers site rebuild

### Admin Dashboard Features ✅
- **KPI Dashboard** - Weekly metrics with trend charts
- **Financials Page** - YTD charts (Tremor/Recharts)
- **Payroll Calculator** - Per-trainer calculations
- **Contracts Page** - Contract list with alerts
- **Sessions & Visits** - Weekly session tracking
- **Trainer Detail Pages** - Profiles with metrics

### Data Import ✅
- Member Tracker 2026
- Trainer Metrics 2026
- KPI 2026
- Financials 2026
- New Members 2025 (Contracts)
- Movement Library

---

*Document created: January 25, 2026*
*Last updated: January 28, 2026*
