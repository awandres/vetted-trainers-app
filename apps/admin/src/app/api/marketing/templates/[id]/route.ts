import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailTemplates, eq, sql } from "@vt/db";

// GET /api/marketing/templates/[id] - Get a single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const templates = await db
      .select()
      .from(vtEmailTemplates)
      .where(eq(vtEmailTemplates.id, id));

    if (templates.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Increment usage count
    await db
      .update(vtEmailTemplates)
      .set({ usageCount: sql`${vtEmailTemplates.usageCount} + 1` })
      .where(eq(vtEmailTemplates.id, id));

    return NextResponse.json({ template: templates[0] });
  } catch (error) {
    console.error("Error fetching email template:", error);
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    );
  }
}

// PATCH /api/marketing/templates/[id] - Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { name, description, templateType, templateData } = body;

    const [template] = await db
      .update(vtEmailTemplates)
      .set({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(templateType && { templateType }),
        ...(templateData && { templateData }),
        updatedAt: new Date(),
      })
      .where(eq(vtEmailTemplates.id, id))
      .returning();

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}

// DELETE /api/marketing/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const [deleted] = await db
      .delete(vtEmailTemplates)
      .where(eq(vtEmailTemplates.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    );
  }
}
