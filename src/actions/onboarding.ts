"use server";

import {
  onboardingStep1Schema,
  onboardingTutorSchema,
  onboardingStudentSchema,
  onboardingAdminSchema,
} from "@/types/onboarding";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function completeOnboardingStep1(
  values: z.infer<typeof onboardingStep1Schema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { first_name, last_name, phone, role, email, password, profile_id } = values;

    // Check if this is an invited user (has profile_id, email, and password)
    const isInvitedUser = !!(profile_id && email && password);

    if (isInvitedUser) {
      // Invited user: Create auth account and update profile to link to new auth user
      console.log("[ONBOARDING] Starting invited user flow for profile_id:", profile_id);

      // Create auth user (Supabase will generate a new UUID)
      console.log("[ONBOARDING] Creating auth user with email:", email);
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
          },
        },
      });

      if (signUpError) {
        console.error("[ONBOARDING] Auth signup error:", signUpError);
        return { success: false, error: signUpError.message };
      }

      if (!authData.user) {
        console.error("[ONBOARDING] No user returned from signup");
        return { success: false, error: "Failed to create user account" };
      }

      console.log("[ONBOARDING] Auth user created with ID:", authData.user.id);

      // Get the old tutor profile data to preserve hourly_rate
      console.log("[ONBOARDING] Fetching old tutor profile data for profile_id:", profile_id);
      const { data: oldTutorProfile, error: fetchTutorError } = await supabase
        .from("tutor_profiles")
        .select("hourly_rate, payment_preference, accepting_new_students")
        .eq("id", profile_id)
        .single();

      if (fetchTutorError) {
        console.error("[ONBOARDING] Error fetching old tutor profile:", fetchTutorError);
      } else {
        console.log("[ONBOARDING] Old tutor profile data:", oldTutorProfile);
      }

      // Delete the old tutor profile first (has FK to profiles)
      console.log("[ONBOARDING] Deleting old tutor profile with ID:", profile_id);
      const { error: deleteTutorError } = await supabase
        .from("tutor_profiles")
        .delete()
        .eq("id", profile_id);

      if (deleteTutorError) {
        console.error("[ONBOARDING] Error deleting old tutor profile:", deleteTutorError);
        return { success: false, error: `Failed to delete old tutor profile: ${deleteTutorError.message}` };
      }
      console.log("[ONBOARDING] Old tutor profile deleted successfully");

      // Delete the old draft profile
      console.log("[ONBOARDING] Deleting old draft profile with ID:", profile_id);
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile_id);

      if (deleteError) {
        console.error("[ONBOARDING] Error deleting old profile:", deleteError);
        return { success: false, error: `Failed to delete old profile: ${deleteError.message}` };
      }
      console.log("[ONBOARDING] Old draft profile deleted successfully");

      // Check if a profile was auto-created by Supabase for the new auth user
      console.log("[ONBOARDING] Checking if profile auto-created for auth user ID:", authData.user.id);
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("[ONBOARDING] Error checking for existing profile:", checkError);
      }

      if (existingProfile) {
        // Profile already exists (auto-created), update it
        console.log("[ONBOARDING] Profile auto-created, updating it");
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name,
            last_name,
            email,
            phone,
            role,
            status: "invited", // Keep as invited until Step 2 is completed
            questionnaire_completed: false,
          })
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("[ONBOARDING] Error updating profile:", updateError);
          return { success: false, error: `Failed to update profile: ${updateError.message}` };
        }
        console.log("[ONBOARDING] Profile updated successfully");
      } else {
        // Create new profile with the auth user's ID
        console.log("[ONBOARDING] No auto-created profile found, inserting new one");
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            first_name,
            last_name,
            email,
            phone,
            role,
            status: "invited", // Keep as invited until Step 2 is completed
            questionnaire_completed: false,
          });

        if (createError) {
          console.error("[ONBOARDING] Error creating profile:", createError);
          return { success: false, error: `Failed to create profile: ${createError.message}` };
        }
        console.log("[ONBOARDING] Profile created successfully");
      }

      // Create new tutor_profile with preserved data
      console.log("[ONBOARDING] Creating new tutor profile for auth user ID:", authData.user.id);
      const { error: createTutorError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: authData.user.id,
          hourly_rate: oldTutorProfile?.hourly_rate || null,
          payment_preference: oldTutorProfile?.payment_preference || "paypal",
          accepting_new_students: oldTutorProfile?.accepting_new_students ?? true,
        });

      if (createTutorError) {
        console.error("[ONBOARDING] Error creating tutor profile:", createTutorError);
        return { success: false, error: `Failed to create tutor profile: ${createTutorError.message}` };
      }
      console.log("[ONBOARDING] Tutor profile created successfully");

      // Sign in the user
      console.log("[ONBOARDING] Signing in user with email:", email);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("[ONBOARDING] Sign in error:", signInError);
        return { success: false, error: signInError.message };
      }
      console.log("[ONBOARDING] User signed in successfully");

    } else {
      // Regular user: Already authenticated, just update profile
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: "Not authenticated" };
      }

      const profileData = {
        id: user.id,
        first_name,
        last_name,
        phone,
        role,
        status: "active",
        questionnaire_completed: false,
      };

      const { error } = await supabase.from("profiles").upsert(profileData);

      if (error) {
        return { success: false, error: error.message };
      }
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
    console.log("[ONBOARDING STEP 2] Starting tutor profile completion");
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[ONBOARDING STEP 2] Auth error:", authError);
      return { success: false, error: "Not authenticated" };
    }

    console.log("[ONBOARDING STEP 2] User ID:", user.id);

    const {
      bio,
      payment_preference,
      payment_system_username,
      hourly_rate,
      accepting_new_students,
    } = values;

    console.log("[ONBOARDING STEP 2] Tutor data:", { bio, payment_preference, payment_system_username, hourly_rate, accepting_new_students });

    const tutorProfileData = {
      id: user.id,
      bio,
      payment_preference,
      payment_system_username,
      hourly_rate,
      accepting_new_students,
    };

    console.log("[ONBOARDING STEP 2] Upserting tutor profile");
    const { error } = await supabase
      .from("tutor_profiles")
      .upsert(tutorProfileData);

    if (error) {
      console.error("[ONBOARDING STEP 2] Error upserting tutor profile:", error);
      return { success: false, error: error.message };
    }

    console.log("[ONBOARDING STEP 2] Tutor profile upserted successfully");

    // Mark onboarding as completed
    console.log("[ONBOARDING STEP 2] Updating profile status to active");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", user.id);

    if (updateError) {
      console.error("[ONBOARDING STEP 2] Error updating profile status:", updateError);
      return { success: false, error: updateError.message };
    }

    console.log("[ONBOARDING STEP 2] Profile status updated successfully");

    revalidatePath("/");

    console.log("[ONBOARDING STEP 2] Completed successfully");
    return { success: true };
  } catch (error) {
    console.error("[ONBOARDING STEP 2] Unexpected error:", error);
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
      .update({ status: "active" })
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
      .update({ status: "active" })
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