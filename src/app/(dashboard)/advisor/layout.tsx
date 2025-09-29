"use server";

import { getTutorProfile } from "@/actions/tutor-profile";
import { AdvisorProfileProvider } from "@/context/AdvisorProfileContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const advisorProfile = getTutorProfile();

  return (
    <>
      <AdvisorProfileProvider advisorProfilePromise={advisorProfile}>
        {children}
      </AdvisorProfileProvider>
    </>
  );
}
