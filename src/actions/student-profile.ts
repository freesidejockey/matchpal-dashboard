"use server";

import { StudentProfile } from "@/types";
import { studentProfileSchema } from "@/types/student";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getStudentProfile(): Promise<StudentProfile> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/signin");
  }

  const { data: studentProfile, error: profileError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !studentProfile) {
    redirect("/error");
  }

  return studentProfile;
}

export async function updateStudentProfile(
  values: z.infer<typeof studentProfileSchema>,
): Promise<{ success: boolean; data?: StudentProfile; error?: string }> {
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
      email,
      first_name,
      last_name,
      phone,
      medical_school,
      graduation_year,
      current_year_in_school,
      interests,
    } = values;

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

    const studentProfileData = {
      id: user.id,
      medical_school,
      graduation_year,
      current_year_in_school,
      interests,
    };

    const { error } = await supabase.from("profiles").upsert(profileData);
    if (error) {
      return { success: false, error: error.message };
    }

    const { data, error: studentError } = await supabase
      .from("student_profiles")
      .upsert(studentProfileData)
      .select()
      .single();

    if (studentError) {
      return { success: false, error: studentError.message };
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