"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Revision,
  RevisionInsert,
  RevisionWithDetails,
} from "@/types";

export async function getRevisions(orderId?: string): Promise<{
  success: boolean;
  data?: RevisionWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("revisions")
      .select(
        `
        *,
        order:orders!revisions_order_id_fkey(
          id,
          student:students!orders_student_id_fkey(first_name, last_name, email),
          service_tier:service_tiers(service:services(title))
        ),
        tutor:tutor_profiles!revisions_tutor_id_fkey(
          id,
          payment_preference,
          payment_system_username,
          profiles(first_name, last_name)
        )
      `,
      )
      .order("completed_at", { ascending: false });

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // Flatten the nested data
    const revisions: RevisionWithDetails[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.map((revision: any) => ({
        id: revision.id,
        order_id: revision.order_id,
        tutor_id: revision.tutor_id,
        completed_at: revision.completed_at,
        revised_document_url: revision.revised_document_url,
        comments: revision.comments,
        payout_status: revision.payout_status,
        created_at: revision.created_at,
        updated_at: revision.updated_at,
        student_first_name: revision.order?.student?.first_name || null,
        student_last_name: revision.order?.student?.last_name || null,
        student_email: revision.order?.student?.email || null,
        tutor_first_name: revision.tutor?.profiles?.first_name || null,
        tutor_last_name: revision.tutor?.profiles?.last_name || null,
        tutor_payment_preference: revision.tutor?.payment_preference || null,
        tutor_payment_system_username: revision.tutor?.payment_system_username || null,
        order_service_title:
          revision.order?.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: revisions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getRevisionsByTutor(tutorId: string): Promise<{
  success: boolean;
  data?: RevisionWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("revisions")
      .select(
        `
        *,
        order:orders!revisions_order_id_fkey(
          id,
          student:students!orders_student_id_fkey(first_name, last_name, email),
          service_tier:service_tiers(service:services(title))
        ),
        tutor:tutor_profiles!revisions_tutor_id_fkey(
          id,
          payment_preference,
          payment_system_username,
          profiles(first_name, last_name)
        )
      `,
      )
      .eq("tutor_id", tutorId)
      .order("completed_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const revisions: RevisionWithDetails[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.map((revision: any) => ({
        id: revision.id,
        order_id: revision.order_id,
        tutor_id: revision.tutor_id,
        completed_at: revision.completed_at,
        revised_document_url: revision.revised_document_url,
        comments: revision.comments,
        payout_status: revision.payout_status,
        created_at: revision.created_at,
        updated_at: revision.updated_at,
        student_first_name: revision.order?.student?.first_name || null,
        student_last_name: revision.order?.student?.last_name || null,
        student_email: revision.order?.student?.email || null,
        tutor_first_name: revision.tutor?.profiles?.first_name || null,
        tutor_last_name: revision.tutor?.profiles?.last_name || null,
        tutor_payment_preference: revision.tutor?.payment_preference || null,
        tutor_payment_system_username: revision.tutor?.payment_system_username || null,
        order_service_title:
          revision.order?.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: revisions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createRevision(
  values: RevisionInsert,
): Promise<{ success: boolean; data?: Revision; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate order has revisions available
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("revisions_total, revisions_used, tutor_id")
      .eq("id", values.order_id)
      .single();

    if (orderError || !order) {
      return { success: false, error: "Order not found" };
    }

    // Check that this is a revision-type order
    if (order.revisions_total === null) {
      return { success: false, error: "This order does not support revisions" };
    }

    // Check that order belongs to the tutor
    if (order.tutor_id !== values.tutor_id) {
      return { success: false, error: "Order is not assigned to this tutor" };
    }

    // Check revisions available
    if ((order.revisions_used || 0) >= order.revisions_total) {
      return { success: false, error: "No revisions remaining for this order" };
    }

    // Create the revision
    const { data, error } = await supabase
      .from("revisions")
      .insert(values)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Increment revisions_used on the order
    const { error: updateError } = await supabase
      .from("orders")
      .update({ revisions_used: (order.revisions_used || 0) + 1 })
      .eq("id", values.order_id);

    if (updateError) {
      // Rollback the revision creation if update fails
      await supabase.from("revisions").delete().eq("id", data.id);
      return { success: false, error: "Failed to update order revision count" };
    }

    // Fetch full revision details with student and tutor information for email
    const { data: revisionDetails, error: detailsError } = await supabase
      .from("revisions")
      .select(
        `
        *,
        order:orders!revisions_order_id_fkey(
          id,
          student:students!orders_student_id_fkey(first_name, last_name, email),
          service_tier:service_tiers(service:services(title))
        ),
        tutor:tutor_profiles!revisions_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        )
      `,
      )
      .eq("id", data.id)
      .single();

    // Send revision completion email (don't fail the revision creation if email fails)
    if (revisionDetails && !detailsError) {
      try {
        const studentName =
          `${revisionDetails.order?.student?.first_name || ""} ${revisionDetails.order?.student?.last_name || ""}`.trim();
        const tutorName =
          `${revisionDetails.tutor?.profiles?.first_name || ""} ${revisionDetails.tutor?.profiles?.last_name || ""}`.trim();
        const subject =
          revisionDetails.order?.service_tier?.service?.title ||
          "Document Revision";
        const studentEmail = revisionDetails.order?.student?.email || "student@freesidejockey.com";

        // Format completion date
        const completedDate = new Date(
          revisionDetails.completed_at,
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        console.log("Attempting to send revision completion email...");
        console.log("Student email:", studentEmail);

        // Import Postmark and render functions
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ServerClient } = require("postmark");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { render } = require("@react-email/components");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require("react");

        // Import the email component
        const revisionCompletionModule = await import("@/emails/revision-completion");
        const RevisionCompletionEmail = revisionCompletionModule.default;

        const postmarkClient = new ServerClient(
          process.env.POSTMARK_API_TOKEN!,
        );

        // Get signed URL for the revised document
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { STORAGE_BUCKET } = require("@/types/storage");
        const { data: signedData } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(revisionDetails.revised_document_url, 86400); // 24 hours

        const documentLink = signedData?.signedUrl || "#";

        // Render the email
        const emailHtml = await render(
          React.createElement(RevisionCompletionEmail, {
            studentName,
            tutorName,
            subject,
            completedDate,
            comments: revisionDetails.comments,
            documentLink,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          }),
        );

        // Send via Postmark
        const result = await postmarkClient.sendEmail({
          From: "admin@freesidejockey.com",
          To: studentEmail,
          Subject: `Revision Complete - ${subject} by ${tutorName}`,
          HtmlBody: emailHtml,
        });

        console.log("Email sent successfully! Message ID:", result.MessageID);
      } catch (emailError) {
        // Log email error but don't fail the revision creation
        console.error("Failed to send revision completion email:", emailError);
      }
    }

    revalidatePath("/tutor/revisions");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finances");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateRevisionPayoutStatus(
  id: string,
  status: "pending" | "paid_out",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("revisions")
      .update({ payout_status: status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/finances");
    revalidatePath("/tutor/revisions");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
