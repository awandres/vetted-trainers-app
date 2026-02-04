import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, users, sessions, eq, and, gt } from "@vt/db";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionCookie = request.cookies.get("better-auth.session_token");
    let sessionToken = sessionCookie?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    // Better Auth signs cookies with format: token.signature
    // We need just the token part (before the dot)
    if (sessionToken.includes(".")) {
      sessionToken = sessionToken.split(".")[0];
    }
    
    console.log("Token (extracted):", sessionToken);

    // Look up session in database
    const [session] = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(eq(sessions.token, sessionToken));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    console.log("Session found for user:", session.userId);

    // Get user with memberId
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        memberId: users.memberId,
      })
      .from(users)
      .where(eq(users.id, session.userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    let member = null;

    // Try to find member by memberId first
    if (user.memberId) {
      const [foundMember] = await db
        .select({
          id: vtMembers.id,
          firstName: vtMembers.firstName,
          lastName: vtMembers.lastName,
          email: vtMembers.email,
          phone: vtMembers.phone,
          status: vtMembers.status,
          trainerId: vtMembers.trainerId,
          trainerName: vtTrainers.firstName,
          lastVisitDate: vtMembers.lastVisitDate,
          daysSinceVisit: vtMembers.daysSinceVisit,
          notes: vtMembers.notes,
          createdAt: vtMembers.createdAt,
        })
        .from(vtMembers)
        .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
        .where(eq(vtMembers.id, user.memberId));
      member = foundMember;
    }

    // If no member found by memberId, try by email
    if (!member && user.email) {
      const [foundMember] = await db
        .select({
          id: vtMembers.id,
          firstName: vtMembers.firstName,
          lastName: vtMembers.lastName,
          email: vtMembers.email,
          phone: vtMembers.phone,
          status: vtMembers.status,
          trainerId: vtMembers.trainerId,
          trainerName: vtTrainers.firstName,
          lastVisitDate: vtMembers.lastVisitDate,
          daysSinceVisit: vtMembers.daysSinceVisit,
          notes: vtMembers.notes,
          createdAt: vtMembers.createdAt,
        })
        .from(vtMembers)
        .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
        .where(eq(vtMembers.email, user.email));
      member = foundMember;
    }

    if (!member) {
      return NextResponse.json({ 
        error: "No member profile found", 
        user: { id: user.id, email: user.email, name: user.name }
      }, { status: 404 });
    }

    console.log("Returning member:", member.firstName, member.lastName);
    return NextResponse.json({ 
      member, 
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json({ error: "Failed to fetch member data" }, { status: 500 });
  }
}
