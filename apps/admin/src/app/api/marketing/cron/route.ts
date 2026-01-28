import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailCampaigns, vtEmailEvents, vtMembers, eq, and, not, isNull, gte, lte } from "@vt/db";

// This endpoint processes scheduled campaigns that are due to be sent
// It should be called by a cron job (e.g., Vercel Cron, external scheduler)
// Recommended: Run every 5 minutes

export async function GET(request: NextRequest) {
  // Optional: Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find campaigns that are scheduled and due to be sent
    const dueCampaigns = await db
      .select()
      .from(vtEmailCampaigns)
      .where(
        and(
          eq(vtEmailCampaigns.status, "scheduled"),
          lte(vtEmailCampaigns.scheduledAt, now)
        )
      );

    if (dueCampaigns.length === 0) {
      return NextResponse.json({ 
        message: "No campaigns to process",
        processed: 0,
      });
    }

    const results = [];

    for (const campaign of dueCampaigns) {
      try {
        // Mark as sending
        await db
          .update(vtEmailCampaigns)
          .set({ status: "sending", updatedAt: new Date() })
          .where(eq(vtEmailCampaigns.id, campaign.id));

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
          // No recipients, mark as sent with 0 count
          await db
            .update(vtEmailCampaigns)
            .set({
              status: "sent",
              sentCount: 0,
              recipientCount: 0,
              sentAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(vtEmailCampaigns.id, campaign.id));

          results.push({
            campaignId: campaign.id,
            name: campaign.name,
            status: "sent",
            sentCount: 0,
            error: null,
          });
          continue;
        }

        // TODO: Integrate with Resend for actual sending
        // For now, simulate sending and create events
        let sentCount = 0;
        const events = [];

        for (const recipient of recipients) {
          // Simulate sending (replace with actual Resend call)
          console.log(`📧 [CRON] Sending to: ${recipient.email} - Campaign: ${campaign.name}`);
          
          events.push({
            campaignId: campaign.id,
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

        // Mark as sent
        await db
          .update(vtEmailCampaigns)
          .set({
            status: "sent",
            sentCount,
            recipientCount: recipients.length,
            sentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(vtEmailCampaigns.id, campaign.id));

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          status: "sent",
          sentCount,
          error: null,
        });
      } catch (err) {
        console.error(`Error processing campaign ${campaign.id}:`, err);
        
        // Mark as failed
        await db
          .update(vtEmailCampaigns)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(vtEmailCampaigns.id, campaign.id));

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          status: "failed",
          sentCount: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} campaign(s)`,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
