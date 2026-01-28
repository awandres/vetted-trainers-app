import { pgTable, text, timestamp, integer, boolean, decimal, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { createId } from "../utils";

// =============================================================================
// VETTED TRAINERS - FITNESS BUSINESS MANAGEMENT
// =============================================================================
// Single-tenant schema for Vetted Trainers gym management

// =============================================================================
// VT MEMBERS
// =============================================================================

// Member status based on days since last visit
export const vtMemberStatuses = [
  "active",      // Visited within 14 days
  "inactive",    // 14-45 days since last visit
  "churned",     // >45 days since last visit
  "paused",      // Temporarily on hold (vacation, injury)
] as const;
export type VTMemberStatus = (typeof vtMemberStatuses)[number];

// VT Members - gym clients
export const vtMembers = pgTable("vt_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Basic info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  
  // Assigned trainer
  trainerId: text("trainer_id")
    .references(() => vtTrainers.id, { onDelete: "set null" }),
  
  // Pricing (per-member custom pricing)
  pricePerSession: integer("price_per_session"), // In cents (e.g., 7500 = $75.00)
  
  // Status tracking
  status: text("status", { enum: vtMemberStatuses }).default("active").notNull(),
  lastVisitDate: date("last_visit_date"),
  daysSinceVisit: integer("days_since_visit"), // Computed/cached
  
  // Referral tracking
  referredBy: text("referred_by"), // Name or member reference
  referredByMemberId: text("referred_by_member_id")
    .references((): any => vtMembers.id, { onDelete: "set null" }),
  
  // Notes and metadata
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT TRAINERS
// =============================================================================

// VT Trainers - staff members who train clients
export const vtTrainers = pgTable("vt_trainers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Link to user account (optional)
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  
  // Basic info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  
  // Pay rates (in cents)
  sessionRate: integer("session_rate").notNull().default(3000), // Per session pay
  nonSessionRate: integer("non_session_rate").notNull().default(3000), // Hourly non-session
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Raise tracking
  lastRaiseDate: date("last_raise_date"),
  sixMonthReviewDate: date("six_month_review_date"),
  twelveMonthReviewDate: date("twelve_month_review_date"),
  
  // Profile
  bio: text("bio"),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT CONTRACTS (Membership Agreements)
// =============================================================================

// Contract/program types
export const vtContractTypes = [
  "training_agreement",  // 5% commission, requires commitment
  "price_lock",          // 2.5% commission, locked rate
  "session_to_session",  // 0% commission, pay as you go
] as const;
export type VTContractType = (typeof vtContractTypes)[number];

// Contract status
export const vtContractStatuses = [
  "active",
  "expiring_soon",  // Within 14 days of end
  "expired",
  "renewed",
  "cancelled",
] as const;
export type VTContractStatus = (typeof vtContractStatuses)[number];

// Alert/check status for follow-ups
export const vtContractAlertStatuses = [
  "initial",   // Initial check needed
  "done",      // All checks complete
] as const;
export type VTContractAlertStatus = (typeof vtContractAlertStatuses)[number];

// VT Contracts - membership agreements
export const vtContracts = pgTable("vt_contracts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Member and trainer
  memberId: text("member_id")
    .references(() => vtMembers.id, { onDelete: "cascade" })
    .notNull(),
  initialTrainerId: text("initial_trainer_id")
    .references(() => vtTrainers.id, { onDelete: "set null" }),
  
  // Contract type and terms
  contractType: text("contract_type", { enum: vtContractTypes }).notNull(),
  lengthWeeks: integer("length_weeks"), // 13, 26, 52, or null for S2S
  
  // Pricing
  pricePerSession: integer("price_per_session").notNull(), // In cents
  weeklySessions: integer("weekly_sessions").default(1),
  
  // Dates
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  
  // Financial
  totalValue: integer("total_value"), // In cents (calculated)
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }), // 0.025 or 0.05
  commissionAmount: integer("commission_amount"), // In cents
  
  // Enrollment
  hasEnrollmentFee: boolean("has_enrollment_fee").default(false),
  enrollmentFeeAmount: integer("enrollment_fee_amount"), // In cents
  
  // Status
  status: text("status", { enum: vtContractStatuses }).default("active").notNull(),
  alertStatus: text("alert_status", { enum: vtContractAlertStatuses }).default("initial"),
  
  // Contract status notes (Resigned, Upgrade, Downgrade, New Contract)
  contractNotes: text("contract_notes"),
  
  // Week this contract was sold (for commission tracking)
  soldWeekEnding: date("sold_week_ending"),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT SESSIONS (Individual Training Sessions)
// =============================================================================

// Session types
export const vtSessionTypes = [
  "in_gym",              // Standard in-gym session
  "ninety_minute",       // Extended 90-min session (counts as 1.5)
  "release",             // Release session
  "strength_assessment", // Initial assessment
  "damage_assessment",   // DA session
  "member_journey",      // Onboarding session
] as const;
export type VTSessionType = (typeof vtSessionTypes)[number];

// VT Sessions - individual session records
export const vtSessions = pgTable("vt_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Member and trainer
  memberId: text("member_id")
    .references(() => vtMembers.id, { onDelete: "set null" }),
  trainerId: text("trainer_id")
    .references(() => vtTrainers.id, { onDelete: "set null" })
    .notNull(),
  
  // Session details
  sessionDate: date("session_date").notNull(),
  sessionType: text("session_type", { enum: vtSessionTypes }).default("in_gym").notNull(),
  
  // Session value (for payroll)
  sessionValue: decimal("session_value", { precision: 4, scale: 2 }).default("1.0"), // 1.0, 1.5, 0.5 etc
  
  // Pricing (captured at time of session)
  priceCharged: integer("price_charged"), // In cents
  
  // For payroll grouping
  weekEnding: date("week_ending"),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT NON-SESSION HOURS (Non-training work)
// =============================================================================

// VT Non-Session Hours - admin, training, meetings, etc.
export const vtNonSessionHours = pgTable("vt_non_session_hours", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Trainer
  trainerId: text("trainer_id")
    .references(() => vtTrainers.id, { onDelete: "cascade" })
    .notNull(),
  
  // Hours
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  
  // Date and payroll period
  workDate: date("work_date").notNull(),
  weekEnding: date("week_ending"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT PAYROLL PERIODS (Weekly Summaries)
// =============================================================================

// Payroll period status
export const vtPayrollStatuses = [
  "draft",     // Being calculated
  "review",    // Ready for review
  "approved",  // Approved for payment
  "paid",      // Paid out
] as const;
export type VTPayrollStatus = (typeof vtPayrollStatuses)[number];

// VT Payroll Periods - weekly payroll summaries
export const vtPayrollPeriods = pgTable("vt_payroll_periods", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Period
  weekEnding: date("week_ending").notNull(),
  
  // Aggregate metrics
  totalSessions: decimal("total_sessions", { precision: 6, scale: 2 }),
  goalSessions: integer("goal_sessions"),
  utilizationRate: decimal("utilization_rate", { precision: 5, scale: 4 }), // 0.6239 = 62.39%
  
  // Revenue (in cents)
  s2sRevenue: integer("s2s_revenue"),           // Session-to-session
  contractedRevenue: integer("contracted_revenue"), // CM (Contracted Member) Revenue
  totalRevenue: integer("total_revenue"),
  targetRevenue: integer("target_revenue"),
  
  // Expenses (in cents)
  totalPayout: integer("total_payout"),
  fixedExpenses: integer("fixed_expenses"),
  totalExpenses: integer("total_expenses"),
  
  // Profit (in cents)
  netProfit: integer("net_profit"),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 4 }),
  payoutRatio: decimal("payout_ratio", { precision: 5, scale: 4 }),
  
  // Additional revenue items
  productSales: integer("product_sales"),
  terminationFees: integer("termination_fees"),
  enrollmentFees: integer("enrollment_fees"),
  
  // Status
  status: text("status", { enum: vtPayrollStatuses }).default("draft").notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedByUserId: text("approved_by_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT PAYROLL DETAILS (Per-Trainer Weekly Pay)
// =============================================================================

// VT Payroll Details - per-trainer breakdown
export const vtPayrollDetails = pgTable("vt_payroll_details", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Links
  payrollPeriodId: text("payroll_period_id")
    .references(() => vtPayrollPeriods.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: text("trainer_id")
    .references(() => vtTrainers.id, { onDelete: "cascade" })
    .notNull(),
  
  // Session pay
  totalSessions: decimal("total_sessions", { precision: 5, scale: 2 }),
  goalSessions: integer("goal_sessions"),
  utilizationRate: decimal("utilization_rate", { precision: 5, scale: 4 }),
  sessionRate: integer("session_rate"), // In cents (captured at time)
  sessionPaySubtotal: integer("session_pay_subtotal"), // In cents
  
  // Non-session pay
  nonSessionHours: decimal("non_session_hours", { precision: 5, scale: 2 }),
  nonSessionRate: integer("non_session_rate"), // In cents
  nonSessionPaySubtotal: integer("non_session_pay_subtotal"), // In cents
  
  // Commissions and bonuses (in cents)
  s2sCommission: integer("s2s_commission"),
  salesCommission: integer("sales_commission"),
  leadershipBonus: integer("leadership_bonus"),
  otherBonus: integer("other_bonus"),
  bonusSubtotal: integer("bonus_subtotal"),
  
  // Total pay
  totalPay: integer("total_pay"), // In cents
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT TRAINER METRICS (KPI Snapshots)
// =============================================================================

// VT Trainer Metrics - weekly KPI snapshots per trainer
export const vtTrainerMetrics = pgTable("vt_trainer_metrics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Links
  trainerId: text("trainer_id")
    .references(() => vtTrainers.id, { onDelete: "cascade" })
    .notNull(),
  weekEnding: date("week_ending").notNull(),
  
  // Member counts
  activeMembers: integer("active_members"),
  inactiveMembers: integer("inactive_members"), // >14 days
  churnedMembers: integer("churned_members"),   // >45 days
  switchedMembers: integer("switched_members"), // Transferred to/from
  totalMembers: integer("total_members"),
  
  // Performance
  referrals: integer("referrals"),
  retentionRate: decimal("retention_rate", { precision: 5, scale: 4 }),
  avgPricePerSession: integer("avg_price_per_session"), // In cents
  
  // Session data
  totalSessions: decimal("total_sessions", { precision: 5, scale: 2 }),
  nonSessionHours: decimal("non_session_hours", { precision: 5, scale: 2 }),
  
  // Financial
  earnings: integer("earnings"), // In cents
  approximateRevenue: integer("approximate_revenue"), // In cents
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT EXERCISES (Mobility/Stretch Library)
// =============================================================================

// Exercise categories
export const vtExerciseCategories = [
  "release",      // Foam rolling, lacrosse ball work
  "stretch",      // Static stretches
  "sequence",     // Multi-movement flows
  "activation",   // Muscle activation exercises
  "mobility",     // Joint mobility work
] as const;
export type VTExerciseCategory = (typeof vtExerciseCategories)[number];

// Body areas
export const vtBodyAreas = [
  "lower_body",
  "upper_body",
  "core",
  "full_body",
  "hips",
  "shoulders",
  "spine",
  "feet_ankles",
] as const;
export type VTBodyArea = (typeof vtBodyAreas)[number];

// VT Exercises - exercise/mobility library
export const vtExercises = pgTable("vt_exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Basic info
  name: text("name").notNull(),
  category: text("category", { enum: vtExerciseCategories }).default("release").notNull(),
  bodyArea: text("body_area", { enum: vtBodyAreas }),
  
  // Instructions
  description: text("description"),
  cues: jsonb("cues").$type<string[]>().default([]), // Coaching cues
  
  // Media
  videoUrl: text("video_url"), // YouTube link
  thumbnailUrl: text("thumbnail_url"),
  
  // Difficulty
  difficultyLevel: integer("difficulty_level").default(1), // 1-3
  
  // Organization
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// VT PRESCRIPTIONS (Exercise Assignments)
// =============================================================================

// Prescription status
export const vtPrescriptionStatuses = [
  "draft",
  "sent",
  "viewed",
] as const;
export type VTPrescriptionStatus = (typeof vtPrescriptionStatuses)[number];

// VT Prescriptions - exercises assigned to members
export const vtPrescriptions = pgTable("vt_prescriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Member
  memberId: text("member_id")
    .references(() => vtMembers.id, { onDelete: "cascade" })
    .notNull(),
  
  // Prescribed by
  prescribedByTrainerId: text("prescribed_by_trainer_id")
    .references(() => vtTrainers.id, { onDelete: "set null" }),
  
  // Status
  status: text("status", { enum: vtPrescriptionStatuses }).default("draft").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// VT Prescription Exercises - junction table for prescription -> exercises
export const vtPrescriptionExercises = pgTable("vt_prescription_exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Links
  prescriptionId: text("prescription_id")
    .references(() => vtPrescriptions.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: text("exercise_id")
    .references(() => vtExercises.id, { onDelete: "cascade" })
    .notNull(),
  
  // Order (1-5)
  orderIndex: integer("order_index").notNull().default(0),
  
  // Optional notes specific to this prescription
  notes: text("notes"),
});

// =============================================================================
// VT TASKS (Command Center)
// =============================================================================

// Task priority
export const vtTaskPriorities = [
  "high",
  "medium",
  "low",
] as const;
export type VTTaskPriority = (typeof vtTaskPriorities)[number];

// Task status
export const vtTaskStatuses = [
  "not_started",
  "in_progress",
  "upcoming",
  "done",
] as const;
export type VTTaskStatus = (typeof vtTaskStatuses)[number];

// VT Tasks - internal task management
export const vtTasks = pgTable("vt_tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Task info
  title: text("title").notNull(),
  description: text("description"),
  
  // Assignment
  ownerId: text("owner_id")
    .references(() => vtTrainers.id, { onDelete: "set null" }),
  ownerName: text("owner_name"), // For when owner isn't a trainer (e.g., "Joel")
  
  // Priority and status
  priority: text("priority", { enum: vtTaskPriorities }),
  status: text("status", { enum: vtTaskStatuses }).default("not_started").notNull(),
  
  // Dates
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// RELATIONS
// =============================================================================

// VT Member relations
export const vtMembersRelations = relations(vtMembers, ({ one, many }) => ({
  trainer: one(vtTrainers, {
    fields: [vtMembers.trainerId],
    references: [vtTrainers.id],
  }),
  referrer: one(vtMembers, {
    fields: [vtMembers.referredByMemberId],
    references: [vtMembers.id],
  }),
  contracts: many(vtContracts),
  sessions: many(vtSessions),
  prescriptions: many(vtPrescriptions),
}));

// VT Trainer relations
export const vtTrainersRelations = relations(vtTrainers, ({ one, many }) => ({
  user: one(users, {
    fields: [vtTrainers.userId],
    references: [users.id],
  }),
  members: many(vtMembers),
  contracts: many(vtContracts),
  sessions: many(vtSessions),
  nonSessionHours: many(vtNonSessionHours),
  payrollDetails: many(vtPayrollDetails),
  metrics: many(vtTrainerMetrics),
  prescriptions: many(vtPrescriptions),
  tasks: many(vtTasks),
}));

// VT Contract relations
export const vtContractsRelations = relations(vtContracts, ({ one }) => ({
  member: one(vtMembers, {
    fields: [vtContracts.memberId],
    references: [vtMembers.id],
  }),
  initialTrainer: one(vtTrainers, {
    fields: [vtContracts.initialTrainerId],
    references: [vtTrainers.id],
  }),
}));

// VT Session relations
export const vtSessionsRelations = relations(vtSessions, ({ one }) => ({
  member: one(vtMembers, {
    fields: [vtSessions.memberId],
    references: [vtMembers.id],
  }),
  trainer: one(vtTrainers, {
    fields: [vtSessions.trainerId],
    references: [vtTrainers.id],
  }),
}));

// VT Non-Session Hours relations
export const vtNonSessionHoursRelations = relations(vtNonSessionHours, ({ one }) => ({
  trainer: one(vtTrainers, {
    fields: [vtNonSessionHours.trainerId],
    references: [vtTrainers.id],
  }),
}));

// VT Payroll Period relations
export const vtPayrollPeriodsRelations = relations(vtPayrollPeriods, ({ one, many }) => ({
  approvedByUser: one(users, {
    fields: [vtPayrollPeriods.approvedByUserId],
    references: [users.id],
  }),
  details: many(vtPayrollDetails),
}));

// VT Payroll Details relations
export const vtPayrollDetailsRelations = relations(vtPayrollDetails, ({ one }) => ({
  payrollPeriod: one(vtPayrollPeriods, {
    fields: [vtPayrollDetails.payrollPeriodId],
    references: [vtPayrollPeriods.id],
  }),
  trainer: one(vtTrainers, {
    fields: [vtPayrollDetails.trainerId],
    references: [vtTrainers.id],
  }),
}));

// VT Trainer Metrics relations
export const vtTrainerMetricsRelations = relations(vtTrainerMetrics, ({ one }) => ({
  trainer: one(vtTrainers, {
    fields: [vtTrainerMetrics.trainerId],
    references: [vtTrainers.id],
  }),
}));

// VT Exercise relations
export const vtExercisesRelations = relations(vtExercises, ({ many }) => ({
  prescriptionExercises: many(vtPrescriptionExercises),
}));

// VT Prescription relations
export const vtPrescriptionsRelations = relations(vtPrescriptions, ({ one, many }) => ({
  member: one(vtMembers, {
    fields: [vtPrescriptions.memberId],
    references: [vtMembers.id],
  }),
  prescribedByTrainer: one(vtTrainers, {
    fields: [vtPrescriptions.prescribedByTrainerId],
    references: [vtTrainers.id],
  }),
  exercises: many(vtPrescriptionExercises),
}));

// VT Prescription Exercises relations
export const vtPrescriptionExercisesRelations = relations(vtPrescriptionExercises, ({ one }) => ({
  prescription: one(vtPrescriptions, {
    fields: [vtPrescriptionExercises.prescriptionId],
    references: [vtPrescriptions.id],
  }),
  exercise: one(vtExercises, {
    fields: [vtPrescriptionExercises.exerciseId],
    references: [vtExercises.id],
  }),
}));

// VT Task relations
export const vtTasksRelations = relations(vtTasks, ({ one }) => ({
  owner: one(vtTrainers, {
    fields: [vtTasks.ownerId],
    references: [vtTrainers.id],
  }),
}));

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type VTMember = typeof vtMembers.$inferSelect;
export type NewVTMember = typeof vtMembers.$inferInsert;

export type VTTrainer = typeof vtTrainers.$inferSelect;
export type NewVTTrainer = typeof vtTrainers.$inferInsert;

export type VTContract = typeof vtContracts.$inferSelect;
export type NewVTContract = typeof vtContracts.$inferInsert;

export type VTSession = typeof vtSessions.$inferSelect;
export type NewVTSession = typeof vtSessions.$inferInsert;

export type VTNonSessionHours = typeof vtNonSessionHours.$inferSelect;
export type NewVTNonSessionHours = typeof vtNonSessionHours.$inferInsert;

export type VTPayrollPeriod = typeof vtPayrollPeriods.$inferSelect;
export type NewVTPayrollPeriod = typeof vtPayrollPeriods.$inferInsert;

export type VTPayrollDetails = typeof vtPayrollDetails.$inferSelect;
export type NewVTPayrollDetails = typeof vtPayrollDetails.$inferInsert;

export type VTTrainerMetrics = typeof vtTrainerMetrics.$inferSelect;
export type NewVTTrainerMetrics = typeof vtTrainerMetrics.$inferInsert;

export type VTExercise = typeof vtExercises.$inferSelect;
export type NewVTExercise = typeof vtExercises.$inferInsert;

export type VTPrescription = typeof vtPrescriptions.$inferSelect;
export type NewVTPrescription = typeof vtPrescriptions.$inferInsert;

export type VTPrescriptionExercise = typeof vtPrescriptionExercises.$inferSelect;
export type NewVTPrescriptionExercise = typeof vtPrescriptionExercises.$inferInsert;

export type VTTask = typeof vtTasks.$inferSelect;
export type NewVTTask = typeof vtTasks.$inferInsert;
