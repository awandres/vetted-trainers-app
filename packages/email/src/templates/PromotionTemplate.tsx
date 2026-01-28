import {
  Button,
  Heading,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import BaseTemplate, { colors } from "./BaseTemplate";

interface PromotionTemplateProps {
  previewText?: string;
  headline: string;
  offerAmount: string;
  offerDescription: string;
  expiryDate?: string;
  promoCode?: string;
  bodyContent: string;
  ctaText: string;
  ctaUrl: string;
  termsAndConditions?: string;
}

// Styles
const heading = {
  color: colors.primary,
  fontSize: "32px",
  fontWeight: "700",
  lineHeight: "40px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const offerBox = {
  backgroundColor: colors.accent,
  borderRadius: "12px",
  padding: "32px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const offerAmountStyle = {
  color: "#ffffff",
  fontSize: "48px",
  fontWeight: "800",
  lineHeight: "56px",
  margin: "0",
};

const offerDescriptionStyle = {
  color: "#ffffff",
  fontSize: "18px",
  lineHeight: "26px",
  margin: "8px 0 0",
  opacity: 0.9,
};

const expiryStyle = {
  color: colors.accent,
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0 0 24px",
  padding: "8px 16px",
  backgroundColor: "#fff3f3",
  borderRadius: "4px",
  display: "inline-block",
};

const promoCodeBox = {
  border: `2px dashed ${colors.accent}`,
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "24px 0",
  backgroundColor: "#fff9f9",
};

const promoCodeLabel = {
  color: colors.secondary,
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
  letterSpacing: "1px",
};

const promoCodeValue = {
  color: colors.accent,
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "2px",
};

const bodyText = {
  color: colors.primary,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const ctaButton = {
  backgroundColor: colors.primary,
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
  margin: "24px auto",
};

const termsText = {
  color: colors.secondary,
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
  textAlign: "center" as const,
};

export default function PromotionTemplate({
  previewText,
  headline,
  offerAmount,
  offerDescription,
  expiryDate,
  promoCode,
  bodyContent,
  ctaText,
  ctaUrl,
  termsAndConditions,
}: PromotionTemplateProps) {
  return (
    <BaseTemplate previewText={previewText || `${headline} - ${offerAmount}`}>
      {/* Headline */}
      <Heading style={heading}>{headline}</Heading>

      {/* Offer Box */}
      <Section style={offerBox}>
        <Text style={offerAmountStyle}>{offerAmount}</Text>
        <Text style={offerDescriptionStyle}>{offerDescription}</Text>
      </Section>

      {/* Expiry Date */}
      {expiryDate && (
        <Section style={{ textAlign: "center" }}>
          <Text style={expiryStyle}>⏰ Offer expires {expiryDate}</Text>
        </Section>
      )}

      {/* Promo Code */}
      {promoCode && (
        <Section style={promoCodeBox}>
          <Text style={promoCodeLabel}>Use code at checkout</Text>
          <Text style={promoCodeValue}>{promoCode}</Text>
        </Section>
      )}

      {/* Body Content */}
      <Section>
        <Text style={bodyText}>{bodyContent}</Text>
      </Section>

      {/* CTA Button */}
      <Button href={ctaUrl} style={ctaButton}>
        {ctaText}
      </Button>

      {/* Terms */}
      {termsAndConditions && (
        <>
          <Hr style={{ borderColor: colors.border, margin: "24px 0" }} />
          <Text style={termsText}>{termsAndConditions}</Text>
        </>
      )}
    </BaseTemplate>
  );
}

// Preview props
PromotionTemplate.PreviewProps = {
  headline: "New Year, New You",
  offerAmount: "50% OFF",
  offerDescription: "Your first month of training",
  expiryDate: "January 31, 2026",
  promoCode: "NEWYEAR50",
  bodyContent:
    "Start the year right with personalized training from our expert coaches. Limited spots available!",
  ctaText: "Claim Your Discount",
  ctaUrl: "https://vettedtrainers.com/signup?code=NEWYEAR50",
  termsAndConditions:
    "Offer valid for new members only. Cannot be combined with other offers. Expires 1/31/2026.",
} as PromotionTemplateProps;
