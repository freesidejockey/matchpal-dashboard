"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Order, OrderInsert, OrderUpdate, OrderWithDetails } from "@/types";

export async function getOrders(): Promise<{
  success: boolean;
  data?: OrderWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        student:students!orders_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!orders_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        service_tier:service_tiers(tier_name, service:services(title))
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Flatten the nested data
    const orders: OrderWithDetails[] =
      data?.map((order: any) => ({
        id: order.id,
        student_id: order.student_id,
        service_tier_id: order.service_tier_id,
        tutor_id: order.tutor_id,
        payment_status: order.payment_status,
        assignment_status: order.assignment_status,
        total_units: order.total_units,
        units_remaining: order.units_remaining,
        hourly_rate_locked: order.hourly_rate_locked,
        status_notes: order.status_notes,
        revisions_total: order.revisions_total,
        revisions_used: order.revisions_used,
        initial_document_url: order.initial_document_url,
        created_at: order.created_at,
        updated_at: order.updated_at,
        assigned_at: order.assigned_at,
        completed_at: order.completed_at,
        student_first_name: order.student?.first_name || null,
        student_last_name: order.student?.last_name || null,
        tutor_first_name: order.tutor?.profiles?.first_name || null,
        tutor_last_name: order.tutor?.profiles?.last_name || null,
        service_tier_name: order.service_tier?.tier_name || null,
        service_title: order.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: orders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getOrderById(
  id: string,
): Promise<{ success: boolean; data?: OrderWithDetails; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        student:students!orders_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!orders_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        service_tier:service_tiers(tier_name, service:services(title))
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const order: OrderWithDetails = {
      id: data.id,
      student_id: data.student_id,
      service_tier_id: data.service_tier_id,
      tutor_id: data.tutor_id,
      payment_status: data.payment_status,
      assignment_status: data.assignment_status,
      total_units: data.total_units,
      units_remaining: data.units_remaining,
      hourly_rate_locked: data.hourly_rate_locked,
      status_notes: data.status_notes,
      revisions_total: data.revisions_total,
      revisions_used: data.revisions_used,
      initial_document_url: data.initial_document_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      assigned_at: data.assigned_at,
      completed_at: data.completed_at,
      student_first_name: data.student?.first_name || null,
      student_last_name: data.student?.last_name || null,
      tutor_first_name: data.tutor_profile?.first_name || null,
      tutor_last_name: data.tutor_profile?.last_name || null,
      service_tier_name: data.service_tier?.tier_name || null,
      service_title: data.service_tier?.service?.title || null,
    };

    return { success: true, data: order };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getOrdersByStudent(
  studentId: string,
): Promise<{
  success: boolean;
  data?: OrderWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        student:students!orders_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!orders_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        service_tier:service_tiers(tier_name, service:services(title))
      `,
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const orders: OrderWithDetails[] =
      data?.map((order: any) => ({
        id: order.id,
        student_id: order.student_id,
        service_tier_id: order.service_tier_id,
        tutor_id: order.tutor_id,
        payment_status: order.payment_status,
        assignment_status: order.assignment_status,
        total_units: order.total_units,
        units_remaining: order.units_remaining,
        hourly_rate_locked: order.hourly_rate_locked,
        status_notes: order.status_notes,
        revisions_total: order.revisions_total,
        revisions_used: order.revisions_used,
        initial_document_url: order.initial_document_url,
        created_at: order.created_at,
        updated_at: order.updated_at,
        assigned_at: order.assigned_at,
        completed_at: order.completed_at,
        student_first_name: order.student?.first_name || null,
        student_last_name: order.student?.last_name || null,
        tutor_first_name: order.tutor?.profiles?.first_name || null,
        tutor_last_name: order.tutor?.profiles?.last_name || null,
        service_tier_name: order.service_tier?.tier_name || null,
        service_title: order.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: orders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getOrdersByTutor(
  tutorId: string,
): Promise<{
  success: boolean;
  data?: OrderWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        student:students!orders_student_id_fkey(first_name, last_name),
        tutor:tutor_profiles!orders_tutor_id_fkey(
          id,
          profiles(first_name, last_name)
        ),
        service_tier:service_tiers(tier_name, service:services(title))
      `,
      )
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const orders: OrderWithDetails[] =
      data?.map((order: any) => ({
        id: order.id,
        student_id: order.student_id,
        service_tier_id: order.service_tier_id,
        tutor_id: order.tutor_id,
        payment_status: order.payment_status,
        assignment_status: order.assignment_status,
        total_units: order.total_units,
        units_remaining: order.units_remaining,
        hourly_rate_locked: order.hourly_rate_locked,
        status_notes: order.status_notes,
        revisions_total: order.revisions_total,
        revisions_used: order.revisions_used,
        initial_document_url: order.initial_document_url,
        created_at: order.created_at,
        updated_at: order.updated_at,
        assigned_at: order.assigned_at,
        completed_at: order.completed_at,
        student_first_name: order.student?.first_name || null,
        student_last_name: order.student?.last_name || null,
        tutor_first_name: order.tutor?.profiles?.first_name || null,
        tutor_last_name: order.tutor?.profiles?.last_name || null,
        service_tier_name: order.service_tier?.tier_name || null,
        service_title: order.service_tier?.service?.title || null,
      })) || [];

    return { success: true, data: orders };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createOrder(
  values: OrderInsert,
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .insert(values)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/orders");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateOrder(
  id: string,
  values: OrderUpdate,
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/orders");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteOrder(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
