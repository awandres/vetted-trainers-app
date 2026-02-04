import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createId } from "../utils";

// VT-specific user roles
// - super_admin: Owner/highest level access (can manage other admins)
// - admin: Full CRM access + website editing
// - trainer: Limited CRM (their members only)
// - member: Client portal only
export const userRoles = ["super_admin", "admin", "trainer", "member"] as const;
export type UserRole = (typeof userRoles)[number];

// Users table
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  
  // VT role (super_admin, admin, trainer, member)
  role: text("role", { enum: userRoles }).default("member").notNull(),
  
  // Link to trainer record (for trainer role users)
  trainerId: text("trainer_id"),
  
  // Link to member record (for member role users)
  memberId: text("member_id"),
  
  // Account status
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  
  // Time-limited access (for demo/trial users)
  // When set, user will be auto-logged out after this duration (in minutes) from login
  accessDurationMinutes: integer("access_duration_minutes"),
  // When set, user cannot access the app after this timestamp
  accessExpiresAt: timestamp("access_expires_at", { withTimezone: true }),
  // Flag to quickly disable access
  accessDisabled: boolean("access_disabled").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Infer types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
