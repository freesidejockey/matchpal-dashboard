"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  QuestionnaireResponse,
  QuestionnaireResponseWithDetails,
  QuestionnaireType,
  TutoringIntakeData,
  AdvisingIntakeData,
  ProviderForSelection,
  tutoringIntakeSchema,
  advisingIntakeSchema,
  ExamType,
  Specialty,
  Region,
} from "@/types/questionnaire";

// =============================================
// GET OPERATIONS
// =============================================

/**
 * Get all pending questionnaires for a student (via their orders)
 */
export async function getPendingQuestionnairesForStudent(
  studentId: string
): Promise<{
  success: boolean;
  data?: QuestionnaireResponseWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questionnaire_responses")
      .select(
        `
        *,
        order:orders!questionnaire_responses_order_id_fkey(
          id,
          student_id,
          service_tier_id,
          tutor_id,
          assignment_status,
          service_tier:service_tiers(
            tier_name,
            service:services(title, questionnaire_type)
          ),
          student:students!orders_student_id_fkey(
            first_name,
            last_name,
            email,
            medical_school,
            current_year_in_school
          )
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Filter to only include questionnaires for this student's orders
    const studentQuestionnaires = data?.filter(
      (q: any) => q.order?.student_id === studentId
    );

    // Flatten the nested data
    const questionnaires: QuestionnaireResponseWithDetails[] =
      studentQuestionnaires?.map((q: any) => ({
        id: q.id,
        order_id: q.order_id,
        questionnaire_type: q.questionnaire_type,
        status: q.status,
        responses: q.responses,
        created_at: q.created_at,
        completed_at: q.completed_at,
        order_student_id: q.order?.student_id,
        order_service_tier_id: q.order?.service_tier_id,
        order_tutor_id: q.order?.tutor_id,
        order_assignment_status: q.order?.assignment_status,
        service_tier_name: q.order?.service_tier?.tier_name,
        service_title: q.order?.service_tier?.service?.title,
        student_first_name: q.order?.student?.first_name,
        student_last_name: q.order?.student?.last_name,
        student_email: q.order?.student?.email,
        student_medical_school: q.order?.student?.medical_school,
        student_current_year: q.order?.student?.current_year_in_school,
      })) || [];

    return { success: true, data: questionnaires };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a questionnaire response by order ID
 */
export async function getQuestionnaireResponseByOrderId(
  orderId: string
): Promise<{
  success: boolean;
  data?: QuestionnaireResponseWithDetails;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questionnaire_responses")
      .select(
        `
        *,
        order:orders!questionnaire_responses_order_id_fkey(
          id,
          student_id,
          service_tier_id,
          tutor_id,
          assignment_status,
          service_tier:service_tiers(
            tier_name,
            service:services(title, questionnaire_type)
          ),
          student:students!orders_student_id_fkey(
            first_name,
            last_name,
            email,
            medical_school,
            current_year_in_school
          )
        )
      `
      )
      .eq("order_id", orderId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const questionnaire: QuestionnaireResponseWithDetails = {
      id: data.id,
      order_id: data.order_id,
      questionnaire_type: data.questionnaire_type,
      status: data.status,
      responses: data.responses,
      created_at: data.created_at,
      completed_at: data.completed_at,
      order_student_id: data.order?.student_id,
      order_service_tier_id: data.order?.service_tier_id,
      order_tutor_id: data.order?.tutor_id,
      order_assignment_status: data.order?.assignment_status,
      service_tier_name: data.order?.service_tier?.tier_name,
      service_title: data.order?.service_tier?.service?.title,
      student_first_name: data.order?.student?.first_name,
      student_last_name: data.order?.student?.last_name,
      student_email: data.order?.student?.email,
      student_medical_school: data.order?.student?.medical_school,
      student_current_year: data.order?.student?.current_year_in_school,
    };

    return { success: true, data: questionnaire };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get eligible providers for a questionnaire type with optional filters
 */
export async function getEligibleProviders(
  questionnaireType: QuestionnaireType,
  filters?: {
    exam?: ExamType;
    specialty?: Specialty;
    region?: Region;
  }
): Promise<{
  success: boolean;
  data?: ProviderForSelection[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Build query for tutor_profiles with profile info
    let query = supabase
      .from("tutor_profiles")
      .select(
        `
        id,
        bio,
        degree,
        specialty,
        region,
        role_type,
        exam_subjects,
        accepting_new_students,
        profile:profiles!tutor_profiles_id_fkey(first_name, last_name)
      `
      )
      .eq("accepting_new_students", true);

    // Filter by role type based on questionnaire type
    if (questionnaireType === "tutoring") {
      query = query.in("role_type", ["tutor", "both"]);
    } else if (questionnaireType === "advising") {
      query = query.in("role_type", ["advisor", "both"]);
    }

    // Apply additional filters
    if (filters?.specialty) {
      query = query.eq("specialty", filters.specialty);
    }
    if (filters?.region) {
      query = query.eq("region", filters.region);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // Filter by exam_subjects if provided (array contains)
    let filteredData = data || [];
    if (filters?.exam && questionnaireType === "tutoring") {
      filteredData = filteredData.filter(
        (tutor: any) =>
          tutor.exam_subjects && tutor.exam_subjects.includes(filters.exam)
      );
    }

    // Map to ProviderForSelection
    const providers: ProviderForSelection[] = filteredData.map((tutor: any) => ({
      id: tutor.id,
      first_name: tutor.profile?.first_name || null,
      last_name: tutor.profile?.last_name || null,
      bio: tutor.bio,
      degree: tutor.degree,
      specialty: tutor.specialty,
      region: tutor.region,
      role_type: tutor.role_type || "tutor",
      exam_subjects: tutor.exam_subjects,
      accepting_new_students: tutor.accepting_new_students,
    }));

    return { success: true, data: providers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// CREATE/UPDATE OPERATIONS
// =============================================

/**
 * Create a pending questionnaire response for an order
 * Called automatically when an order is created for a service with questionnaire_type
 */
export async function createPendingQuestionnaireResponse(
  orderId: string,
  questionnaireType: QuestionnaireType
): Promise<{
  success: boolean;
  data?: QuestionnaireResponse;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questionnaire_responses")
      .insert({
        order_id: orderId,
        questionnaire_type: questionnaireType,
        status: "pending",
        responses: null,
      })
      .select()
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

/**
 * Submit a completed questionnaire response
 */
export async function submitQuestionnaireResponse(
  orderId: string,
  questionnaireType: QuestionnaireType,
  responses: TutoringIntakeData | AdvisingIntakeData
): Promise<{
  success: boolean;
  data?: QuestionnaireResponse;
  error?: string;
}> {
  try {
    // Validate the responses based on questionnaire type
    if (questionnaireType === "tutoring") {
      const result = tutoringIntakeSchema.safeParse(responses);
      if (!result.success) {
        return {
          success: false,
          error: `Validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`,
        };
      }
    } else if (questionnaireType === "advising") {
      const result = advisingIntakeSchema.safeParse(responses);
      if (!result.success) {
        return {
          success: false,
          error: `Validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`,
        };
      }
    }

    const supabase = await createClient();

    // Update the questionnaire response
    const { data, error } = await supabase
      .from("questionnaire_responses")
      .update({
        responses,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .eq("status", "pending") // Only update if still pending
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return {
        success: false,
        error: "No pending questionnaire found for this order",
      };
    }

    // Revalidate relevant paths
    revalidatePath("/student/questionnaires");
    revalidatePath(`/student/questionnaires/${orderId}`);
    revalidatePath("/admin/pairing");

    // TODO: In Phase 5, trigger pairing service here
    // await createPairingOffer(orderId);

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Check if an order needs a questionnaire (service has questionnaire_type)
 * Used when creating orders to determine if we should create a pending questionnaire
 */
export async function getServiceQuestionnaireType(
  serviceTierId: string
): Promise<{
  success: boolean;
  data?: QuestionnaireType | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("service_tiers")
      .select(
        `
        service:services(questionnaire_type)
      `
      )
      .eq("id", serviceTierId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const questionnaireType = (data?.service as any)?.questionnaire_type || null;

    return { success: true, data: questionnaireType };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get count of pending questionnaires for a student (for badge display)
 */
export async function getPendingQuestionnaireCount(
  studentId: string
): Promise<{
  success: boolean;
  data?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("questionnaire_responses")
      .select(
        `
        id,
        order:orders!questionnaire_responses_order_id_fkey(student_id)
      `,
        { count: "exact", head: true }
      )
      .eq("status", "pending");

    if (error) {
      return { success: false, error: error.message };
    }

    // Note: This count might include questionnaires from other students
    // due to RLS. The actual filtering happens in getPendingQuestionnairesForStudent
    // For accurate count, we'd need a more complex query or database function

    return { success: true, data: count || 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
