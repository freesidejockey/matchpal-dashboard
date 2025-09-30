import { getAdminProfile } from "@/actions/admin-profile";
import { AdminProfileProvider } from "@/context/AdminProfileContext";
import { StudentsProvider } from "@/context/StudentsContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await the profile to get the actual data
  const adminProfile = await getAdminProfile();

  return (
    <>
      <AdminProfileProvider initialProfile={adminProfile}>
        <StudentsProvider>
          {children}
        </StudentsProvider>
      </AdminProfileProvider>
    </>
  );
}