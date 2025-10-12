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

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Welcome to MatchPal - Your journey to academic success starts here!
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
          <Heading style={h1}>Welcome to MatchPal, {userName}!</Heading>
          <Text style={leadText}>
            We're thrilled to have you join our community of learners and
            educators.
          </Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Text style={text}>
            MatchPal connects students with the perfect tutors to help them
            achieve their academic goals. Whether you're looking to excel in a
            challenging subject, prepare for exams, or explore new topics, we're
            here to support your learning journey.
          </Text>

          <Section style={featuresBox}>
            <Text style={featureTitle}>What you can do with MatchPal:</Text>
            <Text style={featureItem}>
              ✓ Find expert tutors matched to your needs
            </Text>
            <Text style={featureItem}>
              ✓ Schedule and manage tutoring sessions
            </Text>
            <Text style={featureItem}>✓ Track your learning progress</Text>
            <Text style={featureItem}>✓ Access resources and materials</Text>
          </Section>

          <Text style={text}>
            Ready to get started? Log in to your dashboard and explore
            everything MatchPal has to offer.
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href="http://localhost:3000/signin" style={button}>
              Go to Dashboard
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
          <Text style={footerText}>© 2025 MatchPal. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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

const featuresBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const featureTitle = {
  color: "#101828",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const featureItem = {
  color: "#475467",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
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
