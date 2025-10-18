"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingStep1Form } from "@/components/onboarding/OnboardingStep1Form";
import { OnboardingTutorForm } from "@/components/onboarding/OnboardingTutorForm";
import { OnboardingStudentForm } from "@/components/onboarding/OnboardingStudentForm";
import { OnboardingAdminForm } from "@/components/onboarding/OnboardingAdminForm";
import {
  completeOnboardingStep1,
  completeOnboardingStep2Tutor,
  completeOnboardingStep2Student,
  completeOnboardingStep2Admin,
} from "@/actions/onboarding";
import { validateOnboardingToken } from "@/utils/onboarding/validateToken";
import { toast } from "sonner";
import {
  onboardingStep1Schema,
  onboardingTutorSchema,
  onboardingStudentSchema,
  onboardingAdminSchema,
} from "@/types/onboarding";
import { z } from "zod";

type InviteData = {
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Tutor" | "Client" | "Admin";
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "Tutor" | "Client" | "Admin" | null
  >(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  // Validate token on mount if present
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      validateToken(token);
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    setIsValidatingToken(true);
    setTokenError(null);

    const result = await validateOnboardingToken(token);

    if (!result.valid) {
      setTokenError(result.message);
      setIsValidatingToken(false);
      return;
    }

    // Token is valid, set invite data
    setInviteData({
      profileId: result.profile.id,
      firstName: result.profile.first_name || "",
      lastName: result.profile.last_name || "",
      email: result.profile.email || "",
      role: result.profile.role as "Tutor" | "Client" | "Admin",
    });
    setSelectedRole(result.profile.role as "Tutor" | "Client" | "Admin");
    setIsValidatingToken(false);
  };

  const handleStep1Submit = async (
    values: z.infer<typeof onboardingStep1Schema>,
  ) => {
    setIsSubmitting(true);

    try {
      const result = await completeOnboardingStep1(values);

      if (!result.success) {
        toast.error(result.error || "Failed to save profile information");
        return;
      }

      setSelectedRole(values.role);
      setStep(2);
      toast.success("Profile information saved!");
    } catch (error) {
      console.error("Error in step 1:", error);
      toast.error("Failed to save profile information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2TutorSubmit = async (
    values: z.infer<typeof onboardingTutorSchema>,
  ) => {
    setIsSubmitting(true);

    try {
      const result = await completeOnboardingStep2Tutor(values);

      if (!result.success) {
        toast.error(result.error || "Failed to complete onboarding");
        return;
      }

      toast.success("Welcome! Your account is now set up.");
      router.push("/");
    } catch (error) {
      console.error("Error in step 2:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2StudentSubmit = async (
    values: z.infer<typeof onboardingStudentSchema>,
  ) => {
    setIsSubmitting(true);

    try {
      const result = await completeOnboardingStep2Student(values);

      if (!result.success) {
        toast.error(result.error || "Failed to complete onboarding");
        return;
      }

      toast.success("Welcome! Your account is now set up.");
      router.push("/");
    } catch (error) {
      console.error("Error in step 2:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2AdminSubmit = async (
    values: z.infer<typeof onboardingAdminSchema>,
  ) => {
    setIsSubmitting(true);

    try {
      const result = await completeOnboardingStep2Admin(values);

      if (!result.success) {
        toast.error(result.error || "Failed to complete onboarding");
        return;
      }

      toast.success("Welcome! Your account is now set up.");
      router.push("/");
    } catch (error) {
      console.error("Error in step 2:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedRole(null);
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto lg:w-1/2">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
            <p className="text-gray-600 dark:text-gray-400">Validating your invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if token validation failed
  if (tokenError) {
    return (
      <div className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto lg:w-1/2">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
            <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-400">
              Invalid Invitation
            </h2>
            <p className="mb-4 text-sm text-red-700 dark:text-red-300">
              {tokenError}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/signin")}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              {step === 1 ? "Welcome to MatchPal" : "Complete Your Profile"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1
                ? inviteData
                  ? `Welcome ${inviteData.firstName}! Let's set up your account.`
                  : "Let's get started by setting up your profile"
                : `Step ${step} of 2: Tell us more about yourself`}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8 flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full ${
                step >= 1 ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded-full ${
                step >= 2 ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          </div>

          <div>
            {step === 1 && (
              <OnboardingStep1Form
                onSubmit={handleStep1Submit}
                isSubmitting={isSubmitting}
                inviteData={inviteData}
              />
            )}

            {step === 2 && selectedRole === "Tutor" && (
              <OnboardingTutorForm
                onSubmit={handleStep2TutorSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}

            {step === 2 && selectedRole === "Client" && (
              <OnboardingStudentForm
                onSubmit={handleStep2StudentSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}

            {step === 2 && selectedRole === "Admin" && (
              <OnboardingAdminForm
                onSubmit={handleStep2AdminSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}