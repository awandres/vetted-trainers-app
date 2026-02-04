-- Add super_admin role and access control fields
-- This migration adds time-limited access controls for demo/trial users

-- Add new columns for access control
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "access_duration_minutes" integer;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "access_expires_at" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "access_disabled" boolean DEFAULT false;
