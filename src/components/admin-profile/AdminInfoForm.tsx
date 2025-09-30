"use client";
import { adminProfileSchema } from "@/types/admin";
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
import { useProfile } from "@/context/ProfileContext";

interface AdminInfoFormProps {
  submitAction: (values: z.infer<typeof adminProfileSchema>) => void;
  isSubmitting?: boolean;
}

export function AdminInfoForm({
  submitAction,
  isSubmitting = false,
}: AdminInfoFormProps) {
  const { profile: userProfile, email } = useProfile();

  const { first_name, last_name, phone } = userProfile;

  const form = useForm<z.infer<typeof adminProfileSchema>>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      first_name: first_name || "",
      last_name: last_name || "",
      email: email || "",
      phone: phone || "",
    },
  });

  function onSubmit(values: z.infer<typeof adminProfileSchema>) {
    submitAction(values);
  }

  return (
    <>
      <div className="px-2 pr-14">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Personal Information
        </h4>
        <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
          Update your details to keep your profile up-to-date.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={first_name || "First name"}
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
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={last_name || "Last name"}
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
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={email || "Email"}
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
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={phone || "Phone"}
                      disabled={isSubmitting}
                      {...field}
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
