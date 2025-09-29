import { getTutorProfile } from "@/actions/tutor-profile";
import { AdvisorProfileProvider } from "@/context/AdvisorProfileContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await the profile to get the actual data
  const advisorProfile = await getTutorProfile();

  return (
    <>
      <AdvisorProfileProvider initialProfile={advisorProfile}>
        {children}
      </AdvisorProfileProvider>
    </>
  );
}
