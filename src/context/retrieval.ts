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
    redirect("/signin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
    redirect("/signin");
  }

  return user.email;
}
