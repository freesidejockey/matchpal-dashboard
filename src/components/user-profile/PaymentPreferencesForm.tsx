"use client";
import { tutorPreferencesSchema } from "@/types/tutor";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import Input from "../form/input/InputField";
import { useAdvisorProfile } from "@/context/AdvisorProfileContext";

interface PaymentFormProps {
  submitAction: (values: z.infer<typeof tutorPreferencesSchema>) => void;
  isSubmitting?: boolean;
}

export function TutorPaymentPreferencesForm({
  submitAction,
  isSubmitting = false,
}: PaymentFormProps) {
  const { profile } = useAdvisorProfile();
  const {
    payment_preference,
    payment_system_username,
    accepting_new_students,
    hourly_rate,
  } = profile;

  const form = useForm<z.infer<typeof tutorPreferencesSchema>>({
    resolver: zodResolver(tutorPreferencesSchema),
    defaultValues: {
      payment_preference: payment_preference || "paypal",
      accepting_new_students: accepting_new_students ?? true,
      hourly_rate: hourly_rate || 0,
      payment_system_username: payment_system_username || "",
    },
  });

  function onSubmit(values: z.infer<typeof tutorPreferencesSchema>) {
    submitAction(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="accepting_new_students"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-gray-800 dark:text-white/90">
                I am currently accepting new students
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payment_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Payment System Preference
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={payment_preference || "paypal"}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Select your preferred payment system for receiving payments from
                students.
              </FormDescription>
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
                Payment System Username
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    payment_system_username || "your-paypal-username"
                  }
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Enter your username or email address for the selected payment
                system.
              </FormDescription>
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
                Hourly Rate
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder={hourly_rate?.toString() || "0.00"}
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseFloat(value));
                  }}
                />
              </FormControl>
              <FormDescription className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Enter your hourly rate in USD (e.g., 50.00)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
