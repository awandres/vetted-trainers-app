import { NextRequest, NextResponse } from "next/server";
import { db, vtAutomatedEmails, eq, desc } from "@vt/db";

// GET - List all automated emails
export async function GET() {
  try {
    const automatedEmails = await db
      .select()
      .from(vtAutomatedEmails)
      .orderBy(desc(vtAutomatedEmails.createdAt));

    return NextResponse.json({ automatedEmails });
  } catch (error) {
    console.error("Error fetching automated emails:", error);
    return NextResponse.json({ error: "Failed to fetch automated emails" }, { status: 500 });
  }
}

// POST - Create a new automated email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      trigger,
      triggerMode,
      subject,
      previewText,
      templateType,
      templateData,
      delayMinutes,
      isActive,
      testMode,
      testEmails,
    } = body;

    if (!name || !trigger || !subject) {
      return NextResponse.json(
        { error: "Name, trigger, and subject are required" },
        { status: 400 }
      );
    }

    const [newEmail] = await db
      .insert(vtAutomatedEmails)
      .values({
        name,
        description,
        trigger,
        triggerMode: triggerMode || "optional",
        subject,
        previewText,
        templateType: templateType || "reminder",
        templateData,
        delayMinutes: delayMinutes || 0,
        isActive: isActive ?? true,
        testMode: testMode ?? false,
        testEmails: testEmails || null,
      })
      .returning();

    return NextResponse.json({ automatedEmail: newEmail }, { status: 201 });
  } catch (error) {
    console.error("Error creating automated email:", error);
    return NextResponse.json({ error: "Failed to create automated email" }, { status: 500 });
  }
}
