import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailCampaigns, vtEmailEvents, vtMembers, eq, and, not, isNull, gte } from "@vt/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { testEmail } = body; // Optional: send to test email only

    // Get the campaign
    const [campaign] = await db
      .select()
      .from(vtEmailCampaigns)
      .where(eq(vtEmailCampaigns.id, id));

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
    }

    // If test email, just send to that address
    if (testEmail) {
      // TODO: Integrate with email service
      // For now, log and return success
      console.log(`📧 Test email would be sent to: ${testEmail}`);
      console.log(`   Subject: ${campaign.subject}`);
      console.log(`   Template: ${campaign.templateType}`);

      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`,
        testMode: true,
      });
    }

    // Build audience conditions
    const baseConditions = [
      eq(vtMembers.emailOptOut, false),
      not(isNull(vtMembers.email)),
    ];

    switch (campaign.audienceType) {
      case "active":
        baseConditions.push(eq(vtMembers.status, "active"));
        break;
      case "inactive":
        baseConditions.push(eq(vtMembers.status, "inactive"));
        break;
      case "churned":
        baseConditions.push(eq(vtMembers.status, "churned"));
        break;
      case "new":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        baseConditions.push(gte(vtMembers.createdAt, thirtyDaysAgo));
        break;
    }

    // Get recipients
    const recipients = await db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        email: vtMembers.email,
      })
      .from(vtMembers)
      .where(and(...baseConditions));

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found for this audience" }, { status: 400 });
    }

    // Update campaign status to sending
    await db
      .update(vtEmailCampaigns)
      .set({
        status: "sending",
        recipientCount: recipients.length,
        updatedAt: new Date(),
      })
      .where(eq(vtEmailCampaigns.id, id));

    // TODO: Integrate with Resend for actual sending
    // For now, simulate sending and create events
    let sentCount = 0;
    const events = [];

    for (const recipient of recipients) {
      // Simulate sending (replace with actual Resend call)
      console.log(`📧 Would send to: ${recipient.email}`);
      
      // Record sent event
      events.push({
        campaignId: id,
        recipientEmail: recipient.email!,
        memberId: recipient.id,
        eventType: "sent" as const,
      });
      sentCount++;
    }

    // Batch insert events
    if (events.length > 0) {
      await db.insert(vtEmailEvents).values(events);
    }

    // Update campaign to sent
    const [updated] = await db
      .update(vtEmailCampaigns)
      .set({
        status: "sent",
        sentCount,
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vtEmailCampaigns.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      campaign: updated,
      recipientCount: recipients.length,
      sentCount,
      message: `Campaign sent to ${sentCount} recipients`,
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    
    // Mark campaign as failed
    const { id } = await params;
    await db
      .update(vtEmailCampaigns)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(vtEmailCampaigns.id, id));

    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
