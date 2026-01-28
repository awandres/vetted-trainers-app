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

// Brand colors
const colors = {
  primary: "#1a1a1a",
  secondary: "#666666",
  accent: "#E53935",
  background: "#f4f4f4",
  white: "#ffffff",
  border: "#e0e0e0",
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

const logo = {
  margin: "0 auto 24px",
  display: "block",
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

const socialLinks = {
  margin: "16px 0",
};

const socialIcon = {
  width: "24px",
  height: "24px",
  margin: "0 8px",
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
            <Img
              src="https://vettedtrainers.com/images/vetted-logo.png"
              width="180"
              height="auto"
              alt="Vetted Trainers"
              style={logo}
            />
            
            {/* Content */}
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            {/* Social Links */}
            <div style={socialLinks}>
              <Link href="https://instagram.com/vettedtrainers">
                <Img
                  src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
                  width="24"
                  height="24"
                  alt="Instagram"
                  style={socialIcon}
                />
              </Link>
              <Link href="https://facebook.com/vettedtrainers">
                <Img
                  src="https://cdn-icons-png.flaticon.com/512/174/174848.png"
                  width="24"
                  height="24"
                  alt="Facebook"
                  style={socialIcon}
                />
              </Link>
            </div>

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
