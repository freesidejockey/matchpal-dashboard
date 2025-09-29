"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { AdvisorProfile } from "@/types";

type AdvisorProfileContextType = {
  profile: AdvisorProfile;
  updateProfile: (updates: Partial<AdvisorProfile>) => void;
};

const AdvisorProfileContext = createContext<
  AdvisorProfileContextType | undefined
>(undefined);

export const AdvisorProfileProvider: React.FC<{
  children: React.ReactNode;
  initialProfile: AdvisorProfile;
}> = ({ children, initialProfile }) => {
  const [profile, setProfile] = useState<AdvisorProfile>(initialProfile);

  const updateProfile = (updates: Partial<AdvisorProfile>) => {
    // Optimistically update the UI immediately
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AdvisorProfileContext.Provider
      value={{
        profile,
        updateProfile,
      }}
    >
      {children}
    </AdvisorProfileContext.Provider>
  );
};

export const useAdvisorProfile = () => {
  const context = useContext(AdvisorProfileContext);
  if (context === undefined) {
    throw new Error(
      "useAdvisorProfile must be used within a AdvisorProfileProvider",
    );
  }
  return context;
};
