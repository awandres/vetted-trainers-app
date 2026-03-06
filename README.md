# Personal Trainers App

A comprehensive monorepo for personal training businesses, featuring an admin dashboard, public website with CMS capabilities, and client portal.

## 🏗️ Project Structure

```
vetted-trainers-app/
├── apps/
│   ├── admin/          # Unified app: Admin + Trainer + Client Portal (port 3000)
│   │   ├── /           # Admin/Trainer dashboard (role-based)
│   │   ├── /portal/*   # Client member portal
│   │   └── /login      # Universal login (redirects by role)
│   ├── website/        # Public website (port 3001) - reads from DB
│   └── client/         # [LEGACY] Standalone client portal (deprecated)
├── packages/
│   ├── db/             # Drizzle ORM schemas & database client
│   ├── auth/           # Better Auth configuration
│   └── ui/             # Shared shadcn/ui components
├── scripts/            # Data import scripts
├── data/               # Business data CSV files
├── .env                # Environment variables
└── R2_SETUP.md         # Cloudflare R2 setup guide
```

## 🔀 Unified App Architecture

The application is now consolidated into a single Next.js app (`apps/admin`) for easier deployment:

| Role | Login Redirect | Available Routes |
|------|---------------|------------------|
| `super_admin` | `/` (Dashboard) | All admin routes |
| `admin` | `/` (Dashboard) | All admin routes |
| `trainer` | `/` (Dashboard) | Admin routes + trainer-specific views |
| `member` | `/portal` | Portal routes only |

### Route Structure
```
/login           → Universal login page
/                → Admin dashboard (requires admin/trainer role)
/portal          → Member dashboard
/portal/sessions → Member session history
/portal/prescriptions → Member prescriptions
/portal/contract → Member contract view
/portal/account  → Member account settings
```

### Benefits of Unified Architecture
- ✅ **Single Vercel deployment** - One URL for everything
- ✅ **No CORS issues** - Same-origin authentication
- ✅ **Simpler maintenance** - One codebase to update
- ✅ **Role-based routing** - Automatic redirect after login

## ✅ Features

### Admin Dashboard (`/`)
- **KPI Dashboard** - Weekly performance metrics with trend charts
- **Members Management** - View and manage all gym members
- **Trainers Management** - View trainer profiles, rates, and assignments
- **Sessions & Visits** - Log and track training sessions
- **Payroll Calculator** - Track trainer compensation by period
- **Contracts** - Member contract management with alerts
- **Financials** - YTD revenue charts and expense tracking
- **Exercises Library** - Browse and manage exercise database with filters
- **Prescriptions** - Visual workout builder with templates

### Trainer Dashboard (`/` for trainer role)
- **My Clients** - View assigned clients with status indicators
- **My Sessions** - Week view of upcoming sessions with stats
- **Tasks & Reminders** - Auto-generated client follow-up reminders
- **My Payroll** - Personal earnings summary and history

### Prescription Builder (`/prescriptions/new`)
- **Visual Builder** - Drag-and-drop exercise selection
- **Workout Templates** - Save and reuse prescription templates
- **Set/Rep Configuration** - Customize sets, reps, duration per exercise
- **Client Delivery** - Send prescriptions directly to clients

### Marketing Module (`/marketing`)
- **Campaign Builder** - Create email campaigns with templates
- **Template Types** - Newsletter, Promotion, and Reminder templates
- **Audience Segmentation** - Target by Active, Inactive, New, or Churned
- **Scheduled Campaigns** - Schedule emails for future delivery
- **Campaign Analytics** - Track opens, clicks, bounces

### Website CMS (`/website`)
- **WYSIWYG Editor** - Rich text editing with Tiptap
- **Version History** - All edits saved with full rollback capability
- **Draft/Publish System** - Stage changes before going live
- **Image Upload** - Cloudflare R2 integration for media
- **One-Click Publish** - Deploys changes to live site via Vercel

### Client Portal (`apps/client/` - port 3002)
- **Member Dashboard** - Personalized welcome with stats
- **My Prescriptions** - View assigned workouts with videos
- **Session History** - Past sessions grouped by month
- **Progress Tracking** - Achievements and activity stats

### Public Website (`apps/website/`)
- **Home** - Hero section, services overview, testimonials, Google reviews
- **Services** - Private gym training, weight loss programs, virtual training
- **Personal Trainers** - Team grid with Vagaro scheduling links
- **About** - Leadership bios, team overview, company philosophy
- **Join Our Team** - Career opportunities and application info

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UNIFIED APP ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   apps/admin (port 3000)           apps/website (port 3001)         │
│   ┌─────────────────────┐         ┌─────────────────────┐          │
│   │ UNIFIED DASHBOARD   │         │ Public Website      │          │
│   │                     │         │                     │          │
│   │ /login → redirects  │         │ • Reads PUBLISHED   │          │
│   │   ├─ admin/trainer  │         │   content from DB   │          │
│   │   │   → /dashboard  │         │ • Deployed to       │          │
│   │   └─ member         │         │   Vercel            │          │
│   │       → /portal     │         │                     │          │
│   │                     │         │                     │          │
│   │ Routes:             │         │                     │          │
│   │ • / (admin dash)    │────────►│                     │          │
│   │ • /portal (member)  │ PUBLISH │                     │          │
│   │ • /website (CMS)    │         │                     │          │
│   │ • /marketing        │         │                     │          │
│   │ • /members, etc.    │         │                     │          │
│   └─────────────────────┘         └─────────────────────┘          │
│            │                                ▲                       │
│            │ Save/Publish                   │ Rebuild               │
│            ▼                                │                       │
│   ┌──────────────────────────────────┐     │                       │
│   │         packages/db              │     │                       │
│   │ • website_blocks (current)       │     │                       │
│   │ • website_block_history (old)    │     │                       │
│   │ • members, trainers, sessions    │     │                       │
│   │ • users (role-based access)      │     │                       │
│   └──────────────────────────────────┘     │                       │
│            │                                │                       │
│            └──── Vercel Deploy Hook ───────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🖊️ Website CMS System

### How It Works

1. **Edit** - Navigate to `/website` in admin, click "Edit Page"
2. **Stage** - Click any text to edit, changes are staged locally
3. **Save** - Click "Save Changes" to persist drafts to database
4. **Publish** - Click "Publish X drafts" to mark content as live
5. **Deploy** - Publishing triggers Vercel rebuild via Deploy Hook

### Version History

Every edit creates a history record:
- Previous content stored in `website_block_history`
- Full rollback capability via restore API
- Version numbers increment automatically

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/website/blocks` | GET | Fetch block content |
| `/api/website/blocks` | POST | Save content (creates version history) |
| `/api/website/blocks/history` | GET | Get version history for a block |
| `/api/website/blocks/restore` | POST | Restore a previous version |
| `/api/website/publish` | GET | Check draft/publish status |
| `/api/website/publish` | POST | Publish drafts + trigger deploy |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Neon PostgreSQL database

### Installation

```bash
# Clone the repository
cd vetted-trainers-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other credentials

# Push database schema
pnpm db:push

# Seed the database (optional, if you have CSV data)
pnpm seed

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudflare R2 (for image uploads)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="vetted-trainers-uploads"
R2_PUBLIC_URL=""

# Vercel Deploy Hook (for publishing website changes)
VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/xxxxxxxx"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="Vetted Trainers <noreply@yourdomain.com>"

# Cron Security (optional - for Vercel Cron)
CRON_SECRET="your-cron-secret"
```

### Setting Up Vercel Deploy Hook

1. Go to Vercel Dashboard → Your Website Project
2. Navigate to Settings → Git → Deploy Hooks
3. Create a hook named "website-content-update"
4. Copy the URL and add it to your `.env` as `VERCEL_DEPLOY_HOOK_URL`

### Development Commands

```bash
# Start all apps in development mode
pnpm dev

# Start specific apps
pnpm dev:admin    # Admin dashboard only
pnpm dev:website  # Public website only
pnpm dev:client   # Client portal only

# Database operations
pnpm db:push      # Push schema changes
pnpm db:generate  # Generate migrations
pnpm db:studio    # Open Drizzle Studio

# Data import
pnpm seed         # Import data from CSV files
```

## 📱 App URLs

| App | Port | URL | Description |
|-----|------|-----|-------------|
| Admin Dashboard | 3000 | `http://localhost:3000` | Main admin interface |
| Client Portal | 3000 | `http://localhost:3000/portal` | Member portal (integrated) |
| Website CMS | 3000 | `http://localhost:3000/website` | WYSIWYG editor |
| Public Website | 3001 | `http://localhost:3001` | Production website |

**Note:** The client portal is now integrated into the admin app. Members are automatically redirected to `/portal` after login.

## 🔑 Demo Accounts

The login page includes quick-access buttons for demo accounts. All demo accounts use password: `demo123`

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | `admin@demo-trainers.com` | `demo123` | Full dashboard access |
| Trainer | `trainer@demo-trainers.com` | `demo123` | Trainer dashboard with sample clients |
| Member | `member@demo-trainers.com` | `demo123` | Client portal with sessions & prescriptions |

### Setting Up Demo Accounts

```bash
# Start the dev server first
pnpm dev

# In a separate terminal, seed the demo accounts
npx tsx scripts/seed-demo-accounts.ts
```

This creates all three demo accounts with linked trainer/member records and sample data.

## 🎨 Theme System

The admin dashboard includes a theme toggle (palette icon in header) with 3 options:

| Theme | Description |
|-------|-------------|
| **Classic Green** | Light theme with green accents |
| **Blue** | Light theme with cyan blue accents |
| **Graphite** | Dark graphite background with cyan blue (default) |

Themes persist in localStorage and apply instantly without page reload.

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: pnpm + Turborepo
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: Tremor + Recharts
- **Rich Text Editor**: Tiptap
- **Email**: Resend + React Email
- **File Storage**: Cloudflare R2
- **Deployment**: Vercel (with Cron support)

## 📁 Key Files

| File | Description |
|------|-------------|
| `packages/db/src/schema/` | Database schema definitions |
| `packages/db/src/schema/website.ts` | Website CMS schema (blocks, history, templates) |
| `apps/admin/src/app/website/page.tsx` | Website homepage with WYSIWYG |
| `apps/admin/src/components/website/` | Editable components |
| `apps/admin/src/app/api/website/` | Website CMS API routes |
| `apps/website/src/lib/content.ts` | Public site content utilities |
| `scripts/import-data.ts` | CSV data import script |

## 📊 Database Schema

### Core Business Tables
- **vtMembers** - Gym members with contact info and status
- **vtTrainers** - Personal trainers with schedules and rates
- **vtSessions** - Training session logs
- **vtPayrollPeriods** - Weekly payroll periods
- **vtPayrollDetails** - Per-trainer payroll data
- **vtContracts** - Member contracts
- **vtFinancials** - Weekly financial data
- **vtExercises** - Exercise library

### Website CMS Tables
- **websiteBlocks** - Current content with version number
- **websiteBlockHistory** - Previous versions for rollback
- **websitePages** - Page metadata
- **websiteSettings** - Global site settings
- **websiteTemplates** - Page templates (future)

### Auth Tables
- **users** - Admin and client accounts
- **sessions** - Active sessions
- **accounts** - OAuth connections

## 🚧 Remaining TODOs

### High Priority
- [ ] **Trainer-Scoped Navigation** - Show trainer-specific menu when trainers login (members, sessions, contracts, exercises, prescriptions, payroll - all scoped to their clients only). Currently shows full admin menu.
- [ ] **Configure R2** - Set up Cloudflare R2 for image uploads (see `R2_SETUP.md`)
- [ ] **Add member CRUD** - Create/edit/delete members in admin
- [ ] **Add trainer CRUD** - Create/edit/delete trainers in admin

### Medium Priority
- [ ] **Version History UI** - Show version timeline in CMS with restore button
- [ ] **Task board (Kanban)** - Visual task management for admins
- [ ] **Trainer-client messaging** - Simple chat thread between trainer and client
- [ ] **Mobile optimization** - Responsive design improvements
- [ ] **Email Click Tracking** - Set up Resend webhooks for click/open tracking and CTR stats on automated emails

### Low Priority
- [ ] **Advanced analytics** - Additional business metrics and reporting
- [ ] **Progress photo uploads** - Client-submitted progress photos
- [ ] **Automated reminders** - Session reminders and follow-up notifications

### ✅ Recently Completed (Feb 4, 2026)
- [x] **Unified App Architecture** - Consolidated admin, trainer, and client portals into single deployment
- [x] **Role-Based Routing** - Automatic redirect after login based on user role
- [x] **Integrated Portal** - Member portal accessible at `/portal` within admin app
- [x] **Time-Limited Access** - Demo access control with automatic expiration
- [x] **Automated Emails** - Trigger-based transactional emails (session booked, reminders, etc.)
- [x] **Test Mode for Automated Emails** - Route emails to test addresses before going live
- [x] **Send History Logs** - View last 50 triggered sends with status and test mode indicator
- [x] **Live Email Preview** - Real-time preview in campaign builder as you type
- [x] **Email Template Branding** - VT logo, blue accent colors, centered social icons

### ✅ Recently Completed (Feb 3, 2026)
- [x] **Theme Toggle System** - Switch between Classic Green, VT Blue, and VT Graphite themes
- [x] **Website Headline Restored** - Fixed CMS content with proper cyan highlighting
- [x] **Demo Trainer Account** - `demo-trainer@vettedtrainers.com` / `demo123!`
- [x] **Upcoming Sessions on Dashboard** - Shows trainer's scheduled sessions
- [x] **Sessions Calculation Fix** - Fixed decimal string concatenation bug on My Sessions page
- [x] **Dev Autofill Button** - Quick demo data fill for prescription builder
- [x] **Template System Fix** - Fixed API error, added expandable exercise preview
- [x] **Exercise Detail Modal** - Click exercise name to view description, video, and cues

### ✅ Previously Completed
- [x] **Trainer Dashboard** - Role-based dashboard with my clients, sessions, tasks
- [x] **Prescription Builder** - Visual workout builder with templates
- [x] **Marketing Module** - Email campaigns with scheduling and analytics
- [x] **Client Portal** - Member login, prescriptions, sessions, progress
- [x] **Scheduled Campaigns** - Date/time picker with cron processing

## 🔒 Security Notes

- Keep `.env` files out of version control
- Use strong secrets for `BETTER_AUTH_SECRET`
- Enable R2 bucket CORS for production domains
- Set up proper authentication before deploying
- Restrict Deploy Hook URL access

## 📝 License

Private - Vetted Trainers LLC

---

Built with ❤️ for Vetted Trainers in Frederick, Maryland
