# Unified App Architecture Plan

This document outlines the plan for restructuring the Vetted Trainers app into a single unified application for cleaner deployment and demo purposes.

## Goal

Consolidate the three separate apps (admin, website, client) into a single Next.js application with the following URL structure:

| URL | Purpose |
|-----|---------|
| `/` | Public website homepage |
| `/services` | Services page |
| `/personal-trainers` | Meet the trainers |
| `/about` | About page |
| `/join-our-team` | Careers page |
| `/login` | Client login → Member portal |
| `/admin` | Staff login → Admin/Trainer dashboard |
| `/portal` | Member portal (after login) |

## Architecture

### Route Structure

```
apps/admin/src/app/
├── (public)/              # Website pages - no auth required
│   ├── page.tsx           # Homepage
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── personal-trainers/page.tsx
│   └── join-our-team/page.tsx
├── login/page.tsx         # Client login
├── admin/
│   ├── login/page.tsx     # Admin/Trainer login
│   ├── (protected)/       # Route group with auth layout
│   │   ├── layout.tsx     # Auth check for admin/trainer roles
│   │   ├── page.tsx       # Dashboard
│   │   ├── members/
│   │   ├── trainers/
│   │   ├── marketing/
│   │   └── ...other admin pages
├── portal/
│   ├── layout.tsx         # Auth check for member role
│   ├── page.tsx           # Client dashboard
│   ├── prescriptions/
│   ├── sessions/
│   └── progress/
├── api/                   # All API routes
└── layout.tsx             # Root layout
```

### Key Implementation Notes

1. **Route Groups**: Use `(public)` and `(protected)` route groups to separate auth requirements
2. **Nested Layouts**: Auth checks go in layout.tsx files within protected route groups
3. **Components**: Create `components/public/` for website components (VTNavigation, VTFooter)
4. **API Routes**: Keep at `/api/` level, add `/api/portal/` for client-specific endpoints

## Demo Accounts

When implemented, create these demo accounts via seed script:

| Account | Email | Password | Portal |
|---------|-------|----------|--------|
| DEMO Admin | demo-admin@vettedtrainers.com | demo123! | `/admin` |
| DEMO Trainer 1 | demo-trainer1@vettedtrainers.com | demo123! | `/admin` |
| DEMO Trainer 2 | demo-trainer2@vettedtrainers.com | demo123! | `/admin` |
| DEMO Client | demo-client@vettedtrainers.com | demo123! | `/portal` |

The DEMO Client should be linked to DEMO Trainer 1 in the vtMembers table.

## Execution Steps

### Phase 1: Create Public Website Pages
- Copy website pages to `(public)/` route group
- Create VTNavigation and VTFooter components
- Ensure images are available in public folder

### Phase 2: Create Client Portal
- Create `/portal/` with auth-protected layout
- Create portal API routes (`/api/portal/me`, `/api/portal/prescriptions`, etc.)
- Build portal pages (dashboard, prescriptions, sessions, progress)

### Phase 3: Restructure Admin
- Move admin pages to `/admin/(protected)/`
- Create admin login at `/admin/login/` (outside protected group)
- Update all internal links to use `/admin/` prefix

### Phase 4: Create Demo Accounts
- Create seed script at `scripts/seed-demo-accounts.ts`
- Use better-auth API to create accounts with passwords
- Link demo client to demo trainer

### Phase 5: Test All Flows
- Test public website navigation
- Test client login → portal flow
- Test admin login → dashboard flow
- Test trainer login → trainer dashboard flow

## Benefits

- Single deployment to Vercel
- Single domain (vettedtrainers.com)
- Shared auth context (no cross-origin cookie issues)
- Simpler maintenance
- Better SEO for public pages

## Status

**Not Implemented** - This plan was created but not fully executed due to complexity and time constraints. The current architecture with separate apps remains in place.

---

Created: February 2026
