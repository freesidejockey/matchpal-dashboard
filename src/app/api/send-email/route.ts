import { NextResponse } from "next/server";
import { ServerClient } from "postmark";
import { render } from "@react-email/components";
import WelcomeEmail from "@/emails/welcome";

const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN!);

export async function POST(request: Request) {
  try {
    const { userName, recipientEmail } = await request.json();

    // Render the React email to HTML
    const emailHtml = await render(WelcomeEmail({ userName }));

    // Send via Postmark
    const result = await postmark.sendEmail({
      From: "admin@freesidejockey.com",
      To: recipientEmail,
      Subject: "Welcome to Our Platform!",
      HtmlBody: emailHtml,
    });

    return NextResponse.json({ success: true, messageId: result.MessageID });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    );
  }
}
