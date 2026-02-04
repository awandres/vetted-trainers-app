import { NextRequest, NextResponse } from "next/server";
import { renderTemplate } from "@vt/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateType, templateData, name, previewText } = body;

    // Build template props based on template type
    const templateProps: Record<string, unknown> = {
      headline: templateData?.headline || name || "Preview",
      previewText: previewText || "",
    };

    // Add template-specific props
    if (templateType === "newsletter") {
      templateProps.bodyContent = templateData?.bodyContent || "";
      templateProps.ctaText = templateData?.ctaText;
      templateProps.ctaUrl = templateData?.ctaUrl;
    } else if (templateType === "promotion") {
      templateProps.bodyContent = templateData?.bodyContent || "";
      templateProps.ctaText = templateData?.ctaText || "Claim Offer";
      templateProps.ctaUrl = templateData?.ctaUrl;
      templateProps.offerAmount = templateData?.offerAmount;
      templateProps.offerDescription = templateData?.offerDescription;
      templateProps.offerCode = templateData?.promoCode;
    } else if (templateType === "reminder") {
      templateProps.bodyContent = templateData?.bodyContent || "";
      templateProps.ctaText = templateData?.ctaText || "Book Now";
      templateProps.ctaUrl = templateData?.ctaUrl;
    }

    // Render the email template
    let html: string;
    try {
      html = await renderTemplate({
        template: (templateType || "newsletter") as "newsletter" | "promotion" | "reminder",
        props: templateProps,
      });
    } catch (renderError) {
      console.error("Error rendering template:", renderError);
      return NextResponse.json({ error: "Failed to render email template" }, { status: 500 });
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
