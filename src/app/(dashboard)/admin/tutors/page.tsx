import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TutorsTable from "@/components/tables/TutorsTable";
import SendTestEmailButton from "@/components/email/SendTestEmailButton";
import SendTestTutorOnboardingButton from "@/components/email/SendTestTutorOnboardingButton";
import React from "react";

export default function TutorsPage() {
  return (
    <div className="grid gap-y-10">
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Tutors" />
        <div className="flex gap-3">
          <SendTestEmailButton />
          <SendTestTutorOnboardingButton />
        </div>
      </div>
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