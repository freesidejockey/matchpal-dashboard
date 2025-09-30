import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StudentsTables from "@/components/tables/StudentsTable";
import React from "react";

export default function BasicTables() {
  return (
    <div className="grid gap-y-10">
      <PageBreadcrumb pageTitle="Students" />
      <ComponentCard
        title="Students Pending Tutor"
        desc="This will be a prefiltered component with additional actions to assign a user to an available tutor"
      >
        <StudentsTables />
      </ComponentCard>
      <ComponentCard title="All Students">
        <StudentsTables />
      </ComponentCard>
    </div>
  );
}
