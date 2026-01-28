// Database package main entry point for Vetted Trainers

// Re-export client
export { db, type Database } from "./client";

// Re-export all schemas
export * from "./schema";

// Re-export utilities
export { createId, slugify } from "./utils";

// Re-export commonly used drizzle-orm functions
export { eq, and, or, not, desc, asc, sql, gt, gte, lt, lte, like, ilike, inArray, count } from "drizzle-orm";
