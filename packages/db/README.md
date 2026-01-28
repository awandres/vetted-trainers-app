# @vt/db - Database Package

Shared database layer for Vetted Trainers applications using Drizzle ORM with Neon PostgreSQL.

## Installation

This package is internal to the monorepo and is installed automatically.

```bash
pnpm install
```

## Usage

```typescript
import { db, vtMembers, vtTrainers, eq } from "@vt/db";

// Query members
const members = await db.select().from(vtMembers);

// Query with relations
const member = await db
  .select()
  .from(vtMembers)
  .where(eq(vtMembers.id, "member-id"))
  .limit(1);
```

## Schema Overview

### Core Business Tables

| Table | Description |
|-------|-------------|
| `vtMembers` | Gym members with trainer assignments |
| `vtTrainers` | Personal trainers with rates and schedules |
| `vtSessions` | Training session logs |
| `vtPayrollPeriods` | Weekly payroll periods |
| `vtPayrollDetails` | Per-trainer payroll data |
| `vtContracts` | Member contracts and agreements |
| `vtFinancials` | Weekly financial summaries |
| `vtExercises` | Exercise library |
| `vtPrescriptions` | Member exercise prescriptions |
| `vtTrainerMetrics` | Weekly trainer performance snapshots |

### Website CMS Tables

| Table | Description |
|-------|-------------|
| `websitePages` | Page metadata and settings |
| `websiteBlocks` | Current content blocks with version tracking |
| `websiteBlockHistory` | Previous versions for rollback |
| `websiteSettings` | Global site settings |
| `websiteTemplates` | Page templates (future) |

### Auth Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `sessions` | Active sessions |
| `accounts` | OAuth connections |
| `verifications` | Email/phone verification |

## Website CMS Schema Detail

### `websiteBlocks`

Stores current content for each editable block:

```typescript
{
  id: string;           // Unique ID (CUID)
  pageSlug: string;     // Page identifier (e.g., "home")
  blockId: string;      // Block identifier (e.g., "hero-headline")
  type: "text" | "image" | "hero" | "gallery" | "testimonial" | "stats" | "cta";
  content: {            // JSONB content
    doc?: object;       // Tiptap document
    html?: string;      // Rendered HTML
    src?: string;       // Image source
    alt?: string;       // Image alt text
  };
  settings: object;     // Block-specific settings
  version: number;      // Current version number
  isPublished: boolean; // Draft vs published
  publishedAt: Date;    // Last publish timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

### `websiteBlockHistory`

Stores previous versions for rollback:

```typescript
{
  id: string;
  blockId: string;      // References websiteBlocks.blockId
  pageSlug: string;     // References websiteBlocks.pageSlug
  version: number;      // Version number at time of save
  content: object;      // Content at this version
  settings: object;     // Settings at this version
  editedBy: string;     // User who made the edit (optional)
  editedAt: Date;       // When this version was created
  changeNotes: string;  // Optional notes about the change
}
```

## Commands

```bash
# Push schema to database
pnpm db:push

# Generate migrations
pnpm db:generate

# Open Drizzle Studio
pnpm db:studio
```

## Configuration

Requires `DATABASE_URL` environment variable:

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

## File Structure

```
packages/db/
├── drizzle/           # Generated migrations
├── src/
│   ├── client.ts      # Database client setup
│   ├── index.ts       # Main exports
│   ├── utils.ts       # Utilities (createId, slugify)
│   └── schema/
│       ├── index.ts   # Schema barrel export
│       ├── auth.ts    # Authentication tables
│       ├── users.ts   # User tables
│       ├── fitness.ts # Business tables (members, trainers, etc.)
│       ├── photos.ts  # Photo storage tables
│       └── website.ts # Website CMS tables
├── drizzle.config.ts  # Drizzle configuration
├── package.json
└── tsconfig.json
```

## Exports

The package exports:
- `db` - Database client instance
- All schema tables (e.g., `vtMembers`, `websiteBlocks`)
- All type definitions (e.g., `Member`, `WebsiteBlock`)
- Drizzle operators (`eq`, `and`, `or`, `desc`, etc.)
- Utilities (`createId`, `slugify`)
