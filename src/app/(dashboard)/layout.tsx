import ProfileLoader from "./profile-loader";
import DashboardClientLayout from "./dashboard-client-layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileLoader>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </ProfileLoader>
  );
}
