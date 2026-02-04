-- Add login tracking columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_attempt_at" timestamp with time zone;
