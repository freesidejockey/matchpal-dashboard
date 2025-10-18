"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function SendTestTutorOnboardingButton() {
  const [isSending, setIsSending] = useState(false);

  const sendTestEmail = async () => {
    setIsSending(true);
    try {
      // For testing, just use a dummy token and link
      const baseUrl = window.location.origin;
      const magicLink = `${baseUrl}/onboarding?token=test-token-123456`;

      const response = await fetch("/api/send-tutor-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Test Advisor",
          recipientEmail: "test@freesidejockey.com",
          magicLink: magicLink,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test tutor onboarding email sent!", {
          description: `Message ID: ${data.messageId}`,
        });
      } else {
        toast.error("Failed to send email", {
          description: data.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      toast.error("Failed to send email", {
        description: "Network error occurred",
      });
      console.error("Email send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      onClick={sendTestEmail}
      disabled={isSending}
      variant="outline"
      size="default"
    >
      {isSending ? "Sending..." : "Send Test Tutor Invite"}
    </Button>
  );
}
