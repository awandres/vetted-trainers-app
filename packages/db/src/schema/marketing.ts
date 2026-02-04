import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createId } from "../utils";

// =============================================================================
// EMAIL CAMPAIGNS
// =============================================================================

// Campaign statuses
export const campaignStatuses = ["draft", "scheduled", "sending", "sent", "failed"] as const;
export type CampaignStatus = (typeof campaignStatuses)[number];

// Email campaigns - marketing email campaigns
export const vtEmailCampaigns = pgTable("vt_email_campaigns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Campaign details
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  
  // Template & content
  templateType: text("template_type").notNull().default("newsletter"), // newsletter, promotion, reminder
  templateData: jsonb("template_data").$type<Record<string, unknown>>(), // Template-specific props
  
  // Audience
  audienceType: text("audience_type").notNull().default("all"), // all, active, inactive, new, custom
  audienceFilter: jsonb("audience_filter").$type<Record<string, unknown>>(), // Custom filter criteria
  
  // Status & scheduling
  status: text("status").notNull().default("draft").$type<CampaignStatus>(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  
  // Stats (updated after send)
  recipientCount: integer("recipient_count").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  bouncedCount: integer("bounced_count").default(0),
  unsubscribedCount: integer("unsubscribed_count").default(0),
  
  // Metadata
  createdById: text("created_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// EMAIL EVENTS (Tracking)
// =============================================================================

// Event types
export const emailEventTypes = [
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "complained",
  "unsubscribed",
] as const;
export type EmailEventType = (typeof emailEventTypes)[number];

// Email events - individual email tracking events
export const vtEmailEvents = pgTable("vt_email_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // References
  campaignId: text("campaign_id")
    .references(() => vtEmailCampaigns.id, { onDelete: "cascade" })
    .notNull(),
  recipientEmail: text("recipient_email").notNull(),
  memberId: text("member_id"), // Optional link to member

  // Event details
  eventType: text("event_type").notNull().$type<EmailEventType>(),
  resendMessageId: text("resend_message_id"), // Resend's message ID
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(), // Additional event data (e.g., click URL)
  
  // Timestamps
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
});

// =============================================================================
// AUTOMATED EMAILS (Transactional/Triggered)
// =============================================================================

// Trigger types for automated emails
export const automatedEmailTriggers = [
  "session_booked",        // When a session is scheduled
  "session_reminder_24h",  // 24 hours before a session
  "session_reminder_1h",   // 1 hour before a session
  "session_completed",     // After a session is marked complete
  "session_cancelled",     // When a session is cancelled
  "session_rescheduled",   // When a session is rescheduled
  "prescription_sent",     // When a prescription is sent
  "welcome_new_member",    // When a new member joins
  "membership_expiring",   // When membership is about to expire
  "inactivity_reminder",   // When member hasn't visited in X days
  "birthday",              // On member's birthday
  "custom",                // Custom trigger (manual)
] as const;
export type AutomatedEmailTrigger = (typeof automatedEmailTriggers)[number];

// Trigger modes
export const triggerModes = ["always", "optional", "disabled"] as const;
export type TriggerMode = (typeof triggerModes)[number];

// Automated email templates - system-triggered emails
export const vtAutomatedEmails = pgTable("vt_automated_emails", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Identity
  name: text("name").notNull(),
  description: text("description"),
  
  // Trigger configuration
  trigger: text("trigger").notNull().$type<AutomatedEmailTrigger>(),
  triggerMode: text("trigger_mode").notNull().default("optional").$type<TriggerMode>(),
  
  // Email content
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  templateType: text("template_type").notNull().default("reminder"), // newsletter, promotion, reminder
  templateData: jsonb("template_data").$type<Record<string, unknown>>(),
  
  // Timing (for reminder triggers)
  delayMinutes: integer("delay_minutes").default(0), // Delay after trigger event
  
  // Status
  isActive: boolean("is_active").default(true),
  
  // Test mode - when enabled, emails only go to testEmails instead of actual recipient
  testMode: boolean("test_mode").default(false),
  testEmails: text("test_emails"), // Comma-separated list of test email addresses
  
  // Stats
  sentCount: integer("sent_count").default(0),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  
  // Metadata
  createdById: text("created_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Automated email logs - track each triggered send
export const vtAutomatedEmailLogs = pgTable("vt_automated_email_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // References
  automatedEmailId: text("automated_email_id")
    .references(() => vtAutomatedEmails.id, { onDelete: "cascade" })
    .notNull(),
  recipientEmail: text("recipient_email").notNull(),
  memberId: text("member_id"),
  
  // Trigger context
  triggerData: jsonb("trigger_data").$type<Record<string, unknown>>(), // e.g., sessionId
  
  // Status
  status: text("status").notNull().default("pending"), // pending, sent, failed
  errorMessage: text("error_message"),
  resendMessageId: text("resend_message_id"),
  
  // Timestamps
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

// =============================================================================
// EMAIL TEMPLATES (Saved templates)
// =============================================================================

// Saved email templates for reuse
export const vtEmailTemplates = pgTable("vt_email_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
  description: text("description"),
  
  // Template content
  templateType: text("template_type").notNull().default("newsletter"),
  templateData: jsonb("template_data").$type<Record<string, unknown>>(),
  
  // Usage
  isDefault: boolean("is_default").default(false),
  usageCount: integer("usage_count").default(0),
  
  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
