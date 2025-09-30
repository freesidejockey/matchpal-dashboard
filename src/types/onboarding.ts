import { z } from "zod";

// Step 1: Basic Profile Information
export const onboardingStep1Schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  role: z.enum(["Tutor", "Client", "Admin"], {
    message: "Please select a role",
  }),
});

// Step 2a: Tutor/Advisor Profile
export const onboardingTutorSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(160, "Bio must not be longer than 160 characters"),
  payment_preference: z.enum(["paypal"], {
    message: "Currently only PayPal is supported",
  }),
  payment_system_username: z
    .string()
    .min(1, "Payment system username is required")
    .max(100, "Payment system username must be less than 100 characters"),
  hourly_rate: z
    .number()
    .positive("Hourly rate must be greater than 0")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Hourly rate must have at most 2 decimal places",
    }),
  accepting_new_students: z.boolean().default(true),
});

// Step 2b: Student/Client Profile
export const onboardingStudentSchema = z.object({
  medical_school: z.string().min(1, "Medical school is required"),
  graduation_year: z
    .number()
    .int("Graduation year must be a whole number")
    .min(new Date().getFullYear(), "Graduation year must be in the future"),
  current_year_in_school: z
    .number()
    .int("Current year must be a whole number")
    .positive("Current year must be greater than 0"),
  interests: z
    .string()
    .min(10, "Interests must be at least 10 characters")
    .max(500, "Interests must not be longer than 500 characters")
    .optional(),
});

// Step 2c: Admin Profile
export const onboardingAdminSchema = z.object({
  payment_preference: z.enum(["paypal"], {
    message: "Currently only PayPal is supported",
  }),
  payment_system_username: z
    .string()
    .min(1, "Payment system username is required")
    .max(100, "Payment system username must be less than 100 characters"),
  hourly_rate: z
    .number()
    .positive("Hourly rate must be greater than 0")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Hourly rate must have at most 2 decimal places",
    }),
  accepting_new_users: z.boolean().default(true),
});