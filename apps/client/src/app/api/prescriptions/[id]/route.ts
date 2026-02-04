import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtPrescriptions, vtPrescriptionExercises, vtExercises, vtTrainers, users, sessions, eq, and, gt } from "@vt/db";

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

    // Get the prescription (verify it belongs to this member)
    const [prescription] = await db
      .select({
        id: vtPrescriptions.id,
        name: vtPrescriptions.name,
        notes: vtPrescriptions.notes,
        status: vtPrescriptions.status,
        sentAt: vtPrescriptions.sentAt,
        viewedAt: vtPrescriptions.viewedAt,
        createdAt: vtPrescriptions.createdAt,
        memberId: vtPrescriptions.memberId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtPrescriptions)
      .leftJoin(vtTrainers, eq(vtPrescriptions.prescribedByTrainerId, vtTrainers.id))
      .where(eq(vtPrescriptions.id, id));

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Verify ownership
    if (prescription.memberId !== memberId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get exercises with full details
    const exercises = await db
      .select({
        id: vtExercises.id,
        name: vtExercises.name,
        category: vtExercises.category,
        bodyArea: vtExercises.bodyArea,
        description: vtExercises.description,
        cues: vtExercises.cues,
        videoUrl: vtExercises.videoUrl,
        thumbnailUrl: vtExercises.thumbnailUrl,
        sets: vtPrescriptionExercises.sets,
        reps: vtPrescriptionExercises.reps,
        duration: vtPrescriptionExercises.duration,
        exerciseNotes: vtPrescriptionExercises.notes,
        orderIndex: vtPrescriptionExercises.orderIndex,
      })
      .from(vtPrescriptionExercises)
      .innerJoin(vtExercises, eq(vtPrescriptionExercises.exerciseId, vtExercises.id))
      .where(eq(vtPrescriptionExercises.prescriptionId, id))
      .orderBy(vtPrescriptionExercises.orderIndex);

    // Mark as viewed if not already
    if (prescription.status === "sent") {
      await db
        .update(vtPrescriptions)
        .set({
          status: "viewed",
          viewedAt: new Date(),
        })
        .where(eq(vtPrescriptions.id, id));
    }

    // Format trainer name
    const trainerName = prescription.trainerFirstName 
      ? `${prescription.trainerFirstName} ${prescription.trainerLastName || ''}`.trim() 
      : null;

    return NextResponse.json({
      prescription: {
        id: prescription.id,
        name: prescription.name,
        notes: prescription.notes,
        status: prescription.status,
        sentAt: prescription.sentAt,
        viewedAt: prescription.viewedAt,
        createdAt: prescription.createdAt,
        trainerName,
        exercises,
      },
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return NextResponse.json({ error: "Failed to fetch prescription" }, { status: 500 });
  }
}
