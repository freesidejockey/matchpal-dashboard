import { getAdminProfile } from "@/actions/admin-profile";
import { AdminProfileProvider } from "@/context/AdminProfileContext";
import { StudentsProvider } from "@/context/StudentsContext";
import { TutorsProvider } from "@/context/TutorsContext";
import { ServicesProvider } from "@/context/ServicesContext";
import { OrdersProvider } from "@/context/OrdersContext";

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
          <TutorsProvider>
            <ServicesProvider>
              <OrdersProvider>
                {children}
              </OrdersProvider>
            </ServicesProvider>
          </TutorsProvider>
        </StudentsProvider>
      </AdminProfileProvider>
    </>
  );
}