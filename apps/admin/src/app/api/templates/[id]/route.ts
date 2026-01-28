import { NextRequest, NextResponse } from "next/server";
import { db, vtWorkoutTemplates, vtWorkoutTemplateExercises, vtExercises, eq } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const [template] = await db
      .select()
      .from(vtWorkoutTemplates)
      .where(eq(vtWorkoutTemplates.id, id));

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Get exercises
    const exercises = await db
      .select({
        id: vtExercises.id,
        name: vtExercises.name,
        category: vtExercises.category,
        bodyArea: vtExercises.bodyArea,
        description: vtExercises.description,
        cues: vtExercises.cues,
        videoUrl: vtExercises.videoUrl,
        difficultyLevel: vtExercises.difficultyLevel,
        orderIndex: vtWorkoutTemplateExercises.orderIndex,
        sets: vtWorkoutTemplateExercises.sets,
        reps: vtWorkoutTemplateExercises.reps,
        duration: vtWorkoutTemplateExercises.duration,
        exerciseNotes: vtWorkoutTemplateExercises.notes,
      })
      .from(vtWorkoutTemplateExercises)
      .innerJoin(vtExercises, eq(vtWorkoutTemplateExercises.exerciseId, vtExercises.id))
      .where(eq(vtWorkoutTemplateExercises.templateId, id))
      .orderBy(vtWorkoutTemplateExercises.orderIndex);

    return NextResponse.json({ template: { ...template, exercises } });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

interface TemplateExerciseInput {
  exerciseId: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
  orderIndex: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, isPublic, exercises } = body;

    // Update template info
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const [template] = await db
      .update(vtWorkoutTemplates)
      .set(updates)
      .where(eq(vtWorkoutTemplates.id, id))
      .returning();

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // If exercises provided, replace them
    if (exercises && Array.isArray(exercises)) {
      // Delete existing exercises
      await db
        .delete(vtWorkoutTemplateExercises)
        .where(eq(vtWorkoutTemplateExercises.templateId, id));

      // Insert new exercises
      if (exercises.length > 0) {
        const exerciseInserts = exercises.map((ex: TemplateExerciseInput) => ({
          templateId: id,
          exerciseId: ex.exerciseId,
          sets: ex.sets ?? 3,
          reps: ex.reps || null,
          duration: ex.duration || null,
          notes: ex.notes || null,
          orderIndex: ex.orderIndex,
        }));

        await db.insert(vtWorkoutTemplateExercises).values(exerciseInserts);
      }
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const [deleted] = await db
      .delete(vtWorkoutTemplates)
      .where(eq(vtWorkoutTemplates.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
