import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  tutoringIntakeSchema,
  advisingIntakeSchema,
  EXAM_TYPES,
  SPECIALTIES,
  REGIONS,
  examRequiresAttemptType,
  isTutoringIntake,
  isAdvisingIntake,
  TutoringIntakeData,
  AdvisingIntakeData,
} from "@/types/questionnaire";

// Mock the Supabase client
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks
import { createClient } from "@/utils/supabase/server";
import {
  getPendingQuestionnairesForStudent,
  getQuestionnaireResponseByOrderId,
  getEligibleProviders,
  createPendingQuestionnaireResponse,
  submitQuestionnaireResponse,
  getServiceQuestionnaireType,
  getPendingQuestionnaireCount,
} from "./questionnaire-responses";

// =============================================
// SCHEMA VALIDATION TESTS
// =============================================

describe("Tutoring Intake Schema", () => {
  it("should validate a valid tutoring intake with USMLE exam", () => {
    const validData: TutoringIntakeData = {
      exam: "USMLE Step 1",
      attempt_type: "First attempt",
      provider_preference: null,
    };

    const result = tutoringIntakeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate a valid tutoring intake with Shelf Exam (no attempt_type needed)", () => {
    const validData = {
      exam: "Shelf Exam",
      provider_preference: null,
    };

    const result = tutoringIntakeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject USMLE exam without attempt_type", () => {
    const invalidData = {
      exam: "USMLE Step 1",
      provider_preference: null,
    };

    const result = tutoringIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject COMLEX exam without attempt_type", () => {
    const invalidData = {
      exam: "COMLEX 1",
      provider_preference: null,
    };

    const result = tutoringIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept valid provider_preference UUID", () => {
    const validData: TutoringIntakeData = {
      exam: "Shelf Exam",
      provider_preference: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = tutoringIntakeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid provider_preference (not UUID)", () => {
    const invalidData = {
      exam: "Shelf Exam",
      provider_preference: "not-a-uuid",
    };

    const result = tutoringIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept optional primary_goal", () => {
    const validData: TutoringIntakeData = {
      exam: "Pre-clinical Exam",
      provider_preference: null,
      primary_goal: "Improve my understanding of biochemistry",
    };

    const result = tutoringIntakeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject primary_goal over 500 characters", () => {
    const invalidData = {
      exam: "Pre-clinical Exam",
      provider_preference: null,
      primary_goal: "a".repeat(501),
    };

    const result = tutoringIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Advising Intake Schema", () => {
  it("should validate a valid advising intake", () => {
    const validData: AdvisingIntakeData = {
      specialty: "Internal medicine",
      preferred_region: "New England",
      provider_preference: null,
    };

    const result = advisingIntakeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject missing specialty", () => {
    const invalidData = {
      preferred_region: "New England",
      provider_preference: null,
    };

    const result = advisingIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject missing preferred_region", () => {
    const invalidData = {
      specialty: "Internal medicine",
      provider_preference: null,
    };

    const result = advisingIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid specialty", () => {
    const invalidData = {
      specialty: "Not a real specialty",
      preferred_region: "New England",
      provider_preference: null,
    };

    const result = advisingIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid region", () => {
    const invalidData = {
      specialty: "Internal medicine",
      preferred_region: "Not a real region",
      provider_preference: null,
    };

    const result = advisingIntakeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept all valid specialties", () => {
    for (const specialty of SPECIALTIES) {
      const validData: AdvisingIntakeData = {
        specialty,
        preferred_region: "Pacific",
        provider_preference: null,
      };

      const result = advisingIntakeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    }
  });

  it("should accept all valid regions", () => {
    for (const region of REGIONS) {
      const validData: AdvisingIntakeData = {
        specialty: "Dermatology",
        preferred_region: region,
        provider_preference: null,
      };

      const result = advisingIntakeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    }
  });
});

// =============================================
// HELPER FUNCTION TESTS
// =============================================

describe("examRequiresAttemptType", () => {
  it("should return true for USMLE Step 1", () => {
    expect(examRequiresAttemptType("USMLE Step 1")).toBe(true);
  });

  it("should return true for USMLE Step 2", () => {
    expect(examRequiresAttemptType("USMLE Step 2")).toBe(true);
  });

  it("should return true for COMLEX 1", () => {
    expect(examRequiresAttemptType("COMLEX 1")).toBe(true);
  });

  it("should return true for COMLEX 2", () => {
    expect(examRequiresAttemptType("COMLEX 2")).toBe(true);
  });

  it("should return false for Pre-clinical Exam", () => {
    expect(examRequiresAttemptType("Pre-clinical Exam")).toBe(false);
  });

  it("should return false for Shelf Exam", () => {
    expect(examRequiresAttemptType("Shelf Exam")).toBe(false);
  });
});

describe("isTutoringIntake", () => {
  it("should return true for tutoring intake data", () => {
    const data: TutoringIntakeData = {
      exam: "USMLE Step 1",
      attempt_type: "First attempt",
      provider_preference: null,
    };
    expect(isTutoringIntake(data)).toBe(true);
  });

  it("should return false for advising intake data", () => {
    const data: AdvisingIntakeData = {
      specialty: "Internal medicine",
      preferred_region: "New England",
      provider_preference: null,
    };
    expect(isTutoringIntake(data)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isTutoringIntake(null)).toBe(false);
  });
});

describe("isAdvisingIntake", () => {
  it("should return true for advising intake data", () => {
    const data: AdvisingIntakeData = {
      specialty: "Internal medicine",
      preferred_region: "New England",
      provider_preference: null,
    };
    expect(isAdvisingIntake(data)).toBe(true);
  });

  it("should return false for tutoring intake data", () => {
    const data: TutoringIntakeData = {
      exam: "USMLE Step 1",
      attempt_type: "First attempt",
      provider_preference: null,
    };
    expect(isAdvisingIntake(data)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isAdvisingIntake(null)).toBe(false);
  });
});

// =============================================
// SERVER ACTION TESTS (with mocked Supabase)
// =============================================

describe("Server Actions", () => {
  const mockSupabaseClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe("getPendingQuestionnairesForStudent", () => {
    it("should return empty array when no pending questionnaires", async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getPendingQuestionnairesForStudent("student-123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should return error when database fails", async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = await getPendingQuestionnairesForStudent("student-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });

    it("should filter questionnaires by student_id", async () => {
      const mockData = [
        {
          id: "q1",
          order_id: "order-1",
          questionnaire_type: "tutoring",
          status: "pending",
          responses: null,
          created_at: "2024-01-01",
          completed_at: null,
          order: {
            student_id: "student-123",
            service_tier_id: "tier-1",
            tutor_id: null,
            assignment_status: "unassigned",
            service_tier: {
              tier_name: "Basic",
              service: { title: "MCAT Prep", questionnaire_type: "tutoring" },
            },
            student: {
              first_name: "John",
              last_name: "Doe",
              email: "john@example.com",
              medical_school: "Harvard",
              current_year_in_school: 2,
            },
          },
        },
        {
          id: "q2",
          order_id: "order-2",
          questionnaire_type: "tutoring",
          status: "pending",
          responses: null,
          created_at: "2024-01-02",
          completed_at: null,
          order: {
            student_id: "other-student",
            service_tier_id: "tier-1",
            tutor_id: null,
            assignment_status: "unassigned",
          },
        },
      ];

      mockSupabaseClient.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getPendingQuestionnairesForStudent("student-123");

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].id).toBe("q1");
    });
  });

  describe("getQuestionnaireResponseByOrderId", () => {
    it("should return questionnaire response for valid order", async () => {
      const mockData = {
        id: "q1",
        order_id: "order-123",
        questionnaire_type: "tutoring",
        status: "pending",
        responses: null,
        created_at: "2024-01-01",
        completed_at: null,
        order: {
          student_id: "student-123",
          service_tier_id: "tier-1",
          tutor_id: null,
          assignment_status: "unassigned",
          service_tier: {
            tier_name: "Basic",
            service: { title: "MCAT Prep" },
          },
          student: {
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            medical_school: "Harvard",
            current_year_in_school: 2,
          },
        },
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getQuestionnaireResponseByOrderId("order-123");

      expect(result.success).toBe(true);
      expect(result.data?.order_id).toBe("order-123");
      expect(result.data?.student_first_name).toBe("John");
    });

    it("should return error for non-existent order", async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: "Row not found" },
      });

      const result = await getQuestionnaireResponseByOrderId("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Row not found");
    });
  });

  describe("createPendingQuestionnaireResponse", () => {
    it("should create pending questionnaire response", async () => {
      const mockData = {
        id: "new-q-id",
        order_id: "order-123",
        questionnaire_type: "tutoring",
        status: "pending",
        responses: null,
        created_at: "2024-01-01",
        completed_at: null,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await createPendingQuestionnaireResponse(
        "order-123",
        "tutoring"
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("pending");
      expect(result.data?.questionnaire_type).toBe("tutoring");
    });

    it("should return error on duplicate order_id", async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: "duplicate key value violates unique constraint" },
      });

      const result = await createPendingQuestionnaireResponse(
        "existing-order",
        "tutoring"
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("duplicate");
    });
  });

  describe("submitQuestionnaireResponse", () => {
    it("should submit valid tutoring questionnaire", async () => {
      const responses: TutoringIntakeData = {
        exam: "USMLE Step 1",
        attempt_type: "First attempt",
        provider_preference: null,
      };

      const mockData = {
        id: "q-id",
        order_id: "order-123",
        questionnaire_type: "tutoring",
        status: "completed",
        responses,
        created_at: "2024-01-01",
        completed_at: "2024-01-02",
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await submitQuestionnaireResponse(
        "order-123",
        "tutoring",
        responses
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("completed");
    });

    it("should submit valid advising questionnaire", async () => {
      const responses: AdvisingIntakeData = {
        specialty: "Internal medicine",
        preferred_region: "New England",
        provider_preference: "123e4567-e89b-12d3-a456-426614174000",
      };

      const mockData = {
        id: "q-id",
        order_id: "order-123",
        questionnaire_type: "advising",
        status: "completed",
        responses,
        created_at: "2024-01-01",
        completed_at: "2024-01-02",
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await submitQuestionnaireResponse(
        "order-123",
        "advising",
        responses
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("completed");
    });

    it("should reject invalid tutoring questionnaire", async () => {
      const invalidResponses = {
        exam: "USMLE Step 1",
        // Missing required attempt_type for USMLE
        provider_preference: null,
      } as TutoringIntakeData;

      const result = await submitQuestionnaireResponse(
        "order-123",
        "tutoring",
        invalidResponses
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
    });

    it("should reject invalid advising questionnaire", async () => {
      const invalidResponses = {
        specialty: "Not a real specialty",
        preferred_region: "New England",
        provider_preference: null,
      } as unknown as AdvisingIntakeData;

      const result = await submitQuestionnaireResponse(
        "order-123",
        "advising",
        invalidResponses
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
    });
  });

  describe("getServiceQuestionnaireType", () => {
    it("should return questionnaire type for service with one", async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          service: { questionnaire_type: "tutoring" },
        },
        error: null,
      });

      const result = await getServiceQuestionnaireType("tier-123");

      expect(result.success).toBe(true);
      expect(result.data).toBe("tutoring");
    });

    it("should return null for service without questionnaire type", async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          service: { questionnaire_type: null },
        },
        error: null,
      });

      const result = await getServiceQuestionnaireType("tier-456");

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe("getEligibleProviders", () => {
    it("should return providers for tutoring type", async () => {
      const mockProviders = [
        {
          id: "tutor-1",
          bio: "Experienced tutor",
          degree: "MD",
          specialty: "Internal medicine",
          region: "New England",
          role_type: "tutor",
          exam_subjects: ["USMLE Step 1", "USMLE Step 2"],
          accepting_new_students: true,
          profile: { first_name: "Jane", last_name: "Smith" },
        },
      ];

      // Reset the mock chain for this specific test
      mockSupabaseClient.from.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.in.mockResolvedValue({
        data: mockProviders,
        error: null,
      });

      const result = await getEligibleProviders("tutoring");

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].first_name).toBe("Jane");
    });

    it("should filter by exam subject for tutoring", async () => {
      const mockProviders = [
        {
          id: "tutor-1",
          bio: "USMLE specialist",
          degree: "MD",
          specialty: null,
          region: null,
          role_type: "tutor",
          exam_subjects: ["USMLE Step 1"],
          accepting_new_students: true,
          profile: { first_name: "Jane", last_name: "Smith" },
        },
        {
          id: "tutor-2",
          bio: "COMLEX specialist",
          degree: "DO",
          specialty: null,
          region: null,
          role_type: "tutor",
          exam_subjects: ["COMLEX 1", "COMLEX 2"],
          accepting_new_students: true,
          profile: { first_name: "Bob", last_name: "Jones" },
        },
      ];

      mockSupabaseClient.in.mockResolvedValue({
        data: mockProviders,
        error: null,
      });

      const result = await getEligibleProviders("tutoring", {
        exam: "USMLE Step 1",
      });

      expect(result.success).toBe(true);
      // Should filter to only tutor-1 who teaches USMLE Step 1
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].id).toBe("tutor-1");
    });
  });
});

// =============================================
// CONSTANTS TESTS
// =============================================

describe("Constants", () => {
  it("should have 6 exam types", () => {
    expect(EXAM_TYPES.length).toBe(6);
  });

  it("should have 20 specialties", () => {
    expect(SPECIALTIES.length).toBe(20);
  });

  it("should have 9 regions", () => {
    expect(REGIONS.length).toBe(9);
  });

  it("should have all expected exam types", () => {
    expect(EXAM_TYPES).toContain("USMLE Step 1");
    expect(EXAM_TYPES).toContain("USMLE Step 2");
    expect(EXAM_TYPES).toContain("COMLEX 1");
    expect(EXAM_TYPES).toContain("COMLEX 2");
    expect(EXAM_TYPES).toContain("Pre-clinical Exam");
    expect(EXAM_TYPES).toContain("Shelf Exam");
  });

  it("should have all expected regions", () => {
    expect(REGIONS).toContain("New England");
    expect(REGIONS).toContain("Middle Atlantic");
    expect(REGIONS).toContain("Pacific");
  });
});
