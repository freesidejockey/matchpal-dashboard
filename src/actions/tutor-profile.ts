"use server";

import { AdvisorProfile } from "@/types";
import { tutorPreferencesSchema, tutorProfileSchema } from "@/types/tutor";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getTutorProfile(): Promise<AdvisorProfile> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: advisorProfile, error: profileError } = await supabase
    .from("tutor_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !advisorProfile) {
    redirect("/error");
  }

  return advisorProfile;
}

export async function updateTutorPreferences(
  values: z.infer<typeof tutorPreferencesSchema>,
): Promise<{ success: boolean; data?: AdvisorProfile; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const {
      payment_preference,
      payment_system_username,
      accepting_new_students,
      hourly_rate,
    } = values;

    const tutorPreferencesData = {
      id: user.id,
      payment_preference,
      payment_system_username,
      accepting_new_students,
      hourly_rate,
    };

    const { data, error } = await supabase
      .from("tutor_profiles")
      .upsert(tutorPreferencesData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate the page cache
    revalidatePath("/");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateTutorProfile(
  values: z.infer<typeof tutorProfileSchema>,
): Promise<{ success: boolean; data?: AdvisorProfile; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { email, first_name, last_name, phone, bio } = values;

    // Update email if it has changed
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      });

      if (emailError) {
        return { success: false, error: emailError.message };
      }
    }

    const tutorProfileData = {
      id: user.id,
      first_name,
      last_name,
      phone,
    };

    const tutorPreferencesData = {
      id: user.id,
      bio,
    };

    const { error } = await supabase.from("profiles").upsert(tutorProfileData);
    if (error) {
      return { success: false, error: error.message };
    }

    const { data, error: error_bio } = await supabase
      .from("tutor_profiles")
      .upsert(tutorPreferencesData)
      .select()
      .single();

    if (error_bio) {
      return { success: false, error: error_bio.message };
    }

    // Revalidate the page cache
    revalidatePath("/");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
