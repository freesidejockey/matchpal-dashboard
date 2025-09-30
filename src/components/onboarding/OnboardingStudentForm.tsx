"use client";

import { onboardingStudentSchema } from "@/types/onboarding";
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
import TextArea from "../form/input/TextArea";

interface OnboardingStudentFormProps {
  onSubmit: (values: z.infer<typeof onboardingStudentSchema>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function OnboardingStudentForm({
  onSubmit,
  onBack,
  isSubmitting = false,
}: OnboardingStudentFormProps) {
  const form = useForm<z.infer<typeof onboardingStudentSchema>>({
    resolver: zodResolver(onboardingStudentSchema),
    defaultValues: {
      medical_school: "",
      graduation_year: new Date().getFullYear(),
      current_year_in_school: 1,
      interests: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="medical_school"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Medical School<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your medical school name"
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
          name="graduation_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Graduation Year<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your expected graduation year"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? parseInt(value) : new Date().getFullYear());
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="current_year_in_school"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Current Year in School<span className="text-error-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your current year"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? parseInt(value) : 1);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Interests (Optional)
              </FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Tell us about your academic interests and specialties"
                  disabled={isSubmitting}
                  className="resize-none"
                  rows={4}
                  {...field}
                />
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