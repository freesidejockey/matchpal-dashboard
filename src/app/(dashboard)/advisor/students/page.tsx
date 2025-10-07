import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdvisorStudentsTable from "@/components/tables/AdvisorStudentsTable";
import { getStudentsByTutor } from "@/actions/students";
import { getTutorProfile } from "@/actions/tutor-profile";
import { redirect } from "next/navigation";

export default async function AdvisorStudentsPage() {
  // Get the current tutor's profile
  const tutorProfile = await getTutorProfile();

  if (!tutorProfile) {
    redirect("/signin");
  }

  // Fetch students who have orders with this tutor
  const result = await getStudentsByTutor(tutorProfile.id);

  if (!result.success) {
    return (
      <div className="grid gap-y-10">
        <PageBreadcrumb pageTitle="Students" />
        <ComponentCard title="My Students">
          <p className="text-red-500">Error loading students: {result.error}</p>
        </ComponentCard>
      </div>
    );
  }

  const students = result.data || [];

  return (
    <div className="grid gap-y-10">
      <PageBreadcrumb pageTitle="Students" />
      <ComponentCard
        title="My Students"
        desc="Students you have orders with"
      >
        <AdvisorStudentsTable students={students} />
      </ComponentCard>
    </div>
  );
}