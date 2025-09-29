import { z } from "zod";

// Tutor Profile Schemas
export const tutorPreferencesSchema = z.object({
  payment_preference: z.enum(["paypal"], {
    message: "Currently only PayPal is supported",
  }),
  payment_system_username: z
    .string()
    .min(1, "Payment system username is required")
    .max(100, "Payment system username must be less than 100 characters"),
  accepting_new_students: z.boolean(),
  hourly_rate: z
    .number()
    .positive("Hourly rate must be greater than 0")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Hourly rate must have at most 2 decimal places",
    }),
});

export const tutorProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "First name is required"),
  phone: z.string().min(1).optional(),
  email: z.string().min(1, "Email is required"),
  bio: z
    .string()
    .min(10, {
      message: "Bio must be at least 10 characters.",
    })
    .max(160, {
      message: "Bio must not be longer than 30 characters.",
    })
    .optional(),
});
