"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Service,
  ServiceInsert,
  ServiceUpdate,
  ServiceTier,
  ServiceTierInsert,
  ServiceTierUpdate,
  ServiceTierWithService,
} from "@/types";

// =============================================
// SERVICES
// =============================================

export async function getServices(): Promise<{
  success: boolean;
  data?: Service[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getServiceById(
  id: string,
): Promise<{ success: boolean; data?: Service; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
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

export async function createService(
  values: ServiceInsert,
): Promise<{ success: boolean; data?: Service; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .insert(values)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/services");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateService(
  id: string,
  values: ServiceUpdate,
): Promise<{ success: boolean; data?: Service; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/services");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteService(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/services");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// SERVICE TIERS
// =============================================

export async function getServiceTiers(
  serviceId?: string,
): Promise<{
  success: boolean;
  data?: ServiceTierWithService[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("service_tiers")
      .select(
        `
        *,
        service:services(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getServiceTierById(
  id: string,
): Promise<{ success: boolean; data?: ServiceTierWithService; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("service_tiers")
      .select(
        `
        *,
        service:services(*)
      `,
      )
      .eq("id", id)
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

export async function createServiceTier(
  values: ServiceTierInsert,
): Promise<{ success: boolean; data?: ServiceTier; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("service_tiers")
      .insert(values)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/services");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateServiceTier(
  id: string,
  values: ServiceTierUpdate,
): Promise<{ success: boolean; data?: ServiceTier; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("service_tiers")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/services");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteServiceTier(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("service_tiers")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/services");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
