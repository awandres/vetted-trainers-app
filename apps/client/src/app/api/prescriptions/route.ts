import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtPrescriptions, vtPrescriptionExercises, vtExercises, eq, desc, and, or } from "@vt/db";
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
          eq(vtPrescriptions.memberId, member.id),
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
