"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Session, SessionInsert, SessionUpdate, SessionWithDetails } from "@/types";

export async function getSessions(
  orderId?: string,
): Promise<{
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

export async function getSessionsByTutor(
  tutorId: string,
): Promise<{
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
