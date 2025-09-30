import { z } from "zod";

// Student Profile Schema
export const studentProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1).optional(),
  email: z.string().min(1, "Email is required"),
  medical_school: z.string().min(1, "Medical school is required").optional(),
  graduation_year: z
    .number()
    .int("Graduation year must be a whole number")
    .min(new Date().getFullYear(), "Graduation year must be in the future")
    .optional()
    .nullable(),
  current_year_in_school: z
    .number()
    .int("Current year must be a whole number")
    .positive("Current year must be greater than 0")
    .optional()
    .nullable(),
  interests: z
    .string()
    .min(10, {
      message: "Interests must be at least 10 characters.",
    })
    .max(500, {
      message: "Interests must not be longer than 500 characters.",
    })
    .optional(),
});