# Vetted Trainers - Feature Mapping

## Quick Reference: Spreadsheet → App Features

This document maps every spreadsheet function to its app equivalent.

---

## 📋 Member Tracker → Member Management

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Member list with trainer/price | Members list page | ✅ Built |
| Last Visit date | Auto-updated on session log | 🔨 To Build |
| Days Since calculation | Computed field (`TODAY - lastVisit`) | 🔨 To Build |
| Status (Active/Inactive/Churned) | Auto-calculated from Days Since | 🔨 To Build |
| Inactive > 14 days filter | Dashboard widget + filter | 🔨 To Build |
| Churned > 45 days filter | Dashboard widget + filter | 🔨 To Build |
| Switched Member tracking | Member transfer history | 🔨 To Build |
| Trainer assignment | Trainer dropdown on member | ✅ Built |
| Price per Session | Member field | ✅ Built |
| Email | Member field | ✅ Built |
| Referred By | Member field | ✅ Built |

---

## 👤 Trainer Metrics → Trainer Management

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Trainer list | Trainers page | ✅ Built |
| Active/Inactive/Churned member counts | Computed from members | 🔨 To Build |
| Total Members count | Computed from members | 🔨 To Build |
| Referrals count | Computed from member referrals | 🔨 To Build |
| Retention % | Computed (active/total) | 🔨 To Build |
| Avg. Price/Session | Computed from assigned members | 🔨 To Build |
| Sessions this week | From KPI entry | 🔨 To Build |
| Non-Sessions this week | From KPI entry | 🔨 To Build |
| Earnings | From payroll calculation | 🔨 To Build |
| Approx. Revenue | Computed (sessions × avg price) | 🔨 To Build |
| Last Raise Date | Trainer field | ✅ In Schema |
| 6-Mo Check In date | Computed (raise + 6 months) | 🔨 To Build |
| 12-Mo Pay Review date | Computed (raise + 12 months) | 🔨 To Build |
| Raise Status (✅/⚠️) | Computed from review dates | 🔨 To Build |
| Session Rate | Trainer field | ✅ In Schema |
| Non-Session Rate | Trainer field | ✅ In Schema |
| Raise Impact Calculator | Financial tool | 🔨 To Build |

---

## 📊 KPI Sheet → Session Tracking

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Week Ending selector | Week picker dropdown | 🔨 To Build |
| In Gym Sessions per trainer | Session entry form | 🔨 To Build |
| 90min Sessions (1.5x) | Session type with value | ✅ In Schema |
| Release Sessions | Session type | ✅ In Schema |
| Release Modifier (+0.5) | Session value adjustment | ✅ In Schema |
| Strength Assessment | Session type | ✅ In Schema |
| Total Sessions per trainer | Computed sum | 🔨 To Build |
| Goal Sessions per trainer | Trainer setting | ✅ In Schema |
| Utilization % | Computed (actual/goal) | 🔨 To Build |
| Non-Session Hours | Non-session entry | ✅ In Schema |
| Member Journey (.5) | Non-session type | 🔨 To Build |
| Damage Assessment (1.5) | Non-session type | 🔨 To Build |
| Total Hours Worked | Computed sum | 🔨 To Build |
| Weekly Notes | Notes field | 🔨 To Build |
| Team Total Sessions | Dashboard stat | 🔨 To Build |
| Team Utilization Rate | Dashboard stat | 🔨 To Build |

---

## 💰 Financials → Financial Dashboard

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| YTD S2S Revenue | Computed sum | 🔨 To Build |
| YTD CM Revenue | Computed sum | 🔨 To Build |
| YTD Total Revenue | Computed sum | 🔨 To Build |
| Target Revenue ($1.3M) | Configuration setting | 🔨 To Build |
| YTD Net Profit | Computed (revenue - expenses) | 🔨 To Build |
| Fixed Expenses | Weekly configuration | 🔨 To Build |
| Net Margin | Computed (profit/revenue) | 🔨 To Build |
| Weekly breakdown table | Financials list page | 🔨 To Build |
| 8-week rolling average | Computed | 🔨 To Build |
| Revenue per Session | Computed | 🔨 To Build |
| Payout Ratio | Computed (payout/revenue) | 🔨 To Build |
| Cumulative Revenue chart | Line chart | 🔨 To Build |
| Cumulative vs Target chart | Comparison chart | 🔨 To Build |

---

## 💵 Paycheck Calculator → Payroll System

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Week Ending selector | Week picker | 🔨 To Build |
| Total Sessions per trainer | From KPI | 🔨 To Build |
| Session Rate per trainer | Trainer field | ✅ In Schema |
| Session Pay Subtotal | Computed (sessions × rate) | 🔨 To Build |
| Non-Session Hours | From KPI | 🔨 To Build |
| Non-Session Rate | Trainer field | ✅ In Schema |
| Hourly Pay Subtotal | Computed (hours × rate) | 🔨 To Build |
| S2S Commission | Manual/computed entry | ✅ In Schema |
| Sales Commission | From contracts | 🔨 To Build |
| Leadership Bonus | Manual entry | ✅ In Schema |
| Other Bonus | Manual entry | ✅ In Schema |
| Total Pay per trainer | Computed sum | 🔨 To Build |
| Team Total Sessions | Sum stat | 🔨 To Build |
| Product Sales | Entry field | 🔨 To Build |
| Termination Fees | Entry field | 🔨 To Build |
| Enrollment Fees | Entry field | 🔨 To Build |
| Total Payout | Sum of all trainer pay | 🔨 To Build |
| S2S Revenue | Entry/computed | ✅ In Schema |
| CM Revenue | Entry/computed | ✅ In Schema |

---

## 📄 New Members → Contract Management

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Week grouping | Filter by week sold | 🔨 To Build |
| Member name | Link to member | ✅ In Schema |
| Program Type | Contract type enum | ✅ In Schema |
| Program Length (Weeks) | Length field | ✅ In Schema |
| Program Price | Price per session | ✅ In Schema |
| Weekly Sessions | Sessions field | ✅ In Schema |
| Contract Start Date | Start date | ✅ In Schema |
| Contract End Date | End date (computed) | ✅ In Schema |
| Monetary Total | Computed (price × sessions × weeks) | ✅ In Schema |
| Commission % | Based on contract type | ✅ In Schema |
| Commission Total | Computed (total × rate) | ✅ In Schema |
| Initial Trainer | Trainer who sold | ✅ In Schema |
| Enrollment Fee | Boolean flag | ✅ In Schema |
| Contract Status | Notes field | ✅ In Schema |
| Alert Status | Status enum | ✅ In Schema |
| YTD Commission | Computed sum | 🔨 To Build |
| Sales Commission per week | Computed | 🔨 To Build |
| Initial Check alert | Automated at 4 weeks | 🔨 To Build |
| Final Check alert | Automated at 3/6 months | 🔨 To Build |
| Expiring Soon alert | Automated at 14 days | 🔨 To Build |
| Expired auto-update | Automated when past | 🔨 To Build |

---

## 🏋️ Movement Library → Exercise Database

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Move Name | Exercise name | ✅ In Schema |
| Video Link | Video URL (YouTube) | ✅ In Schema |
| Cues/Notes | Cues array | ✅ In Schema |
| Category headers | Category enum | ✅ In Schema |
| (Soft Tissue Releases) | category: "release" | ✅ In Schema |
| (Stretches) | category: "stretch" | ✅ In Schema |
| (Movements) | category: "mobility" | ✅ In Schema |
| Video embed | YouTube player | 🔨 To Build |
| Exercise search | Search by name | ✅ Built |
| Filter by category | Category filter | 🔨 To Build |

---

## 📧 Mobility Prescriptions → Prescription System

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Member Name | Link to member | ✅ In Schema |
| Status (SENT/draft) | Status enum | ✅ In Schema |
| Member Email | From member record | ✅ In Schema |
| Move 1-5 | Junction table (5 exercises) | ✅ In Schema |
| Send email | Email integration | 🔨 To Build |
| BCC trainer | Email config | 🔨 To Build |
| Prescription builder UI | Drag-drop interface | 🔨 To Build |
| View sent prescriptions | Prescription history | 🔨 To Build |

---

## ✅ VT Command Center → Task Management

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Task title | Title field | ✅ In Schema |
| Owner | Owner field/relation | ✅ In Schema |
| Priority (High/Med/Low) | Priority enum | ✅ In Schema |
| Due Date | Due date field | ✅ In Schema |
| Status | Status enum | ✅ In Schema |
| Active Tasks count | Computed | 🔨 To Build |
| Completed Tasks count | Computed | 🔨 To Build |
| Completion % | Computed | 🔨 To Build |
| Task board/Kanban | Kanban view | 🔨 To Build |
| My Tasks filter | User filter | 🔨 To Build |

---

## 📈 Visits Sheet → Session Log

| Spreadsheet Feature | App Feature | Status |
|---------------------|-------------|--------|
| Last Visit date | Session date | ✅ In Schema |
| Member | Member relation | ✅ In Schema |
| Trainer | Trainer relation | ✅ In Schema |
| Price per Session | Price at time | ✅ In Schema |
| Referred By | On member record | ✅ In Schema |
| Quick log visit | Visit logger form | 🔨 To Build |
| Auto-update member status | Trigger/job | 🔨 To Build |

---

---

## 🌐 Website CMS → Content Management

| Feature | App Feature | Status |
|---------|-------------|--------|
| WYSIWYG Editor | Tiptap rich text editing | ✅ Built |
| Image Upload | R2 integration for media | ✅ Built |
| Version History | Auto-saves previous versions | ✅ Built |
| Version Rollback | Restore previous version API | ✅ Built |
| Draft System | Save as draft before publish | ✅ Built |
| Publish Button | Mark drafts as published | ✅ Built |
| Vercel Deploy Hook | Trigger rebuild on publish | ✅ Built |
| Public Site Integration | Website reads from DB | ✅ Built |
| Version History UI | Timeline view of changes | 🔨 To Build |

---

## Summary Stats

| Category | Total Features | In Schema | Built | To Build |
|----------|----------------|-----------|-------|----------|
| Member Management | 11 | 9 | 5 | 6 |
| Trainer Management | 17 | 6 | 4 | 13 |
| Session Tracking (KPI) | 17 | 5 | 5 | 12 |
| Financial Dashboard | 14 | 14 | 8 | 6 |
| Payroll System | 18 | 8 | 6 | 12 |
| Contract Management | 22 | 14 | 4 | 18 |
| Exercise Database | 10 | 6 | 3 | 4 |
| Prescription System | 8 | 5 | 0 | 8 |
| Task Management | 11 | 5 | 0 | 11 |
| Session Log | 6 | 5 | 4 | 2 |
| Website CMS | 9 | 9 | 8 | 1 |
| **TOTAL** | **143** | **86** | **47** | **93** |

---

## Priority Order for Implementation

### ✅ Completed Features
1. ~~Member status auto-calculation~~ ✅
2. ~~Visit/session logging~~ ✅
3. ~~Inactive/churned alerts widget~~ ✅
4. ~~Weekly KPI entry & dashboard~~ ✅
5. ~~Payroll calculator~~ ✅
6. ~~Contract management page~~ ✅
7. ~~Financial dashboard with charts~~ ✅
8. ~~Trainer detail pages~~ ✅
9. ~~Website CMS with WYSIWYG~~ ✅
10. ~~Version history & rollback~~ ✅
11. ~~Draft/Publish system~~ ✅
12. ~~Vercel Deploy Hook integration~~ ✅

### 🔴 High Priority (Next)
- [ ] Member CRUD forms (create/edit/delete)
- [ ] Trainer CRUD forms
- [ ] Version history UI in CMS
- [ ] Authentication setup

### 🟡 Medium Priority
- [ ] Task board (Kanban)
- [ ] Prescription builder
- [ ] Email integration
- [ ] Mobile optimization

### 🟢 Lower Priority
- [ ] Advanced analytics
- [ ] Automated alerts/notifications
- [ ] Client portal features

---

*This document tracks feature parity between the spreadsheet system and the web app.*
