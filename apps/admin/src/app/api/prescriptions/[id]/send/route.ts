import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, vtPrescriptionExercises, vtExercises, vtMembers, eq } from "@vt/db";
import { sendEmail, renderTemplate } from "@vt/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { testEmail } = body; // Optional: send to test email instead
    
    // Get the prescription with member info
    const [prescription] = await db
      .select({
        id: vtPrescriptions.id,
        name: vtPrescriptions.name,
        notes: vtPrescriptions.notes,
        memberId: vtPrescriptions.memberId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        memberEmail: vtMembers.email,
      })
      .from(vtPrescriptions)
      .leftJoin(vtMembers, eq(vtPrescriptions.memberId, vtMembers.id))
      .where(eq(vtPrescriptions.id, id));

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Get exercises
    const exercises = await db
      .select({
        name: vtExercises.name,
        category: vtExercises.category,
        bodyArea: vtExercises.bodyArea,
        description: vtExercises.description,
        cues: vtExercises.cues,
        videoUrl: vtExercises.videoUrl,
        sets: vtPrescriptionExercises.sets,
        reps: vtPrescriptionExercises.reps,
        duration: vtPrescriptionExercises.duration,
        notes: vtPrescriptionExercises.notes,
        orderIndex: vtPrescriptionExercises.orderIndex,
      })
      .from(vtPrescriptionExercises)
      .innerJoin(vtExercises, eq(vtPrescriptionExercises.exerciseId, vtExercises.id))
      .where(eq(vtPrescriptionExercises.prescriptionId, id))
      .orderBy(vtPrescriptionExercises.orderIndex);

    // Update status to sent
    const [updated] = await db
      .update(vtPrescriptions)
      .set({
        status: "sent",
        sentAt: new Date(),
      })
      .where(eq(vtPrescriptions.id, id))
      .returning();

    // Generate prescription view URL (for client portal)
    const prescriptionUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3002"}/prescriptions/${id}`;

    // Require explicit email addresses - no automatic sending to member email
    if (!testEmail) {
      return NextResponse.json({ 
        error: "Email address(es) required. Please specify recipient email(s)." 
      }, { status: 400 });
    }

    // Parse email addresses (can be comma-separated or array)
    const emailAddresses = Array.isArray(testEmail) 
      ? testEmail 
      : testEmail.split(",").map((e: string) => e.trim()).filter(Boolean);

    if (emailAddresses.length === 0) {
      return NextResponse.json({ 
        error: "At least one email address is required" 
      }, { status: 400 });
    }

    // Render the prescription email template
    let html: string;
    try {
      html = await renderTemplate({
        template: "prescription",
        props: {
          recipientName: prescription.memberFirstName || "Member",
          prescriptionName: prescription.name || "Your Exercise Prescription",
          notes: prescription.notes,
          exercises: exercises.map((ex, i) => ({
            order: i + 1,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            notes: ex.notes,
          })),
          viewUrl: prescriptionUrl,
        },
      });
    } catch (renderError) {
      console.error("Error rendering prescription template:", renderError);
      return NextResponse.json({ 
        error: "Failed to render email template"
      }, { status: 500 });
    }

    // Send to all specified email addresses
    const results = [];
    const errors = [];
    const subject = `Your Mobility Prescription: ${prescription.name || "Exercise Routine"}`;

    for (const email of emailAddresses) {
      const result = await sendEmail({
        to: email,
        subject,
        html,
      });

      if (result.success) {
        results.push({ email, id: result.id });
      } else {
        errors.push({ email, error: result.error });
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ 
        error: `Failed to send emails: ${errors.map(e => e.error).join(", ")}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      prescription: updated,
      message: `Prescription sent to ${results.length} recipient(s)`,
      sentTo: results.map(r => r.email),
      failed: errors.length > 0 ? errors : undefined,
      viewUrl: prescriptionUrl,
      exerciseCount: exercises.length,
    });
  } catch (error) {
    console.error("Error sending prescription:", error);
    return NextResponse.json({ error: "Failed to send prescription" }, { status: 500 });
  }
}
