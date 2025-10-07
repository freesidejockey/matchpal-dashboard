import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdvisorOrdersTable from "@/components/tables/AdvisorOrdersTable";
import { getOrdersByTutor } from "@/actions/orders";
import { getTutorProfile } from "@/actions/tutor-profile";
import { redirect } from "next/navigation";

export default async function AdvisorOrdersPage() {
  // Get the current tutor's profile
  const tutorProfile = await getTutorProfile();

  if (!tutorProfile) {
    redirect("/signin");
  }

  // Fetch orders assigned to this tutor
  const result = await getOrdersByTutor(tutorProfile.id);

  if (!result.success) {
    return (
      <div className="grid gap-y-10">
        <PageBreadcrumb pageTitle="Orders" />
        <ComponentCard title="My Orders">
          <p className="text-red-500">Error loading orders: {result.error}</p>
        </ComponentCard>
      </div>
    );
  }

  // Filter for active orders only
  const activeOrders = (result.data || []).filter(
    (order) => order.assignment_status === "active" || order.assignment_status === "assigned"
  );

  return (
    <div className="grid gap-y-10">
      <PageBreadcrumb pageTitle="Orders" />
      <ComponentCard
        title="My Active Orders"
        desc="Orders currently assigned to you"
      >
        <AdvisorOrdersTable orders={activeOrders} />
      </ComponentCard>
    </div>
  );
}