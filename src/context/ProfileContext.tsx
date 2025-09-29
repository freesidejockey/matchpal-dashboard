"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { Profile } from "@/types";

type ProfileContextType = {
  profilePromise: Promise<Profile>;
  emailPromise: Promise<string | undefined>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{
  children: React.ReactNode;
  profilePromise: Promise<Profile>;
  emailPromise: Promise<string | undefined>;
}> = ({ children, profilePromise: profile, emailPromise: email }) => {
  return (
    <ProfileContext.Provider
      value={{ profilePromise: profile, emailPromise: email }}
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
