import {
  Button,
  Heading,
  Img,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import BaseTemplate, { colors } from "./BaseTemplate";

interface NewsletterTemplateProps {
  previewText?: string;
  headline: string;
  subheadline?: string;
  heroImage?: string;
  bodyContent: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryContent?: string;
}

// Styles
const heading = {
  color: colors.primary,
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "36px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const subheading = {
  color: colors.secondary,
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const heroImageStyle = {
  width: "100%",
  maxWidth: "520px",
  borderRadius: "8px",
  margin: "0 auto 24px",
  display: "block",
};

const bodyText = {
  color: colors.primary,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const ctaButton = {
  backgroundColor: colors.accent,
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
  margin: "24px auto",
};

const divider = {
  borderColor: colors.border,
  margin: "32px 0",
};

const secondarySection = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "24px",
  marginTop: "24px",
};

export default function NewsletterTemplate({
  previewText,
  headline,
  subheadline,
  heroImage,
  bodyContent,
  ctaText,
  ctaUrl,
  secondaryContent,
}: NewsletterTemplateProps) {
  return (
    <BaseTemplate previewText={previewText || headline}>
      {/* Headline */}
      <Heading style={heading}>{headline}</Heading>
      
      {subheadline && <Text style={subheading}>{subheadline}</Text>}

      {/* Hero Image */}
      {heroImage && (
        <Img
          src={heroImage}
          width="520"
          height="auto"
          alt="Newsletter"
          style={heroImageStyle}
        />
      )}

      {/* Body Content */}
      <Section>
        <Text style={bodyText}>{bodyContent}</Text>
      </Section>

      {/* CTA Button */}
      {ctaText && ctaUrl && (
        <Button href={ctaUrl} style={ctaButton}>
          {ctaText}
        </Button>
      )}

      {/* Secondary Content */}
      {secondaryContent && (
        <>
          <Hr style={divider} />
          <Section style={secondarySection}>
            <Text style={bodyText}>{secondaryContent}</Text>
          </Section>
        </>
      )}
    </BaseTemplate>
  );
}

// Preview props for React Email dev server
NewsletterTemplate.PreviewProps = {
  headline: "Get Ready for Summer",
  subheadline: "New programs starting June 1st",
  heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  bodyContent: `
    Spring is here, and that means it's time to start thinking about your summer fitness goals!

    Whether you want to build strength, lose weight, or just feel more energetic, our trainers are ready to help you create a personalized plan.

    Join us for our new Summer Shape-Up program starting June 1st. Includes:
    • 12-week structured training program
    • Nutrition guidance and meal planning
    • Weekly check-ins with your trainer
    • Access to our exclusive member app
  `,
  ctaText: "Reserve Your Spot",
  ctaUrl: "https://vettedtrainers.com/summer-program",
  secondaryContent: "Questions? Reply to this email or call us at (555) 123-4567.",
} as NewsletterTemplateProps;
