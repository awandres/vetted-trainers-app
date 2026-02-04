import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtPrescriptions, vtPrescriptionExercises, users, sessions, eq, and, gt, or, desc } from "@vt/db";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies (check both regular and __Secure- prefixed for production)
    let sessionToken = request.cookies.get("better-auth.session_token")?.value
      || request.cookies.get("__Secure-better-auth.session_token")?.value;
    
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

    // Get prescriptions for this member (sent or viewed only)
    const prescriptions = await db
      .select({
        id: vtPrescriptions.id,
        name: vtPrescriptions.name,
        notes: vtPrescriptions.notes,
        status: vtPrescriptions.status,
        sentAt: vtPrescriptions.sentAt,
        viewedAt: vtPrescriptions.viewedAt,
        createdAt: vtPrescriptions.createdAt,
      })
      .from(vtPrescriptions)
      .where(
        and(
          eq(vtPrescriptions.memberId, memberId),
          or(
            eq(vtPrescriptions.status, "sent"),
            eq(vtPrescriptions.status, "viewed")
          )
        )
      )
      .orderBy(desc(vtPrescriptions.sentAt));

    // Get exercise counts for each prescription
    const prescriptionsWithCounts = await Promise.all(
      prescriptions.map(async (prescription) => {
        const exercises = await db
          .select({ id: vtPrescriptionExercises.id })
          .from(vtPrescriptionExercises)
          .where(eq(vtPrescriptionExercises.prescriptionId, prescription.id));

        return {
          ...prescription,
          exerciseCount: exercises.length,
        };
      })
    );

    return NextResponse.json({ prescriptions: prescriptionsWithCounts });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}
