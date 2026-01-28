/**
 * Website Content Schema
 * 
 * Database tables for the WYSIWYG website builder.
 * Single-tenant version for Vetted Trainers.
 */

import { pgTable, text, timestamp, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";

// Block types enum
export const websiteBlockTypeEnum = pgEnum("website_block_type", [
  "hero",
  "text",
  "heading",
  "image",
  "gallery",
  "cta",
  "two_column",
  "quote",
  "divider",
  "video",
  "testimonials",
  "services",
  "custom",
]);

// Website Pages
export const websitePages = pgTable("website_pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(), // "home", "about", "services", etc.
  title: text("title").notNull(),
  description: text("description"),
  template: text("template").default("default"), // Template name for layout
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Website Blocks - individual content blocks on a page (simplified for direct lookup)
export const websiteBlocks = pgTable("website_blocks", {
  id: text("id").primaryKey(),
  
  // Simple lookup keys (e.g., pageSlug="home", blockId="hero-headline")
  pageSlug: text("page_slug").notNull(), // "home", "about", "services", etc.
  blockId: text("block_id").notNull(), // "hero-headline", "mission-title", etc.
  
  // Block type
  type: text("type").notNull(), // Block type: "text", "image", etc.
  
  // Content (Tiptap JSON for rich text, or structured data for other blocks)
  content: jsonb("content").$type<{
    // For text/heading blocks - Tiptap JSON
    doc?: object;
    // For image blocks
    src?: string;
    alt?: string;
    caption?: string;
    // For CTA blocks
    text?: string;
    href?: string;
    variant?: string;
    // For gallery blocks
    images?: Array<{ src: string; alt: string; caption?: string }>;
    // For quote blocks
    quote?: string;
    author?: string;
    // Generic text content (fallback)
    html?: string;
  }>(),
  
  // Settings (styles, layout options)
  settings: jsonb("settings").$type<{
    alignment?: "left" | "center" | "right";
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    maxWidth?: string;
    className?: string;
  }>(),
  
  // Versioning - current version number
  version: integer("version").notNull().default(1),
  
  // Publishing status
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Website Block History - version history for rollback and audit
export const websiteBlockHistory = pgTable("website_block_history", {
  id: text("id").primaryKey(),
  blockId: text("block_id").notNull(), // References the block's blockId
  pageSlug: text("page_slug").notNull(),
  
  version: integer("version").notNull(),
  content: jsonb("content"),
  settings: jsonb("settings"),
  
  // Who made the change
  editedBy: text("edited_by"),
  editedAt: timestamp("edited_at").defaultNow(),
  
  // Optional change notes
  changeNotes: text("change_notes"),
});

// Website Settings - global settings for the website
export const websiteSettings = pgTable("website_settings", {
  id: text("id").primaryKey().default("default"), // Single row for the VT website
  
  // Theme settings
  theme: jsonb("theme").$type<{
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    headingFontFamily?: string;
  }>(),
  
  // Navigation
  navigation: jsonb("navigation").$type<{
    items: Array<{
      label: string;
      href: string;
      children?: Array<{ label: string; href: string }>;
    }>;
  }>(),
  
  // Footer
  footer: jsonb("footer").$type<{
    content?: object; // Tiptap JSON
    links?: Array<{ label: string; href: string }>;
    socialLinks?: Array<{ platform: string; url: string }>;
  }>(),
  
  // SEO defaults
  seo: jsonb("seo").$type<{
    defaultTitle?: string;
    titleTemplate?: string; // e.g., "%s | Vetted Trainers"
    defaultDescription?: string;
    ogImage?: string;
  }>(),
  
  // Analytics
  analytics: jsonb("analytics").$type<{
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Website Templates - reusable page templates
export const websiteTemplates = pgTable("website_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "Landing Page", "About Page", etc.
  description: text("description"),
  
  // Template structure - list of block definitions
  blocks: jsonb("blocks").$type<Array<{
    blockId: string;
    type: string;
    defaultContent?: object;
    settings?: object;
  }>>(),
  
  // Preview image
  thumbnailUrl: text("thumbnail_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Types
export type WebsitePage = typeof websitePages.$inferSelect;
export type NewWebsitePage = typeof websitePages.$inferInsert;
export type WebsiteBlock = typeof websiteBlocks.$inferSelect;
export type NewWebsiteBlock = typeof websiteBlocks.$inferInsert;
export type WebsiteBlockHistory = typeof websiteBlockHistory.$inferSelect;
export type NewWebsiteBlockHistory = typeof websiteBlockHistory.$inferInsert;
export type WebsiteTemplate = typeof websiteTemplates.$inferSelect;
export type NewWebsiteTemplate = typeof websiteTemplates.$inferInsert;
export type WebsiteSettingsType = typeof websiteSettings.$inferSelect;
export type NewWebsiteSettings = typeof websiteSettings.$inferInsert;
