import { getAdminProfile } from "@/actions/admin-profile";
import { AdminProfileProvider } from "@/context/AdminProfileContext";

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
        {children}
      </AdminProfileProvider>
    </>
  );
}