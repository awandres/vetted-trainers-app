import { NextResponse } from "next/server";
import { db, sql } from "@vt/db";

// Tables to clear (order matters for foreign key constraints)
// We clear in reverse dependency order
const TABLES_TO_CLEAR = [
  "vt_prescription_exercises",
  "vt_prescriptions",
  "vt_email_events",
  "vt_email_campaigns",
  "vt_email_templates",
  "vt_sessions",
  "vt_contracts",
  "vt_trainer_metrics",
  "vt_payroll_periods",
  "vt_tasks",
  "vt_workout_template_exercises",
  "vt_workout_templates",
  "vt_members",
  "vt_trainers",
  // Note: We don't clear vt_exercises, vt_kpi_periods, users, or website blocks
  // as those are reference/config data
];

export async function POST() {
  try {
    const cleared: string[] = [];
    const errors: string[] = [];

    for (const table of TABLES_TO_CLEAR) {
      try {
        await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
        cleared.push(table);
      } catch (err) {
        // Table might not exist or have other issues
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (!errorMessage.includes("does not exist")) {
          errors.push(`${table}: ${errorMessage}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${cleared.length} tables`,
      cleared,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json(
      { error: "Failed to clear data" },
      { status: 500 }
    );
  }
}
