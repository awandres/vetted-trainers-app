import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailTemplates, desc, eq } from "@vt/db";

// GET /api/marketing/templates - List all email templates
export async function GET(request: NextRequest) {
  try {
    const templates = await db
      .select()
      .from(vtEmailTemplates)
      .orderBy(desc(vtEmailTemplates.updatedAt));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

// POST /api/marketing/templates - Create a new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, templateType, templateData } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    const [template] = await db
      .insert(vtEmailTemplates)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        templateType: templateType || "newsletter",
        templateData: templateData || {},
      })
      .returning();

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    );
  }
}
