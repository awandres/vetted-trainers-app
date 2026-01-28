import {
  Button,
  Heading,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import BaseTemplate, { colors } from "./BaseTemplate";

interface PrescriptionExercise {
  order: number;
  name: string;
  sets?: number | null;
  reps?: string | null;
  duration?: string | null;
  notes?: string | null;
}

interface PrescriptionTemplateProps {
  previewText?: string;
  recipientName: string;
  prescriptionName: string;
  trainerName?: string;
  notes?: string | null;
  exercises: PrescriptionExercise[];
  viewUrl: string;
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
  margin: "0 0 8px",
};

const subheading = {
  color: colors.secondary,
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px",
};

const notesBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 24px",
};

const notesLabel = {
  color: colors.secondary,
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const notesText = {
  color: colors.primary,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
  fontStyle: "italic" as const,
};

const exercisesHeader = {
  color: colors.primary,
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const exerciseRow = {
  borderBottom: `1px solid ${colors.border}`,
  padding: "16px 0",
};

const exerciseNumber = {
  backgroundColor: colors.accent,
  color: "#ffffff",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "28px",
  fontSize: "14px",
  fontWeight: "600",
};

const exerciseName = {
  color: colors.primary,
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const exerciseParams = {
  color: colors.secondary,
  fontSize: "14px",
  margin: "0",
};

const exerciseNotes = {
  color: colors.secondary,
  fontSize: "13px",
  fontStyle: "italic" as const,
  margin: "4px 0 0",
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
  margin: "32px auto 16px",
};

const viewOnlineText = {
  color: colors.secondary,
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0",
};

const trainerSection = {
  textAlign: "center" as const,
  margin: "32px 0 0",
};

const trainerText = {
  color: colors.secondary,
  fontSize: "14px",
  margin: "0",
};

export default function PrescriptionTemplate({
  previewText,
  recipientName,
  prescriptionName,
  trainerName,
  notes,
  exercises,
  viewUrl,
}: PrescriptionTemplateProps) {
  return (
    <BaseTemplate previewText={previewText || `Your exercise prescription: ${prescriptionName}`}>
      {/* Greeting */}
      <Text style={greeting}>Hi {recipientName},</Text>

      {/* Headline */}
      <Heading style={heading}>📋 Your Exercise Prescription</Heading>
      <Text style={subheading}>{prescriptionName}</Text>

      {/* Notes */}
      {notes && (
        <Section style={notesBox}>
          <Text style={notesLabel}>Notes from your trainer</Text>
          <Text style={notesText}>{notes}</Text>
        </Section>
      )}

      {/* Exercises List */}
      <Text style={exercisesHeader}>
        Your workout ({exercises.length} exercise{exercises.length !== 1 ? "s" : ""})
      </Text>

      <Section>
        {exercises.slice(0, 6).map((exercise) => {
          const params = [
            exercise.sets ? `${exercise.sets} sets` : null,
            exercise.reps ? `${exercise.reps} reps` : null,
            exercise.duration,
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <Row key={exercise.order} style={exerciseRow}>
              <Column style={{ width: "40px", verticalAlign: "top" }}>
                <div style={exerciseNumber}>{exercise.order}</div>
              </Column>
              <Column style={{ paddingLeft: "12px" }}>
                <Text style={exerciseName}>{exercise.name}</Text>
                {params && <Text style={exerciseParams}>{params}</Text>}
                {exercise.notes && (
                  <Text style={exerciseNotes}>"{exercise.notes}"</Text>
                )}
              </Column>
            </Row>
          );
        })}

        {exercises.length > 6 && (
          <Text style={{ ...exerciseParams, textAlign: "center", margin: "16px 0" }}>
            + {exercises.length - 6} more exercise{exercises.length - 6 !== 1 ? "s" : ""}...
          </Text>
        )}
      </Section>

      {/* CTA */}
      <Button href={viewUrl} style={ctaButton}>
        View Full Prescription
      </Button>
      <Text style={viewOnlineText}>
        Click to see exercise videos and detailed instructions
      </Text>

      {/* Trainer Signature */}
      {trainerName && (
        <>
          <Hr style={{ borderColor: colors.border, margin: "32px 0 16px" }} />
          <Section style={trainerSection}>
            <Text style={trainerText}>Prescribed by</Text>
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
PrescriptionTemplate.PreviewProps = {
  recipientName: "John",
  prescriptionName: "Hip Mobility Routine",
  trainerName: "Coach Sarah",
  notes: "Focus on breathing through each stretch. Do this routine 2-3 times per week before bed.",
  exercises: [
    { order: 1, name: "90/90 Hip Stretch", sets: 3, reps: "30 sec each side" },
    { order: 2, name: "Pigeon Pose", duration: "60 seconds each side", notes: "Go slow, don't bounce" },
    { order: 3, name: "Hip Flexor Stretch", sets: 2, reps: "45 sec each side" },
    { order: 4, name: "Frog Stretch", sets: 3, duration: "30 seconds" },
    { order: 5, name: "Butterfly Stretch", sets: 2, duration: "45 seconds" },
    { order: 6, name: "Deep Squat Hold", sets: 3, duration: "30 seconds" },
    { order: 7, name: "Happy Baby", duration: "60 seconds" },
    { order: 8, name: "Cat-Cow Stretch", sets: 2, reps: "10 each" },
  ],
  viewUrl: "https://vettedtrainers.com/prescriptions/abc123",
} as PrescriptionTemplateProps;
