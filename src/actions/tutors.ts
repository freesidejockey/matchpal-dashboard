"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Tutor = {
  id: string;
  payment_preference: string;
  payment_system_username: string | null;
  bio: string | null;
  hourly_rate: number | null;
  accepting_new_students: boolean;
  created_at: string;
  updated_at: string;
  // Profile fields from the join
  first_name: string | null;
  last_name: string | null;
};

export type TutorInsert = {
  id: string;
  payment_preference?: string;
  payment_system_username?: string | null;
  bio?: string | null;
  hourly_rate?: number | null;
  accepting_new_students?: boolean;
};

export type TutorUpdate = Partial<
  Omit<Tutor, "id" | "created_at" | "updated_at">
>;

export async function getTutors(): Promise<{
  success: boolean;
  data?: Tutor[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Flatten the nested profile data
    const tutors = data?.map((tutor: any) => ({
      id: tutor.id,
      payment_preference: tutor.payment_preference,
      payment_system_username: tutor.payment_system_username,
      bio: tutor.bio,
      hourly_rate: tutor.hourly_rate,
      accepting_new_students: tutor.accepting_new_students,
      created_at: tutor.created_at,
      updated_at: tutor.updated_at,
      first_name: tutor.profiles?.first_name || null,
      last_name: tutor.profiles?.last_name || null,
    })) || [];

    return { success: true, data: tutors };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTutorById(
  id: string,
): Promise<{ success: boolean; data?: Tutor; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const tutor = {
      id: data.id,
      payment_preference: data.payment_preference,
      payment_system_username: data.payment_system_username,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      accepting_new_students: data.accepting_new_students,
      created_at: data.created_at,
      updated_at: data.updated_at,
      first_name: data.profiles?.first_name || null,
      last_name: data.profiles?.last_name || null,
    };

    return { success: true, data: tutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createTutor(
  values: TutorInsert,
): Promise<{ success: boolean; data?: Tutor; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .insert(values)
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const tutor = {
      id: data.id,
      payment_preference: data.payment_preference,
      payment_system_username: data.payment_system_username,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      accepting_new_students: data.accepting_new_students,
      created_at: data.created_at,
      updated_at: data.updated_at,
      first_name: data.profiles?.first_name || null,
      last_name: data.profiles?.last_name || null,
    };

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true, data: tutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateTutor(
  id: string,
  values: TutorUpdate,
): Promise<{ success: boolean; data?: Tutor; error?: string }> {
  try {
    const supabase = await createClient();

    // Separate profile fields from tutor_profile fields
    const { first_name, last_name, ...tutorFields } = values;

    // Update profile fields if they exist
    if (first_name !== undefined || last_name !== undefined) {
      const profileUpdates: any = {};
      if (first_name !== undefined) profileUpdates.first_name = first_name;
      if (last_name !== undefined) profileUpdates.last_name = last_name;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    // Update tutor_profiles table
    const { data, error } = await supabase
      .from("tutor_profiles")
      .update(tutorFields)
      .eq("id", id)
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const tutor = {
      id: data.id,
      payment_preference: data.payment_preference,
      payment_system_username: data.payment_system_username,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      accepting_new_students: data.accepting_new_students,
      created_at: data.created_at,
      updated_at: data.updated_at,
      first_name: data.profiles?.first_name || null,
      last_name: data.profiles?.last_name || null,
    };

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true, data: tutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteTutor(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
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
        error: "No tutor found with that ID or deletion not permitted",
      };
    }

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
