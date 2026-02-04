import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtSessions, vtTrainers, users, sessions, eq, and, gt } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get session token from cookies
    let sessionToken = request.cookies.get("better-auth.session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    // Extract token from signed format
    if (sessionToken.includes(".")) {
      sessionToken = sessionToken.split(".")[0];
    }

    // Look up session in database
    const [authSession] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(
        and(
          eq(sessions.token, sessionToken),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (!authSession) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get user with memberId
    const [user] = await db
      .select({ memberId: users.memberId, email: users.email })
      .from(users)
      .where(eq(users.id, authSession.userId));

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

    // Get the specific session
    const [trainingSession] = await db
      .select({
        id: vtSessions.id,
        sessionDate: vtSessions.sessionDate,
        sessionType: vtSessions.sessionType,
        sessionValue: vtSessions.sessionValue,
        notes: vtSessions.notes,
        memberId: vtSessions.memberId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtSessions)
      .leftJoin(vtTrainers, eq(vtSessions.trainerId, vtTrainers.id))
      .where(eq(vtSessions.id, id));

    if (!trainingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify the session belongs to this member
    if (trainingSession.memberId !== memberId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Format the response
    const session = {
      id: trainingSession.id,
      sessionDate: trainingSession.sessionDate,
      sessionType: trainingSession.sessionType,
      sessionValue: trainingSession.sessionValue,
      notes: trainingSession.notes,
      trainerName: trainingSession.trainerFirstName 
        ? `${trainingSession.trainerFirstName} ${trainingSession.trainerLastName || ''}`.trim()
        : null,
    };

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
