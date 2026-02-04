import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtSessions, vtTrainers, users, sessions, eq, desc, and, gt } from "@vt/db";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    let sessionToken = request.cookies.get("better-auth.session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    // Better Auth signs cookies with format: token.signature
    // We need just the token part (before the dot)
    if (sessionToken.includes(".")) {
      sessionToken = sessionToken.split(".")[0];
    }

    // Look up session in database
    const [session] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(
        and(
          eq(sessions.token, sessionToken),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    // Get user with memberId
    const [user] = await db
      .select({ memberId: users.memberId, email: users.email })
      .from(users)
      .where(eq(users.id, session.userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    let memberId = user.memberId;

    // If no memberId on user, try to find by email
    if (!memberId && user.email) {
      const [member] = await db
        .select({ id: vtMembers.id })
        .from(vtMembers)
        .where(eq(vtMembers.email, user.email));
      memberId = member?.id;
    }

    if (!memberId) {
      return NextResponse.json({ error: "No member profile found" }, { status: 404 });
    }

    // Get sessions for this member
    const memberSessions = await db
      .select({
        id: vtSessions.id,
        visitDate: vtSessions.sessionDate,
        sessionType: vtSessions.sessionType,
        notes: vtSessions.notes,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtSessions)
      .leftJoin(vtTrainers, eq(vtSessions.trainerId, vtTrainers.id))
      .where(eq(vtSessions.memberId, memberId))
      .orderBy(desc(vtSessions.sessionDate))
      .limit(50);

    // Format sessions
    const formattedSessions = memberSessions.map(s => ({
      id: s.id,
      visitDate: s.visitDate,
      sessionType: s.sessionType,
      notes: s.notes,
      trainerName: s.trainerFirstName ? `${s.trainerFirstName} ${s.trainerLastName || ''}`.trim() : "Trainer",
    }));

    // Calculate stats
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessionsThisMonth = formattedSessions.filter((s) => 
      s.visitDate && new Date(s.visitDate) >= thisMonth
    ).length;

    return NextResponse.json({
      sessions: formattedSessions,
      stats: {
        total: formattedSessions.length,
        thisMonth: sessionsThisMonth,
        lastSession: formattedSessions[0]?.visitDate || null,
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
