"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { useProfile } from "@/context/ProfileContext";
import { StudentInfoForm } from "./StudentInfoForm";
import { studentProfileSchema } from "@/types/student";
import { z } from "zod";
import { toast } from "sonner";
import { useStudentProfile } from "@/context/StudentProfileContext";
import { updateStudentProfile as updateProfileServer } from "@/actions/student-profile";

export default function StudentInfoCard() {
  const {
    profile: userProfile,
    email,
    updateProfile: updateUserProfile,
    updateEmail,
  } = useProfile();
  const { profile: studentProfile, updateProfile: updateStudentProfile } =
    useStudentProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { first_name, last_name, phone } = userProfile;

  const { isOpen, openModal, closeModal } = useModal();

  const handleSave = async (values: z.infer<typeof studentProfileSchema>) => {
    setIsSubmitting(true);

    // Store previous values for rollback
    const previousUserProfile = {
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      phone: userProfile.phone,
    };
    const previousEmail = email;
    const previousStudentProfile = {
      medical_school: studentProfile.medical_school,
      graduation_year: studentProfile.graduation_year,
      current_year_in_school: studentProfile.current_year_in_school,
      interests: studentProfile.interests,
    };

    try {
      // Optimistically update both contexts immediately
      updateUserProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
      });
      updateEmail(values.email);
      updateStudentProfile({
        medical_school: values.medical_school,
        graduation_year: values.graduation_year,
        current_year_in_school: values.current_year_in_school,
        interests: values.interests,
      });

      closeModal();

      // Make the server call
      const result = await updateProfileServer(values);

      if (!result.success) {
        // Rollback all changes on failure
        updateUserProfile(previousUserProfile);
        updateEmail(previousEmail || "");
        updateStudentProfile(previousStudentProfile);
        toast.error(result.error || "Failed to update profile");
      } else {
        // Optionally sync with server response
        if (result.data) {
          updateStudentProfile({
            medical_school: result.data.medical_school,
            graduation_year: result.data.graduation_year,
            current_year_in_school: result.data.current_year_in_school,
            interests: result.data.interests,
          });
        }
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      // Rollback on error
      updateUserProfile(previousUserProfile);
      updateEmail(previousEmail || "");
      updateStudentProfile(previousStudentProfile);
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {first_name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {last_name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {phone}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Medical School
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {studentProfile.medical_school || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Graduation Year
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {studentProfile.graduation_year || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Current Year in School
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {studentProfile.current_year_in_school || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Interests
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {studentProfile.interests || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          disabled={isSubmitting}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <StudentInfoForm
            submitAction={handleSave}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}
