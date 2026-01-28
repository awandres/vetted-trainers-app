import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, vtPrescriptionExercises, vtMembers, vtExercises, eq, desc } from "@vt/db";

export async function GET() {
  try {
    const prescriptions = await db
      .select({
        id: vtPrescriptions.id,
        name: vtPrescriptions.name,
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

    // Get exercises for each prescription with full details
    const prescriptionsWithExercises = await Promise.all(
      prescriptions.map(async (p) => {
        const exercises = await db
          .select({
            id: vtExercises.id,
            name: vtExercises.name,
            category: vtExercises.category,
            bodyArea: vtExercises.bodyArea,
            videoUrl: vtExercises.videoUrl,
            orderIndex: vtPrescriptionExercises.orderIndex,
            sets: vtPrescriptionExercises.sets,
            reps: vtPrescriptionExercises.reps,
            duration: vtPrescriptionExercises.duration,
            exerciseNotes: vtPrescriptionExercises.notes,
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

interface ExerciseInput {
  exerciseId: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
  orderIndex: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both old format (exerciseIds array) and new format (exercises with details)
    const { memberId, name, notes, status, exerciseIds, exercises } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const hasExercises = (exercises && exercises.length > 0) || (exerciseIds && exerciseIds.length > 0);
    if (!hasExercises) {
      return NextResponse.json({ error: "At least one exercise is required" }, { status: 400 });
    }

    const [prescription] = await db
      .insert(vtPrescriptions)
      .values({
        memberId,
        name: name || null,
        status: status || "draft",
        notes: notes || null,
        sentAt: status === "sent" ? new Date() : null,
      })
      .returning();

    // Handle new format with full exercise details
    if (exercises && exercises.length > 0) {
      const exerciseInserts = exercises.map((ex: ExerciseInput) => ({
        prescriptionId: prescription.id,
        exerciseId: ex.exerciseId,
        sets: ex.sets ?? 3,
        reps: ex.reps || null,
        duration: ex.duration || null,
        notes: ex.notes || null,
        orderIndex: ex.orderIndex,
      }));

      await db.insert(vtPrescriptionExercises).values(exerciseInserts);
    } 
    // Handle old format (just exerciseIds array)
    else if (exerciseIds && exerciseIds.length > 0) {
      const exerciseInserts = exerciseIds.map((exerciseId: string, index: number) => ({
        prescriptionId: prescription.id,
        exerciseId,
        orderIndex: index + 1,
      }));

      await db.insert(vtPrescriptionExercises).values(exerciseInserts);
    }

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}
