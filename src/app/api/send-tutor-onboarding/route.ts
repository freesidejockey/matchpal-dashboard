import { NextResponse } from "next/server";
import { ServerClient } from "postmark";
import { render } from "@react-email/components";
import TutorOnboardingEmail from "@/emails/tutor-onboarding";

const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN!);

export async function POST(request: Request) {
  try {
    const { firstName, recipientEmail, magicLink } = await request.json();

    // Validate required fields
    if (!firstName || !recipientEmail || !magicLink) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: firstName, recipientEmail, magicLink",
        },
        { status: 400 },
      );
    }

    // Render the React email to HTML
    const emailHtml = await render(
      TutorOnboardingEmail({ firstName, magicLink }),
    );

    // Send via Postmark
    const result = await postmark.sendEmail({
      From: "admin@freesidejockey.com",
      To: recipientEmail,
      Subject: "You're Invited to Join MatchPal as an Advisor",
      HtmlBody: emailHtml,
    });

    return NextResponse.json({ success: true, messageId: result.MessageID });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    );
  }
}
