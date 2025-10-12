"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function SendTestEmailButton() {
  const [isSending, setIsSending] = useState(false);

  const sendTestEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: "Test User",
          recipientEmail: "test@freesidejockey.com",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test email sent successfully!", {
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
      variant="primary"
      size="default"
    >
      {isSending ? "Sending..." : "Send Test Email"}
    </Button>
  );
}
