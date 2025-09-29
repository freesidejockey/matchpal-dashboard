"use server";

import { AdvisorProfile } from "@/types";
import { tutorPreferencesSchema, tutorProfileSchema } from "@/types/tutor";
import { createClient } from "@/utils/supabase/server";
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
    .select("*") // or specific fields you need
    .eq("id", user.id)
    .single();

  console.log(advisorProfile);
  if (profileError || !advisorProfile) {
    redirect("/error");
  }

  return advisorProfile;
}

export async function updateTutorPreferences(
  values: z.infer<typeof tutorPreferencesSchema>,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const {
    payment_preference,
    payment_system_username,
    accepting_new_students,
    hourly_rate,
  } = values;

  const tutorPreferencesData = {
    id: user?.id as string,
    payment_preference,
    payment_system_username,
    accepting_new_students,
    hourly_rate,
  };

  const { error } = await supabase
    .from("tutor_profiles")
    .upsert(tutorPreferencesData);
  if (error) {
    redirect("/error-404");
  }
}

export async function updateTutorProfile(
  values: z.infer<typeof tutorProfileSchema>,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { email, first_name, last_name, phone, bio } = values;

  // Update email if it has changed
  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: email,
    });

    if (emailError) {
      // Handle error appropriately - you might want to return it instead of redirecting
      console.error("Email update error:", emailError);
      redirect("/error-404");
    }
  }

  const tutorProfileData = {
    id: user?.id as string,
    first_name,
    last_name,
    phone,
  };

  const tutorPreferencesData = {
    id: user?.id as string,
    bio,
  };

  const { error } = await supabase.from("profiles").upsert(tutorProfileData);
  if (error) {
    redirect("/error-404");
  }

  const { error: error_bio } = await supabase
    .from("tutor_profiles")
    .upsert(tutorPreferencesData);
  if (error_bio) {
    redirect("/error-404");
  }
}
