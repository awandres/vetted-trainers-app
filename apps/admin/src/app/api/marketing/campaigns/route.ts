import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailCampaigns, desc } from "@vt/db";

export async function GET() {
  try {
    const campaigns = await db
      .select()
      .from(vtEmailCampaigns)
      .orderBy(desc(vtEmailCampaigns.createdAt));

    // Calculate rates for each campaign
    const campaignsWithRates = campaigns.map((campaign) => {
      const openRate = campaign.sentCount > 0 
        ? ((campaign.openedCount || 0) / campaign.sentCount * 100).toFixed(1)
        : "0.0";
      const clickRate = campaign.sentCount > 0 
        ? ((campaign.clickedCount || 0) / campaign.sentCount * 100).toFixed(1)
        : "0.0";
      const bounceRate = campaign.sentCount > 0 
        ? ((campaign.bouncedCount || 0) / campaign.sentCount * 100).toFixed(1)
        : "0.0";

      return {
        ...campaign,
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        bounceRate: parseFloat(bounceRate),
      };
    });

    return NextResponse.json({ campaigns: campaignsWithRates });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      subject,
      previewText,
      templateType,
      templateData,
      audienceType,
      audienceFilter,
      scheduledAt,
    } = body;

    if (!name || !subject) {
      return NextResponse.json(
        { error: "Name and subject are required" },
        { status: 400 }
      );
    }

    // Determine status based on whether scheduling is requested
    let status: "draft" | "scheduled" = "draft";
    let scheduledAtDate: Date | null = null;

    if (scheduledAt) {
      const parsed = new Date(scheduledAt);
      if (parsed > new Date()) {
        status = "scheduled";
        scheduledAtDate = parsed;
      } else {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }
    }

    const [campaign] = await db
      .insert(vtEmailCampaigns)
      .values({
        name,
        subject,
        previewText: previewText || null,
        templateType: templateType || "newsletter",
        templateData: templateData || {},
        audienceType: audienceType || "all",
        audienceFilter: audienceFilter || null,
        status,
        scheduledAt: scheduledAtDate,
      })
      .returning();

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
