import { NextResponse } from "next/server";
import { db, vtMembers, sql } from "@vt/db";

/**
 * Recalculates member status based on lastVisitDate
 * 
 * Status rules:
 * - Active: Last visit within 14 days
 * - Inactive: Last visit between 15-45 days ago
 * - Churned: Last visit more than 45 days ago OR never visited
 */
export async function POST() {
  try {
    const today = new Date();
    
    // Update all members' daysSinceVisit and status based on lastVisitDate
    // First, update daysSinceVisit for all members with a lastVisitDate
    await db.execute(sql`
      UPDATE vt_members
      SET 
        days_since_visit = CASE 
          WHEN last_visit_date IS NOT NULL 
          THEN EXTRACT(DAY FROM NOW() - last_visit_date)::INTEGER
          ELSE NULL
        END,
        status = CASE
          WHEN last_visit_date IS NULL THEN 'active'
          WHEN EXTRACT(DAY FROM NOW() - last_visit_date) <= 14 THEN 'active'
          WHEN EXTRACT(DAY FROM NOW() - last_visit_date) <= 45 THEN 'inactive'
          ELSE 'churned'
        END,
        updated_at = NOW()
    `);

    // Get counts for reporting
    const [stats] = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count,
        COUNT(*) FILTER (WHERE status = 'churned') as churned_count,
        COUNT(*) as total_count
      FROM vt_members
    `);

    return NextResponse.json({
      success: true,
      message: "Member statuses recalculated",
      stats: stats || { active_count: 0, inactive_count: 0, churned_count: 0, total_count: 0 },
      updatedAt: today.toISOString(),
    });
  } catch (error) {
    console.error("Error recalculating member status:", error);
    return NextResponse.json(
      { error: "Failed to recalculate member status" },
      { status: 500 }
    );
  }
}
