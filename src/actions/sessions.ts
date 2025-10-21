"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Session,
  SessionInsert,
  SessionUpdate,
  SessionWithDetails,
} from "@/types";

export async function getSessions(orderId?: string): Promise<{
  success: boolean;
  data?: SessionWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!sessions_tutor_id_fkey(
          id,
          payment_preference,
          payment_system_username,
          hourly_rate,
          profiles(first_name, last_name)
        ),
        order:orders(id, service_tier:service_tiers(service:services(title)))
      `,
      )
      .order("session_date", { ascending: false });

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // Flatten the nested data
    const sessions: SessionWithDetails[] =
      data?.map((session: any) => ({
        id: session.id,
        order_id: session.order_id,
        tutor_id: session.tutor_id,
        student_id: session.student_id,
        units_consumed: session.units_consumed,
        session_date: session.session_date,
        session_notes: session.session_notes,
        comments_to_student: session.comments_to_student,
        attachments: session.attachments,
        payout_status: session.payout_status,
        created_at: session.created_at,
        updated_at: session.updated_at,
        student_first_name: session.student?.first_name || null,
        student_last_name: session.student?.last_name || null,
        tutor_first_name: session.tutor?.profiles?.first_name || null,
        tutor_last_name: session.tutor?.profiles?.last_name || null,
        tutor_payment_preference: session.tutor?.payment_preference || null,
        tutor_payment_system_username: session.tutor?.payment_system_username || null,
        tutor_hourly_rate: session.tutor?.hourly_rate || null,
        order_service_title:
          session.order?.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: sessions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSessionById(
  id: string,
): Promise<{ success: boolean; data?: SessionWithDetails; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!sessions_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        order:orders(id, service_tier:service_tiers(service:services(title)))
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const session: SessionWithDetails = {
      id: data.id,
      order_id: data.order_id,
      tutor_id: data.tutor_id,
      student_id: data.student_id,
      units_consumed: data.units_consumed,
      session_date: data.session_date,
      session_notes: data.session_notes,
      comments_to_student: data.comments_to_student,
      attachments: data.attachments,
      payout_status: data.payout_status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      student_first_name: data.student?.first_name || null,
      student_last_name: data.student?.last_name || null,
      tutor_first_name: data.tutor_profile?.first_name || null,
      tutor_last_name: data.tutor_profile?.last_name || null,
      order_service_title: data.order?.service_tier?.service?.title || null,
    };

    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSessionsByTutor(tutorId: string): Promise<{
  success: boolean;
  data?: SessionWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!sessions_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        order:orders(id, service_tier:service_tiers(service:services(title)))
      `,
      )
      .eq("tutor_id", tutorId)
      .order("session_date", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const sessions: SessionWithDetails[] =
      data?.map((session: any) => ({
        id: session.id,
        order_id: session.order_id,
        tutor_id: session.tutor_id,
        student_id: session.student_id,
        units_consumed: session.units_consumed,
        session_date: session.session_date,
        session_notes: session.session_notes,
        comments_to_student: session.comments_to_student,
        attachments: session.attachments,
        payout_status: session.payout_status,
        created_at: session.created_at,
        updated_at: session.updated_at,
        student_first_name: session.student?.first_name || null,
        student_last_name: session.student?.last_name || null,
        tutor_first_name: session.tutor?.profiles?.first_name || null,
        tutor_last_name: session.tutor?.profiles?.last_name || null,
        order_service_title:
          session.order?.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: sessions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createSession(
  values: SessionInsert,
): Promise<{ success: boolean; data?: Session; error?: string }> {
  try {
    const supabase = await createClient();

    // The trigger will automatically update units_remaining in the orders table
    const { data, error } = await supabase
      .from("sessions")
      .insert(values)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch full session details with student and tutor information for email
    const { data: sessionDetails, error: detailsError } = await supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey(first_name, last_name, email),
        tutor:tutor_profiles!sessions_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        order:orders(id, service_tier:service_tiers(service:services(title)))
      `,
      )
      .eq("id", data.id)
      .single();

    // Get real student email from session details
    let tutorEmail = "tutor@freesidejockey.com"; // Keep tutor email hardcoded for now
    let studentEmail = sessionDetails?.student?.email || "student@freesidejockey.com";

    // Send session summary email (don't fail the session creation if email fails)
    if (sessionDetails && !detailsError) {
      try {
        const studentName =
          `${sessionDetails.student?.first_name || ""} ${sessionDetails.student?.last_name || ""}`.trim();
        const tutorName =
          `${sessionDetails.tutor?.profiles?.first_name || ""} ${sessionDetails.tutor?.profiles?.last_name || ""}`.trim();
        const subject =
          sessionDetails.order?.service_tier?.service?.title ||
          "Tutoring Session";

        // Format session date
        const sessionDate = new Date(
          sessionDetails.session_date,
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        // Calculate duration (assuming units_consumed represents hours or custom calculation)
        const duration = `${sessionDetails.units_consumed} ${sessionDetails.units_consumed === 1 ? "hour" : "hours"}`;

        console.log("Attempting to send session summary email...");
        console.log("Student email:", studentEmail);
        console.log("Tutor email:", tutorEmail);

        // Import Postmark and render functions
        const { ServerClient } = require("postmark");
        const { render } = require("@react-email/components");
        const React = require("react");

        // Import the email component properly
        const sessionSummaryModule = await import("@/emails/session-summary");
        const SessionSummaryEmail = sessionSummaryModule.default;

        const postmarkClient = new ServerClient(
          process.env.POSTMARK_API_TOKEN!,
        );

        // Render the email
        const emailHtml = await render(
          React.createElement(SessionSummaryEmail, {
            studentName,
            tutorName,
            subject,
            sessionDate,
            duration,
            notes: sessionDetails.comments_to_student,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          }),
        );

        // Prepare attachments for email
        const emailAttachments = [];
        if (sessionDetails.attachments && sessionDetails.attachments.length > 0) {
          console.log(`Processing ${sessionDetails.attachments.length} attachments...`);

          // Import storage utilities
          const { STORAGE_BUCKET } = require("@/types/storage");

          for (const attachment of sessionDetails.attachments) {
            try {
              // Get signed URL using the same method as the download modal
              const { data: signedData, error: signedError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(attachment.path, 3600); // 1 hour, same as getSignedUrl action

              if (signedError || !signedData) {
                console.error(`Failed to get signed URL for ${attachment.name}:`, signedError);
                continue;
              }

              // Download the file
              const fileResponse = await fetch(signedData.signedUrl);
              if (!fileResponse.ok) {
                console.error(`Failed to download ${attachment.name}`);
                continue;
              }

              // Convert to buffer then base64
              const arrayBuffer = await fileResponse.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const base64Content = buffer.toString('base64');

              // Determine content type from file extension
              const extension = attachment.name.split('.').pop()?.toLowerCase();
              const contentTypeMap: Record<string, string> = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'txt': 'text/plain',
                'csv': 'text/csv',
              };
              const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

              emailAttachments.push({
                Name: attachment.name,
                Content: base64Content,
                ContentType: contentType,
              });

              console.log(`Successfully processed attachment: ${attachment.name}`);
            } catch (attachmentError) {
              console.error(`Error processing attachment ${attachment.name}:`, attachmentError);
              // Continue with other attachments
            }
          }
        }

        // Send via Postmark directly
        const result = await postmarkClient.sendEmail({
          From: "admin@freesidejockey.com",
          To: studentEmail,
          Subject: `Session Summary - ${subject} with ${tutorName}`,
          HtmlBody: emailHtml,
          Attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
        });

        console.log("Email sent successfully! Message ID:", result.MessageID);
        if (emailAttachments.length > 0) {
          console.log(`Sent with ${emailAttachments.length} attachments`);
        }
      } catch (emailError) {
        // Log email error but don't fail the session creation
        console.error("Failed to send session summary email:", emailError);
      }
    } else {
      console.log("Session details not found or error:", detailsError);
    }

    revalidatePath("/tutor/sessions");
    revalidatePath("/admin/orders");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateSession(
  id: string,
  values: SessionUpdate,
): Promise<{ success: boolean; data?: Session; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sessions")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/tutor/sessions");
    revalidatePath("/admin/orders");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteSession(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("sessions").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/tutor/sessions");
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateSessionPayoutStatus(
  id: string,
  status: "pending" | "paid_out",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("sessions")
      .update({ payout_status: status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/finances");
    revalidatePath("/tutor/sessions");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
