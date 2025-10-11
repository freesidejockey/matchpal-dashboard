import { getTutorProfile } from "@/actions/tutor-profile";
import { AdvisorProfileProvider } from "@/context/AdvisorProfileContext";
import { SessionsProvider } from "@/context/SessionsContext";
import { OrdersProvider } from "@/context/OrdersContext";

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
        <OrdersProvider>
          <SessionsProvider tutorId={advisorProfile?.id}>
            {children}
          </SessionsProvider>
        </OrdersProvider>
      </AdvisorProfileProvider>
    </>
  );
}
