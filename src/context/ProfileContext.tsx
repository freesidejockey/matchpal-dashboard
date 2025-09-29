"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { Profile } from "@/types";

type ProfileContextType = {
  profile: Profile;
  email: string | undefined;
  updateProfile: (updates: Partial<Profile>) => void;
  updateEmail: (newEmail: string) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{
  children: React.ReactNode;
  initialProfile: Profile;
  initialEmail: string | undefined;
}> = ({ children, initialProfile, initialEmail }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [email, setEmail] = useState<string | undefined>(initialEmail);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateEmail = (newEmail: string) => {
    setEmail(newEmail);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        email,
        updateProfile,
        updateEmail,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
