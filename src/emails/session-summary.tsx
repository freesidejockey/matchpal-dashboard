import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SessionSummaryEmailProps {
  studentName: string;
  tutorName: string;
  subject: string;
  sessionDate: string;
  duration: string;
  notes?: string;
  dashboardUrl: string;
}

export const SessionSummaryEmail = ({
  studentName,
  tutorName,
  subject,
  sessionDate,
  duration,
  notes,
  dashboardUrl,
}: SessionSummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Session Summary - {subject} with {tutorName}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Img
            src="https://matchpal-dashboard.vercel.app/images/logo/Secondary_Logo.png"
            alt="MatchPal"
            width="154"
            height="32"
            style={logo}
          />
        </Section>

        {/* Hero Section */}
        <Section style={heroSection}>
          <Heading style={h1}>Session Summary</Heading>
          <Text style={leadText}>
            Here's a summary of your recent tutoring session.
          </Text>
        </Section>

        {/* Session Details */}
        <Section style={content}>
          <Section style={detailsBox}>
            <Text style={detailsTitle}>Session Details</Text>

            <Section style={detailRow}>
              <Text style={detailLabel}>Student:</Text>
              <Text style={detailValue}>{studentName}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>Tutor:</Text>
              <Text style={detailValue}>{tutorName}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>Subject:</Text>
              <Text style={detailValue}>{subject}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>Date & Time:</Text>
              <Text style={detailValue}>{sessionDate}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>Duration:</Text>
              <Text style={detailValue}>{duration}</Text>
            </Section>
          </Section>

          {notes && (
            <Section style={notesBox}>
              <Text style={notesTitle}>Session Notes</Text>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}

          <Text style={text}>
            You can view the complete session details and any attached materials in your dashboard.
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={button}>
              View Session Details
            </Link>
          </Section>
        </Section>

        {/* Footer */}
        <Hr style={hr} />
        <Section style={footer}>
          <Text style={footerText}>
            Need help? Contact us at{" "}
            <Link href="mailto:admin@freesidejockey.com" style={link}>
              admin@freesidejockey.com
            </Link>
          </Text>
          <Text style={footerText}>
            © 2025 MatchPal. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default SessionSummaryEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const header = {
  backgroundColor: "#465fff",
  padding: "32px 48px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  filter: "brightness(0) invert(1)",
};

const heroSection = {
  padding: "48px 48px 24px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#101828",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 16px",
  lineHeight: "1.3",
};

const leadText = {
  color: "#475467",
  fontSize: "18px",
  lineHeight: "28px",
  margin: "0",
};

const content = {
  padding: "0 48px 48px",
};

const text = {
  color: "#475467",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "24px 0",
};

const detailsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const detailsTitle = {
  color: "#101828",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 20px",
};

const detailRow = {
  marginBottom: "16px",
};

const detailLabel = {
  color: "#475467",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const detailValue = {
  color: "#101828",
  fontSize: "16px",
  fontWeight: "400",
  margin: "0",
};

const notesBox = {
  backgroundColor: "#f0f4ff",
  borderLeft: "4px solid #465fff",
  borderRadius: "4px",
  padding: "20px",
  margin: "24px 0",
};

const notesTitle = {
  color: "#101828",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const notesText = {
  color: "#475467",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#465fff",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const footer = {
  padding: "32px 48px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#98a2b3",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const link = {
  color: "#465fff",
  textDecoration: "none",
};
