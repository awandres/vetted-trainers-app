import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, vtPrescriptionExercises, vtMembers, vtExercises, eq, desc } from "@vt/db";

export async function GET() {
  try {
    const prescriptions = await db
      .select({
        id: vtPrescriptions.id,
        memberId: vtPrescriptions.memberId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        memberEmail: vtMembers.email,
        status: vtPrescriptions.status,
        sentAt: vtPrescriptions.sentAt,
        notes: vtPrescriptions.notes,
        createdAt: vtPrescriptions.createdAt,
      })
      .from(vtPrescriptions)
      .leftJoin(vtMembers, eq(vtPrescriptions.memberId, vtMembers.id))
      .orderBy(desc(vtPrescriptions.createdAt));

    // Get exercises for each prescription
    const prescriptionsWithExercises = await Promise.all(
      prescriptions.map(async (p) => {
        const exercises = await db
          .select({
            id: vtExercises.id,
            name: vtExercises.name,
            category: vtExercises.category,
            orderIndex: vtPrescriptionExercises.orderIndex,
          })
          .from(vtPrescriptionExercises)
          .innerJoin(vtExercises, eq(vtPrescriptionExercises.exerciseId, vtExercises.id))
          .where(eq(vtPrescriptionExercises.prescriptionId, p.id))
          .orderBy(vtPrescriptionExercises.orderIndex);

        return { ...p, exercises };
      })
    );

    return NextResponse.json({ prescriptions: prescriptionsWithExercises });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { memberId, exerciseIds, notes } = await request.json();

    if (!memberId || !exerciseIds || exerciseIds.length === 0) {
      return NextResponse.json({ error: "memberId and exerciseIds are required" }, { status: 400 });
    }

    const [prescription] = await db
      .insert(vtPrescriptions)
      .values({
        memberId,
        status: "draft",
        notes: notes || null,
      })
      .returning();

    // Add exercises
    const exerciseInserts = exerciseIds.map((exerciseId: string, index: number) => ({
      prescriptionId: prescription.id,
      exerciseId,
      orderIndex: index + 1,
    }));

    await db.insert(vtPrescriptionExercises).values(exerciseInserts);

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}
