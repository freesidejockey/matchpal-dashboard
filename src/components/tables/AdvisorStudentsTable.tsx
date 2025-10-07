"use client";

import { useMemo } from "react";
import { createReadOnlyColumns } from "./ReadOnlyStudentColumns";
import { DataTable } from "./DataTable";
import { Student } from "@/actions/students";

interface AdvisorStudentsTableProps {
  students: Student[];
}

export default function AdvisorStudentsTable({ students }: AdvisorStudentsTableProps) {
  const columns = useMemo(() => createReadOnlyColumns(), []);

  return (
    <div className="container mx-auto">
      <DataTable
        openModal={() => {}}
        columns={columns}
        data={students}
        hideAddButton={true}
      />
    </div>
  );
}
