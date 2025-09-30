"use server";

import {
  onboardingStep1Schema,
  onboardingTutorSchema,
  onboardingStudentSchema,
  onboardingAdminSchema,
} from "@/types/onboarding";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function completeOnboardingStep1(
  values: z.infer<typeof onboardingStep1Schema>,
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

    const { first_name, last_name, phone, role } = values;

    const profileData = {
      id: user.id,
      first_name,
      last_name,
      phone,
      role,
      onboarding_completed: false,
      questionnaire_completed: false,
    };

    const { error } = await supabase.from("profiles").upsert(profileData);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function completeOnboardingStep2Tutor(
  values: z.infer<typeof onboardingTutorSchema>,
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

    const {
      bio,
      payment_preference,
      payment_system_username,
      hourly_rate,
      accepting_new_students,
    } = values;

    const tutorProfileData = {
      id: user.id,
      bio,
      payment_preference,
      payment_system_username,
      hourly_rate,
      accepting_new_students,
    };

    const { error } = await supabase
      .from("tutor_profiles")
      .upsert(tutorProfileData);

    if (error) {
      return { success: false, error: error.message };
    }

    // Mark onboarding as completed
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function completeOnboardingStep2Student(
  values: z.infer<typeof onboardingStudentSchema>,
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

    const {
      medical_school,
      graduation_year,
      current_year_in_school,
      interests,
    } = values;

    const studentProfileData = {
      id: user.id,
      medical_school,
      graduation_year,
      current_year_in_school,
      interests,
    };

    const { error } = await supabase
      .from("student_profiles")
      .upsert(studentProfileData);

    if (error) {
      return { success: false, error: error.message };
    }

    // Mark onboarding as completed
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function completeOnboardingStep2Admin(
  values: z.infer<typeof onboardingAdminSchema>,
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

    const {
      payment_preference,
      payment_system_username,
      hourly_rate,
      accepting_new_users,
    } = values;

    const adminProfileData = {
      id: user.id,
      payment_preference,
      payment_system_username,
      hourly_rate,
      accepting_new_users,
    };

    const { error } = await supabase
      .from("admin_profiles")
      .upsert(adminProfileData);

    if (error) {
      return { success: false, error: error.message };
    }

    // Mark onboarding as completed
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}