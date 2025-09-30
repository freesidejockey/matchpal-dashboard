"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { AdminProfile } from "@/types";

type AdminProfileContextType = {
  profile: AdminProfile;
  updateProfile: (updates: Partial<AdminProfile>) => void;
};

const AdminProfileContext = createContext<
  AdminProfileContextType | undefined
>(undefined);

export const AdminProfileProvider: React.FC<{
  children: React.ReactNode;
  initialProfile: AdminProfile;
}> = ({ children, initialProfile }) => {
  const [profile, setProfile] = useState<AdminProfile>(initialProfile);

  const updateProfile = (updates: Partial<AdminProfile>) => {
    // Optimistically update the UI immediately
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AdminProfileContext.Provider
      value={{
        profile,
        updateProfile,
      }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
};

export const useAdminProfile = () => {
  const context = useContext(AdminProfileContext);
  if (context === undefined) {
    throw new Error(
      "useAdminProfile must be used within a AdminProfileProvider",
    );
  }
  return context;
};