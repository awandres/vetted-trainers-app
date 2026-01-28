import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtVisits, vtTrainers, eq, desc } from "@vt/db";
import { auth } from "@vt/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find member linked to this user's email
    const [member] = await db
      .select({ id: vtMembers.id })
      .from(vtMembers)
      .where(eq(vtMembers.email, session.user.email));

    if (!member) {
      return NextResponse.json({ error: "No member profile found" }, { status: 404 });
    }

    // Get sessions for this member
    const sessions = await db
      .select({
        id: vtVisits.id,
        visitDate: vtVisits.visitDate,
        sessionType: vtVisits.sessionType,
        notes: vtVisits.notes,
        trainerName: vtTrainers.name,
      })
      .from(vtVisits)
      .leftJoin(vtTrainers, eq(vtVisits.trainerId, vtTrainers.id))
      .where(eq(vtVisits.memberId, member.id))
      .orderBy(desc(vtVisits.visitDate))
      .limit(50);

    // Calculate stats
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessionsThisMonth = sessions.filter((s) => 
      s.visitDate && new Date(s.visitDate) >= thisMonth
    ).length;

    return NextResponse.json({
      sessions,
      stats: {
        total: sessions.length,
        thisMonth: sessionsThisMonth,
        lastSession: sessions[0]?.visitDate || null,
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
