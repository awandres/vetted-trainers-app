import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, eq } from "@vt/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [updated] = await db
      .update(vtPrescriptions)
      .set({
        status: "sent",
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vtPrescriptions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // TODO: Send email notification to member

    return NextResponse.json({ prescription: updated });
  } catch (error) {
    console.error("Error sending prescription:", error);
    return NextResponse.json({ error: "Failed to send prescription" }, { status: 500 });
  }
}
