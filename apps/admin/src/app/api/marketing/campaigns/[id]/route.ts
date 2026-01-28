import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailCampaigns, vtEmailEvents, eq, desc } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [campaign] = await db
      .select()
      .from(vtEmailCampaigns)
      .where(eq(vtEmailCampaigns.id, id));

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get recent events for this campaign
    const events = await db
      .select()
      .from(vtEmailEvents)
      .where(eq(vtEmailEvents.campaignId, id))
      .orderBy(desc(vtEmailEvents.occurredAt))
      .limit(100);

    // Calculate rates
    const openRate = campaign.sentCount > 0
      ? ((campaign.openedCount || 0) / campaign.sentCount * 100).toFixed(1)
      : "0.0";
    const clickRate = campaign.sentCount > 0
      ? ((campaign.clickedCount || 0) / campaign.sentCount * 100).toFixed(1)
      : "0.0";

    return NextResponse.json({
      campaign: {
        ...campaign,
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
      },
      events,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    // Only allow updating certain fields
    const allowedFields = [
      "name",
      "subject",
      "previewText",
      "templateType",
      "templateData",
      "audienceType",
      "audienceFilter",
      "status",
      "scheduledAt",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const [campaign] = await db
      .update(vtEmailCampaigns)
      .set(updates)
      .where(eq(vtEmailCampaigns.id, id))
      .returning();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(vtEmailCampaigns)
      .where(eq(vtEmailCampaigns.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
