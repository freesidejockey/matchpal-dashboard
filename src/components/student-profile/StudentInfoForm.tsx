"use client";
import { studentProfileSchema } from "@/types/student";
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
import { useStudentProfile } from "@/context/StudentProfileContext";

interface StudentInfoFormProps {
  submitAction: (values: z.infer<typeof studentProfileSchema>) => void;
  isSubmitting?: boolean;
}

export function StudentInfoForm({
  submitAction,
  isSubmitting = false,
}: StudentInfoFormProps) {
  const { profile: userProfile, email } = useProfile();
  const { profile: studentProfile } = useStudentProfile();

  const { first_name, last_name, phone } = userProfile;

  const form = useForm<z.infer<typeof studentProfileSchema>>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      first_name: first_name || "",
      last_name: last_name || "",
      email: email || "",
      phone: phone || "",
      medical_school: studentProfile.medical_school || "",
      graduation_year: studentProfile.graduation_year || undefined,
      current_year_in_school:
        studentProfile.current_year_in_school || undefined,
      interests: studentProfile.interests || "",
    },
  });

  function onSubmit(values: z.infer<typeof studentProfileSchema>) {
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
              name="medical_school"
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Medical School
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        studentProfile.medical_school || "Medical school"
                      }
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
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Graduation Year
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={
                        studentProfile.graduation_year?.toString() ||
                        "Graduation year"
                      }
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : null);
                      }}
                      defaultValue={field.value || ""}
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
                <FormItem className="col-span-1">
                  <FormLabel className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Current Year in School
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={
                        studentProfile.current_year_in_school?.toString() ||
                        "Current year"
                      }
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : null);
                      }}
                      defaultValue={field.value || ""}
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
                <FormItem className="col-span-1 sm:col-span-2">
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <TextArea
                      placeholder="Tell us about your interests"
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
