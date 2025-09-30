"use client";

import { onboardingStep1Schema } from "@/types/onboarding";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import Input from "../form/input/InputField";

interface OnboardingStep1FormProps {
  onSubmit: (values: z.infer<typeof onboardingStep1Schema>) => void;
  isSubmitting?: boolean;
}

export function OnboardingStep1Form({
  onSubmit,
  isSubmitting = false,
}: OnboardingStep1FormProps) {
  const form = useForm<z.infer<typeof onboardingStep1Schema>>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      role: undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                First Name<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your first name"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Last Name<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your last name"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Phone<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                I am a<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                >
                  <option value="">Select your role</option>
                  <option value="Tutor">Tutor/Advisor</option>
                  <option value="Client">Student/Client</option>
                  <option value="Admin">Administrator</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </form>
    </Form>
  );
}