CREATE TABLE IF NOT EXISTS "vt_workout_template_exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"sets" integer DEFAULT 3,
	"reps" text,
	"duration" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vt_workout_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by_trainer_id" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vt_automated_email_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"automated_email_id" text NOT NULL,
	"recipient_email" text NOT NULL,
	"member_id" text,
	"trigger_data" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"resend_message_id" text,
	"triggered_at" timestamp with time zone DEFAULT now(),
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vt_automated_emails" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger" text NOT NULL,
	"trigger_mode" text DEFAULT 'optional' NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text,
	"template_type" text DEFAULT 'reminder' NOT NULL,
	"template_data" jsonb,
	"delay_minutes" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"sent_count" integer DEFAULT 0,
	"last_sent_at" timestamp with time zone,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vt_email_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text,
	"template_type" text DEFAULT 'newsletter' NOT NULL,
	"template_data" jsonb,
	"audience_type" text DEFAULT 'all' NOT NULL,
	"audience_filter" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"recipient_count" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"bounced_count" integer DEFAULT 0,
	"unsubscribed_count" integer DEFAULT 0,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vt_email_events" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"recipient_email" text NOT NULL,
	"member_id" text,
	"event_type" text NOT NULL,
	"resend_message_id" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vt_email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template_type" text DEFAULT 'newsletter' NOT NULL,
	"template_data" jsonb,
	"is_default" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vt_members" ADD COLUMN "email_opt_out" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vt_members" ADD COLUMN "email_opt_out_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vt_prescription_exercises" ADD COLUMN "sets" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "vt_prescription_exercises" ADD COLUMN "reps" text;--> statement-breakpoint
ALTER TABLE "vt_prescription_exercises" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "vt_prescriptions" ADD COLUMN "name" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vt_workout_template_exercises" ADD CONSTRAINT "vt_workout_template_exercises_template_id_vt_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."vt_workout_templates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vt_workout_template_exercises" ADD CONSTRAINT "vt_workout_template_exercises_exercise_id_vt_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."vt_exercises"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vt_workout_templates" ADD CONSTRAINT "vt_workout_templates_created_by_trainer_id_vt_trainers_id_fk" FOREIGN KEY ("created_by_trainer_id") REFERENCES "public"."vt_trainers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vt_automated_email_logs" ADD CONSTRAINT "vt_automated_email_logs_automated_email_id_vt_automated_emails_id_fk" FOREIGN KEY ("automated_email_id") REFERENCES "public"."vt_automated_emails"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vt_email_events" ADD CONSTRAINT "vt_email_events_campaign_id_vt_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."vt_email_campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
