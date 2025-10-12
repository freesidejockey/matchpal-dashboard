import { NextResponse } from "next/server";
import { ServerClient } from "postmark";
import { render } from "@react-email/components";
import SessionSummaryEmail from "@/emails/session-summary";

const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN!);

export async function POST(request: Request) {
  try {
    console.log("=== Session Summary Email API Called ===");
    const requestBody = await request.json();
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const {
      studentName,
      studentEmail,
      tutorName,
      tutorEmail,
      subject,
      sessionDate,
      duration,
      notes,
      dashboardUrl,
    } = requestBody;

    // Validate required fields
    if (
      !studentName ||
      !studentEmail ||
      !tutorName ||
      !subject ||
      !sessionDate ||
      !duration
    ) {
      console.error("Missing required fields:", {
        studentName: !!studentName,
        studentEmail: !!studentEmail,
        tutorName: !!tutorName,
        subject: !!subject,
        sessionDate: !!sessionDate,
        duration: !!duration,
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Render the React email to HTML
    console.log("Rendering email HTML...");
    const emailHtml = await render(
      SessionSummaryEmail({
        studentName,
        tutorName,
        subject,
        sessionDate,
        duration,
        notes,
        dashboardUrl:
          dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }),
    );
    console.log("Email HTML rendered successfully");

    // Send email to student (main recipient)
    console.log("Sending email via Postmark...");
    console.log("From:", "admin@freesidejockey.com");
    console.log("To:", "test@freesidejockey.com");
    console.log("Subject:", `Session Summary - ${subject} with ${tutorName}`);

    const result = await postmark.sendEmail({
      From: "admin@freesidejockey.com",
      To: "test@freesidejockey.com",
      Subject: `Session Summary - ${subject} with ${tutorName}`,
      HtmlBody: emailHtml,
    });

    console.log("Email sent successfully! Message ID:", result.MessageID);

    return NextResponse.json({
      success: true,
      messageId: result.MessageID,
      recipient: studentEmail,
    });
  } catch (error) {
    console.error("Session summary email send error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send session summary email",
      },
      { status: 500 },
    );
  }
}
