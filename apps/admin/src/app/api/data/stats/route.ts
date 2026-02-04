import { NextResponse } from "next/server";
import { db, sql } from "@vt/db";

// Table configurations with display names
const TABLES = [
  { name: "vt_members", displayName: "Members" },
  { name: "vt_trainers", displayName: "Trainers" },
  { name: "vt_sessions", displayName: "Sessions" },
  { name: "vt_contracts", displayName: "Contracts" },
  { name: "vt_exercises", displayName: "Exercises" },
  { name: "vt_prescriptions", displayName: "Prescriptions" },
  { name: "vt_prescription_exercises", displayName: "Prescription Exercises" },
  { name: "vt_email_campaigns", displayName: "Email Campaigns" },
  { name: "vt_email_templates", displayName: "Email Templates" },
  { name: "vt_payroll_periods", displayName: "Payroll Periods" },
  { name: "vt_website_blocks", displayName: "Website Blocks" },
  { name: "users", displayName: "Users (Auth)" },
];

export async function GET() {
  try {
    const tableStats = await Promise.all(
      TABLES.map(async (table) => {
        try {
          const result = await db.execute(
            sql.raw(`SELECT COUNT(*) as count FROM "${table.name}"`)
          );
          const count = parseInt(String((result.rows[0] as { count: string })?.count || "0"), 10);
          return {
            name: table.name,
            displayName: table.displayName,
            count,
          };
        } catch {
          // Table might not exist
          return {
            name: table.name,
            displayName: table.displayName,
            count: 0,
          };
        }
      })
    );

    // Filter out tables with 0 count that don't exist
    const validTables = tableStats.filter((t) => t.count > 0 || TABLES.find(x => x.name === t.name));
    
    // Sort by count descending
    validTables.sort((a, b) => b.count - a.count);

    const totalRecords = validTables.reduce((sum, t) => sum + t.count, 0);

    return NextResponse.json({
      tables: validTables,
      totalRecords,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching database stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch database stats" },
      { status: 500 }
    );
  }
}
