"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { StudentProfile } from "@/types";

type StudentProfileContextType = {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
};

const StudentProfileContext = createContext<
  StudentProfileContextType | undefined
>(undefined);

export const StudentProfileProvider: React.FC<{
  children: React.ReactNode;
  initialProfile: StudentProfile;
}> = ({ children, initialProfile }) => {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);

  const updateProfile = (updates: Partial<StudentProfile>) => {
    // Optimistically update the UI immediately
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <StudentProfileContext.Provider
      value={{
        profile,
        updateProfile,
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
};

export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (context === undefined) {
    throw new Error(
      "useStudentProfile must be used within a StudentProfileProvider",
    );
  }
  return context;
};