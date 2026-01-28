import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, eq, and, not, isNull, gte, sql } from "@vt/db";

interface AudienceFilter {
  status?: string;
  trainerId?: string;
  daysSinceJoined?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audienceType = searchParams.get("type") || "all";
  const countOnly = searchParams.get("countOnly") === "true";

  try {
    // Build conditions based on audience type
    const conditions = [
      // Always exclude opted-out members
      eq(vtMembers.emailOptOut, false),
      // Always require email
      not(isNull(vtMembers.email)),
    ];

    switch (audienceType) {
      case "active":
        conditions.push(eq(vtMembers.status, "active"));
        break;
      case "inactive":
        conditions.push(eq(vtMembers.status, "inactive"));
        break;
      case "churned":
        conditions.push(eq(vtMembers.status, "churned"));
        break;
      case "new":
        // Members joined in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        conditions.push(gte(vtMembers.createdAt, thirtyDaysAgo));
        break;
      case "all":
      default:
        // No additional filters
        break;
    }

    if (countOnly) {
      // Just return the count
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(vtMembers)
        .where(and(...conditions));

      return NextResponse.json({ 
        count: Number(result[0]?.count || 0),
        audienceType,
      });
    }

    // Get full member list
    const members = await db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        email: vtMembers.email,
        status: vtMembers.status,
      })
      .from(vtMembers)
      .where(and(...conditions));

    return NextResponse.json({
      members,
      count: members.length,
      audienceType,
    });
  } catch (error) {
    console.error("Error fetching audience:", error);
    return NextResponse.json({ error: "Failed to fetch audience" }, { status: 500 });
  }
}

// Get audience stats for all types
export async function POST(request: NextRequest) {
  try {
    const baseConditions = [
      eq(vtMembers.emailOptOut, false),
      not(isNull(vtMembers.email)),
    ];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get counts for each audience type
    const [allCount, activeCount, inactiveCount, churnedCount, newCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(vtMembers).where(and(...baseConditions)),
      db.select({ count: sql<number>`count(*)` }).from(vtMembers).where(and(...baseConditions, eq(vtMembers.status, "active"))),
      db.select({ count: sql<number>`count(*)` }).from(vtMembers).where(and(...baseConditions, eq(vtMembers.status, "inactive"))),
      db.select({ count: sql<number>`count(*)` }).from(vtMembers).where(and(...baseConditions, eq(vtMembers.status, "churned"))),
      db.select({ count: sql<number>`count(*)` }).from(vtMembers).where(and(...baseConditions, gte(vtMembers.createdAt, thirtyDaysAgo))),
    ]);

    return NextResponse.json({
      segments: [
        { type: "all", label: "All Members", count: Number(allCount[0]?.count || 0) },
        { type: "active", label: "Active Members", count: Number(activeCount[0]?.count || 0) },
        { type: "inactive", label: "Inactive Members", count: Number(inactiveCount[0]?.count || 0) },
        { type: "churned", label: "Churned Members", count: Number(churnedCount[0]?.count || 0) },
        { type: "new", label: "New Members (30 days)", count: Number(newCount[0]?.count || 0) },
      ],
    });
  } catch (error) {
    console.error("Error fetching audience stats:", error);
    return NextResponse.json({ error: "Failed to fetch audience stats" }, { status: 500 });
  }
}
