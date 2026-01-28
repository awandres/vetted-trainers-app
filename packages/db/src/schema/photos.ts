import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { createId } from "../utils";

// Photo category enum values
export const photoCategories = [
  "uncategorized",
  "trainer",
  "facility",
  "marketing",
  "team",
  "other",
] as const;
export type PhotoCategory = (typeof photoCategories)[number];

// Photos table (uploaded assets for website/profiles)
export const photos = pgTable("photos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  uploadedBy: text("uploaded_by")
    .references(() => users.id)
    .notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(), // R2 object key for deletion
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  // Category
  category: text("category", { enum: photoCategories }).default("uncategorized"),
  
  // Tags - flexible tagging system
  tags: json("tags").$type<string[]>().default([]),
  
  // Metadata
  altText: text("alt_text"),
  notes: text("notes"),
  width: integer("width"),
  height: integer("height"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Photo relations
export const photosRelations = relations(photos, ({ one }) => ({
  uploader: one(users, {
    fields: [photos.uploadedBy],
    references: [users.id],
  }),
}));

// Infer types from schema
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
