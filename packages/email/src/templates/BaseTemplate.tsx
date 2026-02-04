import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface BaseTemplateProps {
  previewText: string;
  children: React.ReactNode;
}

// VT Brand colors
const colors = {
  primary: "#1a1a1a",         // Dark graphite for text
  secondary: "#6b7280",       // Muted gray for secondary text
  accent: "#2563eb",          // VT Blue (primary brand color)
  accentDark: "#1d4ed8",      // Darker blue for hover states
  background: "#f3f4f6",      // Light gray background
  white: "#ffffff",
  border: "#e5e7eb",
  graphite: "#374151",        // VT Graphite
  success: "#10b981",         // Green for success states
};

// Styles
const main = {
  backgroundColor: colors.background,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const content = {
  backgroundColor: colors.white,
  borderRadius: "8px",
  padding: "40px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const footer = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  color: colors.secondary,
  fontSize: "12px",
  lineHeight: "20px",
  margin: "8px 0",
};

const footerLink = {
  color: colors.secondary,
  textDecoration: "underline",
};

const socialLinksContainer = {
  textAlign: "center" as const,
  margin: "16px 0",
};

const socialLinksTable = {
  margin: "0 auto",
};

const socialIconCell = {
  padding: "0 8px",
};

export default function BaseTemplate({
  previewText,
  children,
}: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            {/* Logo */}
            <Section style={{ textAlign: "center", marginBottom: "24px" }}>
              <Img
                src="https://vettedtrainers.com/images/vetted-logo.png"
                width="180"
                height="auto"
                alt="Vetted Trainers"
                style={{ margin: "0 auto", display: "block" }}
              />
            </Section>
            
            {/* Content */}
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            {/* Social Links - Using table for proper horizontal alignment */}
            <Section style={socialLinksContainer}>
              <table style={socialLinksTable}>
                <tbody>
                  <tr>
                    <td style={socialIconCell}>
                      <Link href="https://instagram.com/vettedtrainers">
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
                          width="28"
                          height="28"
                          alt="Instagram"
                        />
                      </Link>
                    </td>
                    <td style={socialIconCell}>
                      <Link href="https://facebook.com/vettedtrainers">
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/174/174848.png"
                          width="28"
                          height="28"
                          alt="Facebook"
                        />
                      </Link>
                    </td>
                    <td style={socialIconCell}>
                      <Link href="https://youtube.com/@vettedtrainers">
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/174/174883.png"
                          width="28"
                          height="28"
                          alt="YouTube"
                        />
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text style={footerText}>
              Vetted Trainers • Premier Personal Training
            </Text>
            <Text style={footerText}>
              123 Fitness Street, Dallas, TX 75201
            </Text>
            <Hr style={{ borderColor: colors.border, margin: "16px 0" }} />
            <Text style={footerText}>
              You're receiving this email because you're a valued member of Vetted Trainers.
              <br />
              <Link href="{{unsubscribe_url}}" style={footerLink}>
                Unsubscribe
              </Link>
              {" • "}
              <Link href="https://vettedtrainers.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Export styles for use in child templates
export { colors };
