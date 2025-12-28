import { z } from "zod";

// =============================================
// CONSTANTS - Enums for dropdowns
// =============================================

export const EXAM_TYPES = [
  "USMLE Step 1",
  "USMLE Step 2",
  "COMLEX 1",
  "COMLEX 2",
  "Pre-clinical Exam",
  "Shelf Exam",
] as const;

export const SPECIALTIES = [
  "Anesthesiology",
  "Dermatology",
  "Diagnostic radiology",
  "Emergency medicine",
  "Family medicine",
  "Internal medicine",
  "Neurology",
  "Nuclear medicine",
  "Obstetrics and gynecology",
  "Ophthalmology",
  "Orthopedic surgery",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Physical medicine and rehabilitation",
  "Plastic surgery",
  "Psychiatry",
  "Radiation oncology",
  "Surgery (general)",
  "Urology",
] as const;

export const REGIONS = [
  "New England",
  "Middle Atlantic",
  "East North Central",
  "West North Central",
  "South Atlantic",
  "East South Central",
  "West South Central",
  "Mountain",
  "Pacific",
] as const;

export const ATTEMPT_TYPES = ["First attempt", "Retake"] as const;

export const DEGREE_TYPES = ["MD", "DO"] as const;

export const ROLE_TYPES = ["tutor", "advisor", "both"] as const;

// Exams that require attempt_type field
export const EXAMS_WITH_ATTEMPT_TYPE = [
  "USMLE Step 1",
  "USMLE Step 2",
  "COMLEX 1",
  "COMLEX 2",
] as const;

// =============================================
// DERIVED TYPES
// =============================================

export type ExamType = (typeof EXAM_TYPES)[number];
export type Specialty = (typeof SPECIALTIES)[number];
export type Region = (typeof REGIONS)[number];
export type AttemptType = (typeof ATTEMPT_TYPES)[number];
export type DegreeType = (typeof DEGREE_TYPES)[number];
export type RoleType = (typeof ROLE_TYPES)[number];
export type QuestionnaireType = "tutoring" | "advising";
export type QuestionnaireStatus = "pending" | "completed";

// =============================================
// ZOD SCHEMAS - Intake Forms
// =============================================

/**
 * Tutoring Intake Form Schema
 * For students who purchased tutoring packages
 */
export const tutoringIntakeSchema = z
  .object({
    // Required: Which exam are they preparing for?
    exam: z.enum(EXAM_TYPES, {
      required_error: "Please select an exam",
    }),

    // Conditional: Only required for USMLE/COMLEX exams
    attempt_type: z.enum(ATTEMPT_TYPES).optional(),

    // Provider selection: null means "No Preference"
    provider_preference: z.string().uuid().nullable(),

    // Optional: Primary goal for first session
    primary_goal: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // If exam requires attempt_type, it must be provided
      const examsRequiringAttempt: readonly string[] = EXAMS_WITH_ATTEMPT_TYPE;
      const requiresAttempt = examsRequiringAttempt.includes(data.exam);
      if (requiresAttempt && !data.attempt_type) {
        return false;
      }
      return true;
    },
    {
      message: "Please indicate if this is your first attempt or a retake",
      path: ["attempt_type"],
    }
  );

/**
 * Advising Intake Form Schema
 * For students who purchased advising packages
 */
export const advisingIntakeSchema = z.object({
  // Required: Target specialty
  specialty: z.enum(SPECIALTIES, {
    required_error: "Please select a specialty",
  }),

  // Required: Preferred region
  preferred_region: z.enum(REGIONS, {
    required_error: "Please select a preferred region",
  }),

  // Provider selection: null means "No Preference"
  provider_preference: z.string().uuid().nullable(),

  // Optional: Primary goal for first session
  primary_goal: z.string().max(500).optional(),
});

// =============================================
// INFERRED TYPES FROM SCHEMAS
// =============================================

export type TutoringIntakeData = z.infer<typeof tutoringIntakeSchema>;
export type AdvisingIntakeData = z.infer<typeof advisingIntakeSchema>;
export type IntakeData = TutoringIntakeData | AdvisingIntakeData;

// =============================================
// DATABASE TYPES
// =============================================

/**
 * Questionnaire Response - Database row type
 */
export interface QuestionnaireResponse {
  id: string;
  order_id: string;
  questionnaire_type: QuestionnaireType;
  status: QuestionnaireStatus;
  responses: TutoringIntakeData | AdvisingIntakeData | null;
  created_at: string;
  completed_at: string | null;
}

/**
 * Questionnaire Response with joined order/student data
 */
export interface QuestionnaireResponseWithDetails extends QuestionnaireResponse {
  // From orders table
  order_student_id?: string;
  order_service_tier_id?: string;
  order_tutor_id?: string | null;
  order_assignment_status?: string;
  // From service_tiers/services
  service_tier_name?: string;
  service_title?: string;
  // From students table
  student_first_name?: string | null;
  student_last_name?: string | null;
  student_email?: string | null;
  student_medical_school?: string | null;
  student_current_year?: number | null;
}

// =============================================
// INSERT/UPDATE TYPES
// =============================================

export type QuestionnaireResponseInsert = Omit<
  QuestionnaireResponse,
  "id" | "created_at" | "completed_at"
> & {
  id?: string;
};

export type QuestionnaireResponseUpdate = Partial<
  Omit<QuestionnaireResponse, "id" | "order_id" | "questionnaire_type" | "created_at">
>;

// =============================================
// TUTOR MATCHING FIELDS (extends AdvisorProfile)
// =============================================

/**
 * Additional fields on tutor_profiles for matching
 */
export interface TutorMatchingFields {
  degree: DegreeType | null;
  school_name: string | null;
  residency_name: string | null;
  specialty: Specialty | null;
  region: Region | null;
  role_type: RoleType;
  exam_subjects: ExamType[] | null;
}

/**
 * Provider info for the ProviderSelector component
 */
export interface ProviderForSelection {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  degree: DegreeType | null;
  specialty: Specialty | null;
  region: Region | null;
  role_type: RoleType;
  exam_subjects: ExamType[] | null;
  accepting_new_students: boolean | null;
  // Optional: profile photo URL if you add it later
  photo_url?: string | null;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Check if an exam requires the attempt_type field
 */
export function examRequiresAttemptType(exam: ExamType): boolean {
  return (EXAMS_WITH_ATTEMPT_TYPE as readonly string[]).includes(exam);
}

/**
 * Get display name for a questionnaire type
 */
export function getQuestionnaireTypeLabel(type: QuestionnaireType): string {
  return type === "tutoring" ? "Tutoring Intake" : "Advising Intake";
}

/**
 * Type guard to check if responses are tutoring type
 */
export function isTutoringIntake(
  data: IntakeData | null
): data is TutoringIntakeData {
  return data !== null && "exam" in data;
}

/**
 * Type guard to check if responses are advising type
 */
export function isAdvisingIntake(
  data: IntakeData | null
): data is AdvisingIntakeData {
  return data !== null && "specialty" in data && "preferred_region" in data;
}
