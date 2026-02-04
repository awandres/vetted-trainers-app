import { NextRequest, NextResponse } from "next/server";
import { db, vtWorkoutTemplates, vtWorkoutTemplateExercises, vtExercises, vtTrainers, eq, desc, or, sql } from "@vt/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainerId = searchParams.get("trainerId");

  try {
    // Get templates - show all for now (public or created by any trainer)
    const templates = await db
      .select({
        id: vtWorkoutTemplates.id,
        name: vtWorkoutTemplates.name,
        description: vtWorkoutTemplates.description,
        isPublic: vtWorkoutTemplates.isPublic,
        createdByTrainerId: vtWorkoutTemplates.createdByTrainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
        createdAt: vtWorkoutTemplates.createdAt,
        updatedAt: vtWorkoutTemplates.updatedAt,
      })
      .from(vtWorkoutTemplates)
      .leftJoin(vtTrainers, eq(vtWorkoutTemplates.createdByTrainerId, vtTrainers.id))
      .orderBy(desc(vtWorkoutTemplates.createdAt));

    // Get exercises for each template
    const templatesWithExercises = await Promise.all(
      templates.map(async (template) => {
        const exercises = await db
          .select({
            id: vtExercises.id,
            name: vtExercises.name,
            category: vtExercises.category,
            bodyArea: vtExercises.bodyArea,
            videoUrl: vtExercises.videoUrl,
            orderIndex: vtWorkoutTemplateExercises.orderIndex,
            sets: vtWorkoutTemplateExercises.sets,
            reps: vtWorkoutTemplateExercises.reps,
            duration: vtWorkoutTemplateExercises.duration,
            exerciseNotes: vtWorkoutTemplateExercises.notes,
          })
          .from(vtWorkoutTemplateExercises)
          .innerJoin(vtExercises, eq(vtWorkoutTemplateExercises.exerciseId, vtExercises.id))
          .where(eq(vtWorkoutTemplateExercises.templateId, template.id))
          .orderBy(vtWorkoutTemplateExercises.orderIndex);

        // Format trainer name
        const trainerName = template.trainerFirstName && template.trainerLastName
          ? `${template.trainerFirstName} ${template.trainerLastName}`
          : null;

        return { 
          ...template, 
          trainerName,
          exercises, 
          exerciseCount: exercises.length 
        };
      })
    );

    return NextResponse.json({ templates: templatesWithExercises });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isPublic, createdByTrainerId, exercises } = body;

    if (!name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    if (!exercises || exercises.length === 0) {
      return NextResponse.json({ error: "At least one exercise is required" }, { status: 400 });
    }

    const [template] = await db
      .insert(vtWorkoutTemplates)
      .values({
        name,
        description: description || null,
        isPublic: isPublic ?? false,
        createdByTrainerId: createdByTrainerId || null,
      })
      .returning();

    // Add exercises
    const exerciseInserts = exercises.map((ex: TemplateExerciseInput) => ({
      templateId: template.id,
      exerciseId: ex.exerciseId,
      sets: ex.sets ?? 3,
      reps: ex.reps || null,
      duration: ex.duration || null,
      notes: ex.notes || null,
      orderIndex: ex.orderIndex,
    }));

    await db.insert(vtWorkoutTemplateExercises).values(exerciseInserts);

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
