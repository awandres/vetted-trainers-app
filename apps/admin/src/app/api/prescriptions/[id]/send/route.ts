import { NextRequest, NextResponse } from "next/server";
import { db, vtPrescriptions, vtPrescriptionExercises, vtExercises, vtMembers, eq } from "@vt/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Prepare email data (ready for when email service is configured)
    const emailData = {
      to: prescription.memberEmail,
      subject: `Your Mobility Prescription: ${prescription.name || "Exercise Routine"}`,
      prescriptionName: prescription.name,
      memberName: `${prescription.memberFirstName} ${prescription.memberLastName}`,
      notes: prescription.notes,
      exercises: exercises.map((ex, i) => ({
        order: i + 1,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        notes: ex.notes,
        videoUrl: ex.videoUrl,
      })),
      viewUrl: prescriptionUrl,
    };

    // TODO: When email service is configured, send email here
    // await sendPrescriptionEmail(emailData);
    
    // For now, log that we would send an email
    console.log("📧 Prescription ready to send:", {
      to: emailData.to,
      subject: emailData.subject,
      exerciseCount: exercises.length,
      viewUrl: prescriptionUrl,
    });

    return NextResponse.json({ 
      prescription: updated,
      emailData: {
        to: emailData.to,
        viewUrl: prescriptionUrl,
        exerciseCount: exercises.length,
      },
      message: prescription.memberEmail 
        ? "Prescription marked as sent. Email notification will be available once email service is configured."
        : "Prescription marked as sent. No email address on file for this member."
    });
  } catch (error) {
    console.error("Error sending prescription:", error);
    return NextResponse.json({ error: "Failed to send prescription" }, { status: 500 });
  }
}
