import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StudentsTables from "@/components/tables/StudentsTable";
import React from "react";

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Students" />
      <div className="space-y-6">
        <ComponentCard title="All Students">
          <StudentsTables />
        </ComponentCard>
      </div>
    </div>
  );
}
