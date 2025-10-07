"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Student = {
  id: string;
  email: string;
  phone_number: string;
  medical_school: string;
  current_year_in_school: string;
  specialty: string;
  services_interested: string[];
  referral_source: string;
  specific_advisor: string | null;
  promo_code: string | null;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
};

export type StudentInsert = Omit<Student, "id" | "created_at" | "updated_at">;

export type StudentUpdate = Partial<
  Omit<Student, "id" | "created_at" | "updated_at">
>;

export async function getStudents(): Promise<{
  success: boolean;
  data?: Student[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getStudentById(
  id: string,
): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createStudent(
  values: StudentInsert,
): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .insert(values)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate the page cache
    revalidatePath("/students");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateStudent(
  id: string,
  values: StudentUpdate,
): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate the page cache
    revalidatePath("/students");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteStudent(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    // Check if any rows were actually deleted
    if (!data || data.length === 0) {
      return {
        success: false,
        error: "No student found with that ID or deletion not permitted",
      };
    }

    // Revalidate the page cache
    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getStudentsByTutor(
  tutorId: string,
): Promise<{
  success: boolean;
  data?: Student[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // First, get all orders for this tutor
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("student_id")
      .eq("tutor_id", tutorId);

    if (ordersError) {
      return { success: false, error: ordersError.message };
    }

    // If no orders found, return empty array
    if (!orders || orders.length === 0) {
      return { success: true, data: [] };
    }

    // Extract unique student IDs from orders
    const studentIds = Array.from(
      new Set(orders.map((order) => order.student_id).filter(Boolean)),
    );

    // If no student IDs found, return empty array
    if (studentIds.length === 0) {
      return { success: true, data: [] };
    }

    // Now fetch the students with these IDs
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .in("id", studentIds)
      .order("created_at", { ascending: false });

    if (studentsError) {
      return { success: false, error: studentsError.message };
    }

    return { success: true, data: students || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
