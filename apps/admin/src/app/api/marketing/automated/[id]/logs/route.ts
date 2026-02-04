import { NextRequest, NextResponse } from "next/server";
import { db, vtAutomatedEmailLogs, eq, desc } from "@vt/db";

// GET - Fetch logs for an automated email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    const logs = await db
      .select()
      .from(vtAutomatedEmailLogs)
      .where(eq(vtAutomatedEmailLogs.automatedEmailId, id))
      .orderBy(desc(vtAutomatedEmailLogs.triggeredAt))
      .limit(limit);

    // Calculate stats
    const totalSent = logs.filter(l => l.status === "sent").length;
    const totalFailed = logs.filter(l => l.status === "failed").length;
    const totalPending = logs.filter(l => l.status === "pending").length;

    return NextResponse.json({
      logs,
      stats: {
        total: logs.length,
        sent: totalSent,
        failed: totalFailed,
        pending: totalPending,
      },
    });
  } catch (error) {
    console.error("Error fetching automated email logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
