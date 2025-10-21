"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Config, ConfigUpdate } from "@/types";

export async function getConfig(key: string): Promise<{
  success: boolean;
  data?: Config;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("config")
      .select("*")
      .eq("key", key)
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

export async function getRevisionPayoutRate(): Promise<{
  success: boolean;
  data?: number;
  error?: string;
}> {
  try {
    const result = await getConfig("revision_payout_rate");
    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Config not found" };
    }

    // Parse the JSON value to a number
    const rate = typeof result.data.value === 'number'
      ? result.data.value
      : parseFloat(result.data.value);

    return { success: true, data: rate };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateConfig(
  key: string,
  update: ConfigUpdate,
): Promise<{ success: boolean; data?: Config; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!adminProfile) {
      return { success: false, error: "Only admins can update configuration" };
    }

    // Update the config
    const { data, error } = await supabase
      .from("config")
      .update({ value: update.value })
      .eq("key", key)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/finances");
    revalidatePath("/admin/settings");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateRevisionPayoutRate(
  rate: number,
): Promise<{ success: boolean; data?: Config; error?: string }> {
  if (rate < 0) {
    return { success: false, error: "Payout rate must be non-negative" };
  }

  return updateConfig("revision_payout_rate", { value: rate });
}
