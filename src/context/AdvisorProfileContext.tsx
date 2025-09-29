"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { AdvisorProfile } from "@/types";

type AdvisorProfileContextType = {
  advisorProfilePromise: Promise<AdvisorProfile>;
};

const AdvisorProfileContext = createContext<
  AdvisorProfileContextType | undefined
>(undefined);

export const AdvisorProfileProvider: React.FC<{
  children: React.ReactNode;
  advisorProfilePromise: Promise<AdvisorProfile>;
}> = ({ children, advisorProfilePromise: profile }) => {
  return (
    <AdvisorProfileContext.Provider value={{ advisorProfilePromise: profile }}>
      {children}
    </AdvisorProfileContext.Provider>
  );
};

export const useAdvisorProfile = () => {
  const context = useContext(AdvisorProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
