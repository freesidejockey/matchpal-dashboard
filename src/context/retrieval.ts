"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/types";

export async function getUserProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*") // or specific fields you need
    .eq("id", user.id)
    .single();

  console.log(profile);
  if (profileError || !profile) {
    redirect("/error");
  }

  return profile;
}

export async function getUserEmail(): Promise<string | undefined> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  return user.email;
}
