import StudentInfoCard from "@/components/student-profile/StudentInfoCard";
import StudentMetaCard from "@/components/student-profile/StudentMetaCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Student Profile | MatchPal Dashboard",
  description: "Manage your student profile and preferences",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
          Profile
        </h3>
        <div className="space-y-6">
          <StudentMetaCard />
          <StudentInfoCard />
        </div>
      </div>
    </div>
  );
}