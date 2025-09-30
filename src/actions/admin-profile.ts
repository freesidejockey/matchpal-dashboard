"use server";

import { AdminProfile } from "@/types";
import { adminPreferencesSchema, adminProfileSchema } from "@/types/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getAdminProfile(): Promise<AdminProfile> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/signin");
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !adminProfile) {
    redirect("/error");
  }

  return adminProfile;
}

export async function updateAdminPreferences(
  values: z.infer<typeof adminPreferencesSchema>,
): Promise<{ success: boolean; data?: AdminProfile; error?: string }> {
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
      accepting_new_users,
      hourly_rate,
    } = values;

    const adminPreferencesData = {
      id: user.id,
      payment_preference,
      payment_system_username,
      accepting_new_users,
      hourly_rate,
    };

    const { data, error } = await supabase
      .from("admin_profiles")
      .upsert(adminPreferencesData)
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

export async function updateAdminProfile(
  values: z.infer<typeof adminProfileSchema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { email, first_name, last_name, phone } = values;

    // Update email if it has changed
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      });

      if (emailError) {
        return { success: false, error: emailError.message };
      }
    }

    const profileData = {
      id: user.id,
      first_name,
      last_name,
      phone,
    };

    const { error } = await supabase.from("profiles").upsert(profileData);
    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate the page cache
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}