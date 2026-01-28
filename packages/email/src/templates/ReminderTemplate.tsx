import {
  Button,
  Heading,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import BaseTemplate, { colors } from "./BaseTemplate";

interface ReminderTemplateProps {
  previewText?: string;
  recipientName: string;
  reminderType: "session" | "prescription" | "check-in" | "general";
  headline: string;
  reminderDetails: string;
  dateTime?: string;
  trainerName?: string;
  ctaText?: string;
  ctaUrl?: string;
  additionalInfo?: string;
}

// Styles
const greeting = {
  color: colors.primary,
  fontSize: "18px",
  lineHeight: "28px",
  margin: "0 0 24px",
};

const heading = {
  color: colors.primary,
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 16px",
};

const reminderBox = {
  backgroundColor: "#f8f9fa",
  borderLeft: `4px solid ${colors.accent}`,
  borderRadius: "0 8px 8px 0",
  padding: "20px 24px",
  margin: "24px 0",
};

const reminderIcon = {
  fontSize: "32px",
  margin: "0 0 12px",
};

const reminderTitle = {
  color: colors.primary,
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const reminderDetailsStyle = {
  color: colors.secondary,
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const dateTimeBox = {
  backgroundColor: colors.primary,
  borderRadius: "8px",
  padding: "16px 24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const dateTimeText = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
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

const trainerSection = {
  textAlign: "center" as const,
  margin: "24px 0 0",
};

const trainerText = {
  color: colors.secondary,
  fontSize: "14px",
  margin: "0",
};

const getReminderIcon = (type: string) => {
  switch (type) {
    case "session":
      return "🏋️";
    case "prescription":
      return "📋";
    case "check-in":
      return "💬";
    default:
      return "⏰";
  }
};

export default function ReminderTemplate({
  previewText,
  recipientName,
  reminderType,
  headline,
  reminderDetails,
  dateTime,
  trainerName,
  ctaText,
  ctaUrl,
  additionalInfo,
}: ReminderTemplateProps) {
  const icon = getReminderIcon(reminderType);

  return (
    <BaseTemplate previewText={previewText || headline}>
      {/* Greeting */}
      <Text style={greeting}>Hi {recipientName},</Text>

      {/* Headline */}
      <Heading style={heading}>{headline}</Heading>

      {/* Reminder Box */}
      <Section style={reminderBox}>
        <Text style={reminderIcon}>{icon}</Text>
        <Text style={reminderTitle}>
          {reminderType === "session" && "Upcoming Training Session"}
          {reminderType === "prescription" && "Your Exercise Prescription"}
          {reminderType === "check-in" && "Time for a Check-In"}
          {reminderType === "general" && "Reminder"}
        </Text>
        <Text style={reminderDetailsStyle}>{reminderDetails}</Text>
      </Section>

      {/* Date/Time */}
      {dateTime && (
        <Section style={dateTimeBox}>
          <Text style={dateTimeText}>📅 {dateTime}</Text>
        </Section>
      )}

      {/* Additional Info */}
      {additionalInfo && <Text style={bodyText}>{additionalInfo}</Text>}

      {/* CTA Button */}
      {ctaText && ctaUrl && (
        <Button href={ctaUrl} style={ctaButton}>
          {ctaText}
        </Button>
      )}

      {/* Trainer Signature */}
      {trainerName && (
        <>
          <Hr style={{ borderColor: colors.border, margin: "32px 0 16px" }} />
          <Section style={trainerSection}>
            <Text style={trainerText}>Your trainer,</Text>
            <Text style={{ ...trainerText, fontWeight: 600, color: colors.primary }}>
              {trainerName}
            </Text>
          </Section>
        </>
      )}
    </BaseTemplate>
  );
}

// Preview props
ReminderTemplate.PreviewProps = {
  recipientName: "John",
  reminderType: "session",
  headline: "Your Training Session is Tomorrow!",
  reminderDetails:
    "You have a personal training session scheduled with us. Please arrive 5-10 minutes early.",
  dateTime: "Tuesday, January 28 at 10:00 AM",
  trainerName: "Coach Mike",
  ctaText: "View Session Details",
  ctaUrl: "https://vettedtrainers.com/my-sessions",
  additionalInfo:
    "Please wear comfortable workout clothes and bring a water bottle. Let us know if you need to reschedule!",
} as ReminderTemplateProps;
