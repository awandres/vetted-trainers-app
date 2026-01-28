import { NextRequest, NextResponse } from "next/server";
import { db, vtExercises } from "@vt/db";

export async function GET() {
  try {
    const exercises = await db
      .select()
      .from(vtExercises)
      .orderBy(vtExercises.category, vtExercises.name);

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("Error fetching VT exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      bodyArea,
      description,
      cues,
      videoUrl,
      difficultyLevel,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const [newExercise] = await db
      .insert(vtExercises)
      .values({
        name,
        category: category || "mobility",
        bodyArea: bodyArea || null,
        description: description || null,
        cues: cues || [],
        videoUrl: videoUrl || null,
        difficultyLevel: difficultyLevel || 1,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ exercise: newExercise }, { status: 201 });
  } catch (error) {
    console.error("Error creating VT exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
