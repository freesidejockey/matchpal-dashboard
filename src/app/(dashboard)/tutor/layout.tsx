import { getTutorProfile } from "@/actions/tutor-profile";
import { AdvisorProfileProvider } from "@/context/AdvisorProfileContext";
import { SessionsProvider } from "@/context/SessionsContext";
import { OrdersProvider } from "@/context/OrdersContext";

export default async function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await the profile to get the actual data
  const tutorProfile = await getTutorProfile();

  return (
    <>
      <AdvisorProfileProvider initialProfile={tutorProfile}>
        <OrdersProvider>
          <SessionsProvider tutorId={tutorProfile?.id}>
            {children}
          </SessionsProvider>
        </OrdersProvider>
      </AdvisorProfileProvider>
    </>
  );
}
