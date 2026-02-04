import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailCampaigns, eq } from "@vt/db";
import { renderTemplate } from "@vt/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the campaign
    const [campaign] = await db
      .select()
      .from(vtEmailCampaigns)
      .where(eq(vtEmailCampaigns.id, id));

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Parse template data
    const templateData = (campaign.templateData as Record<string, unknown>) || {};
    
    // Build template props based on template type
    const templateProps: Record<string, unknown> = {
      headline: templateData.headline || campaign.name,
      previewText: campaign.previewText || "",
    };

    // Add template-specific props
    if (campaign.templateType === "newsletter") {
      templateProps.bodyContent = templateData.bodyContent || "";
      templateProps.ctaText = templateData.ctaText;
      templateProps.ctaUrl = templateData.ctaUrl;
    } else if (campaign.templateType === "promotion") {
      templateProps.bodyContent = templateData.bodyContent || "";
      templateProps.ctaText = templateData.ctaText || "Claim Offer";
      templateProps.ctaUrl = templateData.ctaUrl;
      templateProps.offerCode = templateData.promoCode;
      templateProps.expiresAt = templateData.promoExpiry;
      templateProps.discountText = templateData.promoDiscount;
    } else if (campaign.templateType === "reminder") {
      templateProps.bodyContent = templateData.bodyContent || "";
      templateProps.ctaText = templateData.ctaText || "Book Now";
      templateProps.ctaUrl = templateData.ctaUrl;
    }

    // Render the email template
    let html: string;
    try {
      html = await renderTemplate({
        template: campaign.templateType as "newsletter" | "promotion" | "reminder",
        props: templateProps,
      });
    } catch (renderError) {
      console.error("Error rendering template:", renderError);
      return NextResponse.json({ error: "Failed to render email template" }, { status: 500 });
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        previewText: campaign.previewText,
        templateType: campaign.templateType,
      },
      html,
    });
  } catch (error) {
    console.error("Error previewing campaign:", error);
    return NextResponse.json({ error: "Failed to preview campaign" }, { status: 500 });
  }
}
