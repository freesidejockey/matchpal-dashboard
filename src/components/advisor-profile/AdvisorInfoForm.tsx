"use client";
import { tutorProfileSchema } from "@/types/tutor";
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
import { useProfile } from "@/context/ProfileContext";
import { useAdvisorProfile } from "@/context/AdvisorProfileContext";

interface PaymentFormProps {
  submitAction: (values: z.infer<typeof tutorProfileSchema>) => void;
  isSubmitting?: boolean;
}

export function AdvisorInfoForm({
  submitAction,
  isSubmitting = false,
}: PaymentFormProps) {
  const { profile: userProfile, email } = useProfile();
  const { profile: advisorProfile } = useAdvisorProfile();

  const { first_name, last_name, phone } = userProfile;

  const form = useForm<z.infer<typeof tutorProfileSchema>>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      first_name: first_name || "",
      last_name: last_name || "",
      email: email || "",
      phone: phone || "",
      bio: advisorProfile.bio || "",
    },
  });

  function onSubmit(values: z.infer<typeof tutorProfileSchema>) {
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
                      placeholder={first_name || "first name"}
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
                      placeholder={last_name || "last name"}
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
                      placeholder={email || "email"}
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
                      placeholder={phone || "phone"}
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
              name="bio"
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder={
                        advisorProfile.bio ||
                        "Tell us a little bit about yourself"
                      }
                      className="resize-none"
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
