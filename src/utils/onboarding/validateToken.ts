"use server";

import { createClient } from "@/utils/supabase/server";
import { hashToken } from "./tokens";

export type TokenValidationResult =
  | {
      valid: true;
      profile: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        role: string | null;
        status: string | null;
      };
    }
  | {
      valid: false;
      error:
        | "token_not_found"
        | "token_expired"
        | "already_completed"
        | "unknown_error";
      message: string;
    };

/**
 * Validates an onboarding token and returns the associated profile if valid
 * @param token The plain text token from the URL
 * @returns TokenValidationResult indicating validity and profile data or error
 */
export async function validateOnboardingToken(
  token: string,
): Promise<TokenValidationResult> {
  try {
    const supabase = await createClient();
    const hashedToken = hashToken(token);

    // Query for profile with matching token
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role, status, onboarding_token_expires_at")
      .eq("onboarding_token", hashedToken)
      .single();

    if (error || !profile) {
      return {
        valid: false,
        error: "token_not_found",
        message: "Invalid or expired invitation link",
      };
    }

    // Check if token has expired
    if (
      profile.onboarding_token_expires_at &&
      new Date(profile.onboarding_token_expires_at) < new Date()
    ) {
      return {
        valid: false,
        error: "token_expired",
        message: "This invitation link has expired. Please contact your administrator for a new invitation.",
      };
    }

    // Check if onboarding is already completed
    if (profile.status === "active") {
      return {
        valid: false,
        error: "already_completed",
        message: "This invitation has already been used. Please log in to your account.",
      };
    }

    // Token is valid
    return {
      valid: true,
      profile: {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
      },
    };
  } catch (error) {
    console.error("Error validating onboarding token:", error);
    return {
      valid: false,
      error: "unknown_error",
      message: "An error occurred while validating your invitation. Please try again.",
    };
  }
}
