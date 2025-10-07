"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Student = {
  id: string;
  email: string;
  phone_number: string;
  medical_school: string;
  current_year_in_school: string;
  specialty: string;
  services_interested: string[];
  referral_source: string;
  specific_advisor: string | null;
  promo_code: string | null;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
};

const SortableHeader: React.FC<{
  column: any;
  children: React.ReactNode;
}> = ({ column, children }) => {
  const sortState = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex items-center gap-1 hover:bg-transparent p-0"
    >
      {children}
      <div className="flex flex-col ml-1">
        <ChevronUp
          className={`h-3 w-3 -mb-1 ${sortState === "asc" ? "text-gray-900" : "text-gray-400"}`}
        />
        <ChevronDown
          className={`h-3 w-3 ${sortState === "desc" ? "text-gray-900" : "text-gray-400"}`}
        />
      </div>
    </Button>
  );
};

export const createReadOnlyColumns = (): ColumnDef<Student>[] => [
  {
    accessorKey: "first_name",
    header: ({ column }) => <SortableHeader column={column}>First Name</SortableHeader>,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => <SortableHeader column={column}>Last Name</SortableHeader>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
  },
  {
    accessorKey: "medical_school",
    header: ({ column }) => <SortableHeader column={column}>Medical School</SortableHeader>,
  },
  {
    accessorKey: "current_year_in_school",
    header: ({ column }) => <SortableHeader column={column}>Year</SortableHeader>,
  },
  {
    accessorKey: "specialty",
    header: ({ column }) => <SortableHeader column={column}>Specialty</SortableHeader>,
  },
];
