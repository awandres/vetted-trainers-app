import { NextRequest, NextResponse } from "next/server";
import { db, vtExercises, eq } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [exercise] = await db
      .select()
      .from(vtExercises)
      .where(eq(vtExercises.id, id))
      .limit(1);

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      category,
      bodyArea,
      description,
      cues,
      videoUrl,
      difficultyLevel,
      isActive,
    } = body;

    const [updated] = await db
      .update(vtExercises)
      .set({
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(bodyArea !== undefined && { bodyArea }),
        ...(description !== undefined && { description }),
        ...(cues !== undefined && { cues }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(difficultyLevel !== undefined && { difficultyLevel }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(vtExercises.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ exercise: updated });
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [deleted] = await db
      .delete(vtExercises)
      .where(eq(vtExercises.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
