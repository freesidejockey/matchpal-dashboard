import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TutorsTable from "@/components/tables/TutorsTable";
import React from "react";

export default function TutorsPage() {
  return (
    <div className="grid gap-y-10">
      <PageBreadcrumb pageTitle="Tutors" />
      <ComponentCard
        title="Tutors Accepting New Students"
        desc="Tutors who are currently accepting new students"
      >
        <TutorsTable />
      </ComponentCard>
      <ComponentCard title="All Tutors">
        <TutorsTable />
      </ComponentCard>
    </div>
  );
}