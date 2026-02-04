import { NextRequest, NextResponse } from "next/server";
import { db, vtAutomatedEmails, eq } from "@vt/db";

// GET - Get a single automated email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [automatedEmail] = await db
      .select()
      .from(vtAutomatedEmails)
      .where(eq(vtAutomatedEmails.id, id));

    if (!automatedEmail) {
      return NextResponse.json({ error: "Automated email not found" }, { status: 404 });
    }

    return NextResponse.json({ automatedEmail });
  } catch (error) {
    console.error("Error fetching automated email:", error);
    return NextResponse.json({ error: "Failed to fetch automated email" }, { status: 500 });
  }
}

// PUT - Update an automated email
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(vtAutomatedEmails)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(vtAutomatedEmails.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Automated email not found" }, { status: 404 });
    }

    return NextResponse.json({ automatedEmail: updated });
  } catch (error) {
    console.error("Error updating automated email:", error);
    return NextResponse.json({ error: "Failed to update automated email" }, { status: 500 });
  }
}

// DELETE - Delete an automated email
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(vtAutomatedEmails)
      .where(eq(vtAutomatedEmails.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Automated email not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting automated email:", error);
    return NextResponse.json({ error: "Failed to delete automated email" }, { status: 500 });
  }
}
