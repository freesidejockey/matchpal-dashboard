import { z } from "zod";

// Admin Profile Schemas
export const adminPreferencesSchema = z.object({
  payment_preference: z.enum(["paypal"], {
    message: "Currently only PayPal is supported",
  }),
  payment_system_username: z
    .string()
    .min(1, "Payment system username is required")
    .max(100, "Payment system username must be less than 100 characters"),
  accepting_new_users: z.boolean(),
  hourly_rate: z
    .number()
    .positive("Hourly rate must be greater than 0")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Hourly rate must have at most 2 decimal places",
    }),
});

export const adminProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1).optional(),
  email: z.string().min(1, "Email is required"),
});