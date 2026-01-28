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
