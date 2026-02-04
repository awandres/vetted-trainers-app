import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, vtPrescriptionExercises, vtExercises, vtMembers, vtTrainers, eq } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [prescriptionRow] = await db
      .select({
        id: vtPrescriptions.id,
        name: vtPrescriptions.name,
        notes: vtPrescriptions.notes,
        status: vtPrescriptions.status,
        sentAt: vtPrescriptions.sentAt,
        viewedAt: vtPrescriptions.viewedAt,
        createdAt: vtPrescriptions.createdAt,
        memberId: vtPrescriptions.memberId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        memberEmail: vtMembers.email,
        prescribedByTrainerId: vtPrescriptions.prescribedByTrainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtPrescriptions)
      .leftJoin(vtMembers, eq(vtPrescriptions.memberId, vtMembers.id))
      .leftJoin(vtTrainers, eq(vtPrescriptions.prescribedByTrainerId, vtTrainers.id))
      .where(eq(vtPrescriptions.id, id));
    
    const prescription = prescriptionRow ? {
      ...prescriptionRow,
      trainerName: prescriptionRow.trainerFirstName && prescriptionRow.trainerLastName 
        ? `${prescriptionRow.trainerFirstName} ${prescriptionRow.trainerLastName}` 
        : null,
    } : null;

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
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
        difficultyLevel: vtExercises.difficultyLevel,
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

    return NextResponse.json({
      prescription: {
        ...prescription,
        exercises,
      },
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return NextResponse.json({ error: "Failed to fetch prescription" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(vtPrescriptions)
      .where(eq(vtPrescriptions.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 });
  }
}

// Mark prescription as viewed (for client portal)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.viewed) {
      updates.status = "viewed";
      updates.viewedAt = new Date();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    const [updated] = await db
      .update(vtPrescriptions)
      .set(updates)
      .where(eq(vtPrescriptions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ prescription: updated });
  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
  }
}
