# Vetted Trainers App

A comprehensive monorepo for Vetted Trainers, featuring an admin dashboard, public website with CMS capabilities, and client portal.

## 🏗️ Project Structure

```
vetted-trainers-app/
├── apps/
│   ├── admin/          # Admin dashboard + Website CMS (port 3000)
│   ├── website/        # Public website (port 3001) - reads from DB
│   └── client/         # Member portal scaffold (port 3002)
├── packages/
│   ├── db/             # Drizzle ORM schemas & database client
│   ├── auth/           # Better Auth configuration
│   └── ui/             # Shared shadcn/ui components
├── scripts/            # Data import scripts
├── data/               # Business data CSV files
├── .env                # Environment variables
└── R2_SETUP.md         # Cloudflare R2 setup guide
```

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
│                         MONOREPO FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   apps/admin (port 3000)           apps/website (port 3001)         │
│   ┌─────────────────────┐         ┌─────────────────────┐          │
│   │ Admin Dashboard     │         │ Public Website      │          │
│   │ • KPI & Financials  │         │ • Reads PUBLISHED   │          │
│   │ • Members/Trainers  │         │   content from DB   │          │
│   │ • Website CMS       │         │ • Deployed to       │          │
│   │ • PUBLISH → ────────┼────────►│   Vercel            │          │
│   └─────────────────────┘         └─────────────────────┘          │
│            │                                ▲                       │
│            │ Save/Publish                   │ Rebuild               │
│            ▼                                │                       │
│   ┌──────────────────────────────────┐     │                       │
│   │         packages/db              │     │                       │
│   │ • website_blocks (current)       │     │                       │
│   │ • website_block_history (old)    │     │                       │
│   │ • members, trainers, sessions    │     │                       │
│   └──────────────────────────────────┘     │                       │
│            │                                │                       │
│            └──── Vercel Deploy Hook ───────┘                       │
│                                                                      │
│   apps/client (port 3002)                                           │
│   ┌─────────────────────┐                                          │
│   │ Client Portal       │                                          │
│   │ • Member login      │                                          │
│   │ • View workouts     │                                          │
│   │ • Track progress    │                                          │
│   └─────────────────────┘                                          │
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
| Website CMS | 3000 | `http://localhost:3000/website` | WYSIWYG editor |
| Public Website | 3001 | `http://localhost:3001` | Production website |
| Client Portal | 3002 | `http://localhost:3002` | Member portal |

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
- [ ] **Configure R2** - Set up Cloudflare R2 for image uploads (see `R2_SETUP.md`)
- [ ] **Deploy to Vercel** - Configure production environment variables
- [ ] **Add member CRUD** - Create/edit/delete members in admin
- [ ] **Add trainer CRUD** - Create/edit/delete trainers in admin

### Medium Priority
- [ ] **Version History UI** - Show version timeline in CMS with restore button
- [ ] **Task board (Kanban)** - Visual task management for admins
- [ ] **Trainer-client messaging** - Simple chat thread between trainer and client
- [ ] **Mobile optimization** - Responsive design improvements

### Low Priority
- [ ] **Advanced analytics** - Additional business metrics and reporting
- [ ] **Progress photo uploads** - Client-submitted progress photos
- [ ] **Automated reminders** - Session reminders and follow-up notifications

### ✅ Recently Completed
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
