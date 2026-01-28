import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, vtPrescriptionExercises, eq } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [prescription] = await db
      .select()
      .from(vtPrescriptions)
      .where(eq(vtPrescriptions.id, id))
      .limit(1);

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ prescription });
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
    
    // Delete exercises first
    await db.delete(vtPrescriptionExercises).where(eq(vtPrescriptionExercises.prescriptionId, id));
    
    // Delete prescription
    const [deleted] = await db.delete(vtPrescriptions).where(eq(vtPrescriptions.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 });
  }
}
