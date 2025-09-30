"use client";

import { onboardingAdminSchema } from "@/types/onboarding";
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

interface OnboardingAdminFormProps {
  onSubmit: (values: z.infer<typeof onboardingAdminSchema>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function OnboardingAdminForm({
  onSubmit,
  onBack,
  isSubmitting = false,
}: OnboardingAdminFormProps) {
  const form = useForm<z.infer<typeof onboardingAdminSchema>>({
    resolver: zodResolver(onboardingAdminSchema),
    defaultValues: {
      payment_preference: "paypal",
      payment_system_username: "",
      hourly_rate: 0,
      accepting_new_users: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="payment_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Payment Method<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="paypal">PayPal</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_system_username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                PayPal Username<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your PayPal username"
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
          name="hourly_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Hourly Rate ($)<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your hourly rate"
                  disabled={isSubmitting}
                  step={0.01}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? parseFloat(value) : 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accepting_new_users"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Accepting New Users
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isSubmitting}
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Completing..." : "Complete Setup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}