import { getStudentProfile } from "@/actions/student-profile";
import { StudentProfileProvider } from "@/context/StudentProfileContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await the profile to get the actual data
  const studentProfile = await getStudentProfile();

  return (
    <>
      <StudentProfileProvider initialProfile={studentProfile}>
        {children}
      </StudentProfileProvider>
    </>
  );
}