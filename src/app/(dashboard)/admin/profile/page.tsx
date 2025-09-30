import AdminInfoCard from "@/components/admin-profile/AdminInfoCard";
import AdminMetaCard from "@/components/admin-profile/AdminMetaCard";
import AdminPaymentPreferencesCard from "@/components/admin-profile/AdminPaymentPreferencesCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Profile | MatchPal Dashboard",
  description: "Manage your admin profile and preferences",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
          Profile
        </h3>
        <div className="space-y-6">
          <AdminMetaCard />
          <AdminInfoCard />
          <AdminPaymentPreferencesCard />
        </div>
      </div>
    </div>
  );
}
