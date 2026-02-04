import { NextRequest, NextResponse } from "next/server";
import { db, vtSessions, vtMembers, vtTrainers, eq, desc, asc, sql, and, gte, lte } from "@vt/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type"); // "upcoming" or "recent"

    // Get the trainer ID for this user
    let trainerId = session.user.trainerId;

    // If user is a trainer but doesn't have trainerId set, try to find by email
    if (!trainerId && session.user.role === "trainer") {
      const [trainer] = await db
        .select({ id: vtTrainers.id })
        .from(vtTrainers)
        .where(eq(vtTrainers.email, session.user.email))
        .limit(1);
      
      trainerId = trainer?.id;
    }

    if (!trainerId && session.user.role !== "admin") {
      return NextResponse.json({ 
        sessions: [],
        message: "No trainer profile linked to this account"
      });
    }

    // Build conditions array
    const conditions = [];
    
    if (trainerId) {
      conditions.push(eq(vtSessions.trainerId, trainerId));
    }
    
    // Handle type parameter for upcoming/recent sessions
    const today = new Date().toISOString().split("T")[0];
    if (type === "upcoming") {
      conditions.push(gte(vtSessions.sessionDate, today));
    } else if (type === "recent") {
      conditions.push(lte(vtSessions.sessionDate, today));
    }
    
    if (startDate) {
      conditions.push(gte(vtSessions.sessionDate, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(vtSessions.sessionDate, endDate));
    }

    // Build query - ascending for upcoming, descending for recent
    const orderDirection = type === "upcoming" ? asc(vtSessions.sessionDate) : desc(vtSessions.sessionDate);
    
    const sessions = await db
      .select({
        id: vtSessions.id,
        sessionDate: vtSessions.sessionDate,
        sessionType: vtSessions.sessionType,
        sessionValue: vtSessions.sessionValue,
        priceCharged: vtSessions.priceCharged,
        notes: vtSessions.notes,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        memberId: vtMembers.id,
      })
      .from(vtSessions)
      .leftJoin(vtMembers, eq(vtSessions.memberId, vtMembers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection)
      .limit(limit);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching trainer sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
