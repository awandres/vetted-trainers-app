import { NextRequest, NextResponse } from "next/server";
import { db, vtEmailCampaigns, eq } from "@vt/db";
import { sendEmail, renderTemplate } from "@vt/email";

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

    // Require explicit email addresses - no automatic audience sending
    if (!testEmail) {
      return NextResponse.json({ 
        error: "Email address(es) required. Automatic audience sending is disabled." 
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

    // Send to all specified addresses
    const results = [];
    const errors = [];

    for (const email of emailAddresses) {
      const result = await sendEmail({
        to: email,
        subject: campaign.subject,
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

    // Update campaign status to sent
    await db
      .update(vtEmailCampaigns)
      .set({
        status: "sent",
        sentAt: new Date(),
        sentCount: results.length,
        recipientCount: emailAddresses.length,
        updatedAt: new Date(),
      })
      .where(eq(vtEmailCampaigns.id, id));

    return NextResponse.json({
      success: true,
      message: `Email sent to ${results.length} recipient(s)`,
      sentTo: results.map(r => r.email),
      failed: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
