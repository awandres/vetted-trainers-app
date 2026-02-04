import { NextRequest, NextResponse } from "next/server";
import { db, vtAutomatedEmails, eq } from "@vt/db";

// POST - Toggle active status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get current status
    const [current] = await db
      .select()
      .from(vtAutomatedEmails)
      .where(eq(vtAutomatedEmails.id, id));

    if (!current) {
      return NextResponse.json({ error: "Automated email not found" }, { status: 404 });
    }

    // Toggle
    const [updated] = await db
      .update(vtAutomatedEmails)
      .set({
        isActive: !current.isActive,
        updatedAt: new Date(),
      })
      .where(eq(vtAutomatedEmails.id, id))
      .returning();

    return NextResponse.json({ 
      automatedEmail: updated,
      message: updated.isActive ? "Email activated" : "Email deactivated"
    });
  } catch (error) {
    console.error("Error toggling automated email:", error);
    return NextResponse.json({ error: "Failed to toggle automated email" }, { status: 500 });
  }
}
