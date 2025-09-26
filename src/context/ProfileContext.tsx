"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { Profile } from "@/types";

type ProfileContextType = {
  profilePromise: Promise<Profile>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ 
  children: React.ReactNode;
  profilePromise: Promise<Profile>;
}> = ({ children, profilePromise: profile }) => {
  return (
    <ProfileContext.Provider value={{ profilePromise: profile }}>
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