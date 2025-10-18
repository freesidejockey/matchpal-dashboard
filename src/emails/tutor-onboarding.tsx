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

interface TutorOnboardingEmailProps {
  firstName: string;
  magicLink: string;
}

export const TutorOnboardingEmail = ({
  firstName,
  magicLink,
}: TutorOnboardingEmailProps) => (
  <Html>
    <Head />
    <Preview>
      You're Invited to Join MatchPal as an Advisor - Complete Your Profile to Get Started
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Img
            src={`https://matchpal-dashboard.vercel.app/images/logo/Secondary_Logo.png`}
            alt="MatchPal"
            width="154"
            height="32"
            style={logo}
          />
        </Section>

        {/* Hero Section */}
        <Section style={heroSection}>
          <Heading style={h1}>Welcome to MatchPal, {firstName}!</Heading>
          <Text style={leadText}>
            You've been invited to join our team of advisors. We're excited to
            have you help students achieve their academic goals.
          </Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Text style={text}>
            Our admin team has created an account for you. To get started,
            you'll need to complete your advisor profile and set up your account.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>What happens next:</Text>
            <Text style={infoItem}>1. Click the button below to begin</Text>
            <Text style={infoItem}>2. Create your secure password</Text>
            <Text style={infoItem}>3. Complete your advisor profile</Text>
            <Text style={infoItem}>4. Start connecting with students!</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href={magicLink} style={button}>
              Complete Your Profile
            </Link>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⏰ <strong>Important:</strong> This invitation link will expire in
              48 hours. If you need a new link, please contact your administrator.
            </Text>
          </Section>

          <Text style={text}>
            If you have any questions or need assistance, our support team is
            here to help.
          </Text>
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
            If you didn't expect this invitation, you can safely ignore this email.
          </Text>
          <Text style={footerText}>© 2025 MatchPal. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default TutorOnboardingEmail;

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

const infoBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const infoTitle = {
  color: "#101828",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const infoItem = {
  color: "#475467",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "32px 0",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
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
