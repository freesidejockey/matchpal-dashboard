"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateToken, hashToken, generateMagicLink, getTokenExpiry } from "@/utils/onboarding/tokens";

export type Tutor = {
  id: string;
  payment_preference: string;
  payment_system_username: string | null;
  bio: string | null;
  hourly_rate: number | null;
  accepting_new_students: boolean;
  created_at: string;
  updated_at: string;
  // Profile fields from the join
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  status: string | null;
  onboarding_email_sent_at: string | null;
};

export type TutorInsert = {
  id: string;
  payment_preference?: string;
  payment_system_username?: string | null;
  bio?: string | null;
  hourly_rate?: number | null;
  accepting_new_students?: boolean;
};

export type TutorUpdate = Partial<
  Omit<Tutor, "id" | "created_at" | "updated_at">
>;

export async function getTutors(): Promise<{
  success: boolean;
  data?: Tutor[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name,
          email,
          status,
          onboarding_email_sent_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Flatten the nested profile data
    const tutors = data?.map((tutor: any) => ({
      id: tutor.id,
      payment_preference: tutor.payment_preference,
      payment_system_username: tutor.payment_system_username,
      bio: tutor.bio,
      hourly_rate: tutor.hourly_rate,
      accepting_new_students: tutor.accepting_new_students,
      created_at: tutor.created_at,
      updated_at: tutor.updated_at,
      first_name: tutor.profiles?.first_name || null,
      last_name: tutor.profiles?.last_name || null,
      email: tutor.profiles?.email || null,
      status: tutor.profiles?.status || null,
      onboarding_email_sent_at: tutor.profiles?.onboarding_email_sent_at || null,
    })) || [];

    return { success: true, data: tutors };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTutorById(
  id: string,
): Promise<{ success: boolean; data?: Tutor; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name,
          email,
          status,
          onboarding_email_sent_at
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const tutor = {
      id: data.id,
      payment_preference: data.payment_preference,
      payment_system_username: data.payment_system_username,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      accepting_new_students: data.accepting_new_students,
      created_at: data.created_at,
      updated_at: data.updated_at,
      first_name: data.profiles?.first_name || null,
      last_name: data.profiles?.last_name || null,
      email: data.profiles?.email || null,
      status: data.profiles?.status || null,
      onboarding_email_sent_at: data.profiles?.onboarding_email_sent_at || null,
    };

    return { success: true, data: tutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createTutor(
  values: TutorInsert,
): Promise<{ success: boolean; data?: Tutor; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .insert(values)
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name,
          email,
          status,
          onboarding_email_sent_at
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const tutor = {
      id: data.id,
      payment_preference: data.payment_preference,
      payment_system_username: data.payment_system_username,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      accepting_new_students: data.accepting_new_students,
      created_at: data.created_at,
      updated_at: data.updated_at,
      first_name: data.profiles?.first_name || null,
      last_name: data.profiles?.last_name || null,
      email: data.profiles?.email || null,
      status: data.profiles?.status || null,
      onboarding_email_sent_at: data.profiles?.onboarding_email_sent_at || null,
    };

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true, data: tutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateTutor(
  id: string,
  values: TutorUpdate,
): Promise<{ success: boolean; data?: Tutor; error?: string }> {
  try {
    const supabase = await createClient();

    // Separate profile fields from tutor_profile fields
    const { first_name, last_name, ...tutorFields } = values;

    // Update profile fields if they exist
    if (first_name !== undefined || last_name !== undefined) {
      const profileUpdates: any = {};
      if (first_name !== undefined) profileUpdates.first_name = first_name;
      if (last_name !== undefined) profileUpdates.last_name = last_name;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    // Update tutor_profiles table
    const { data, error } = await supabase
      .from("tutor_profiles")
      .update(tutorFields)
      .eq("id", id)
      .select(`
        *,
        profiles!tutor_profiles_id_fkey (
          first_name,
          last_name,
          email,
          status,
          onboarding_email_sent_at
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const tutor = {
      id: data.id,
      payment_preference: data.payment_preference,
      payment_system_username: data.payment_system_username,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      accepting_new_students: data.accepting_new_students,
      created_at: data.created_at,
      updated_at: data.updated_at,
      first_name: data.profiles?.first_name || null,
      last_name: data.profiles?.last_name || null,
      email: data.profiles?.email || null,
      status: data.profiles?.status || null,
      onboarding_email_sent_at: data.profiles?.onboarding_email_sent_at || null,
    };

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true, data: tutor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteTutor(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tutor_profiles")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    // Check if any rows were actually deleted
    if (!data || data.length === 0) {
      return {
        success: false,
        error: "No tutor found with that ID or deletion not permitted",
      };
    }

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function inviteTutor(values: {
  first_name: string;
  last_name: string;
  email: string;
  hourly_rate?: number | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Generate unique token for magic link
    const plainToken = generateToken();
    const hashedToken = hashToken(plainToken);
    const magicLink = generateMagicLink(plainToken);
    const tokenExpiry = getTokenExpiry();

    // Create profile record with draft status
    const profileId = crypto.randomUUID();
    const { error: profileError } = await supabase.from("profiles").insert({
      id: profileId,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      role: "Tutor",
      status: "draft", // Will be updated to 'invited' after email sends
      onboarding_token: hashedToken,
      onboarding_token_expires_at: tokenExpiry,
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Create tutor_profile record
    const { error: tutorError } = await supabase.from("tutor_profiles").insert({
      id: profileId,
      hourly_rate: values.hourly_rate || null,
      payment_preference: "paypal",
      accepting_new_students: true,
    });

    if (tutorError) {
      // Rollback profile creation
      await supabase.from("profiles").delete().eq("id", profileId);
      return { success: false, error: tutorError.message };
    }

    // Send invitation email directly using Postmark
    try {
      const { ServerClient } = await import("postmark");
      const { render } = await import("@react-email/components");
      const TutorOnboardingEmail = (await import("@/emails/tutor-onboarding")).default;

      const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN!);
      const emailHtml = await render(
        TutorOnboardingEmail({ firstName: values.first_name, magicLink })
      );

      await postmark.sendEmail({
        From: "admin@freesidejockey.com",
        To: values.email,
        Subject: "You're Invited to Join MatchPal as an Advisor",
        HtmlBody: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      return {
        success: false,
        error: `Tutor profile created but email failed to send: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
      };
    }

    // Update profile status to 'invited' and set email sent timestamp
    await supabase
      .from("profiles")
      .update({
        status: "invited",
        onboarding_email_sent_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    // Revalidate the page cache
    revalidatePath("/admin/tutors");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
