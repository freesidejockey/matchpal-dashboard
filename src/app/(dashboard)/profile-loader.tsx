import { getUserEmail, getUserProfile } from "@/context/retrieval";
import { ProfileProvider } from "@/context/ProfileContext";

export default async function ProfileLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  const email = await getUserEmail();

  return (
    <ProfileProvider initialProfile={profile} initialEmail={email}>
      {children}
    </ProfileProvider>
  );
}
