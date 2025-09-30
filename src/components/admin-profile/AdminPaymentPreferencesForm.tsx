"use client";
import { adminPreferencesSchema } from "@/types/admin";
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
import { Checkbox } from "../ui/checkbox";
import Input from "../form/input/InputField";
import { useAdminProfile } from "@/context/AdminProfileContext";

interface AdminPaymentPreferencesFormProps {
  submitAction: (values: z.infer<typeof adminPreferencesSchema>) => void;
  isSubmitting?: boolean;
}

export function AdminPaymentPreferencesForm({
  submitAction,
  isSubmitting = false,
}: AdminPaymentPreferencesFormProps) {
  const { profile } = useAdminProfile();

  const {
    payment_preference,
    payment_system_username,
    accepting_new_users,
    hourly_rate,
  } = profile;

  const form = useForm<z.infer<typeof adminPreferencesSchema>>({
    resolver: zodResolver(adminPreferencesSchema),
    defaultValues: {
      payment_preference: payment_preference || "paypal",
      payment_system_username: payment_system_username || "",
      accepting_new_users: accepting_new_users ?? true,
      hourly_rate: hourly_rate || 0,
    },
  });

  function onSubmit(values: z.infer<typeof adminPreferencesSchema>) {
    submitAction(values);
  }

  return (
    <>
      <div className="px-2 pr-14">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Payment Preferences
        </h4>
        <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
          Update your payment preferences and availability.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="accepting_new_users"
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
                  I am currently accepting new users
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="payment_preference"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Payment Preference
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
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Payment Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Payment username"
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
                <FormItem className="col-span-1 sm:col-span-2">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Hourly Rate ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Hourly rate"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseFloat(value) : 0);
                      }}
                      step={0.01}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </form>
      </Form>
    </>
  );
}