"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderWithDetails } from "@/types";

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

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "text-green-600 font-medium";
    case "pending":
      return "text-yellow-600 font-medium";
    case "refunded":
      return "text-red-600 font-medium";
    default:
      return "text-gray-600";
  }
};

const getAssignmentStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600 font-medium";
    case "active":
      return "text-blue-600 font-medium";
    case "assigned":
      return "text-purple-600 font-medium";
    case "unassigned":
      return "text-yellow-600 font-medium";
    case "cancelled":
      return "text-red-600 font-medium";
    default:
      return "text-gray-600";
  }
};

export const createReadOnlyOrderColumns = (): ColumnDef<OrderWithDetails>[] => [
  {
    accessorKey: "student_first_name",
    header: ({ column }) => <SortableHeader column={column}>Student</SortableHeader>,
    cell: ({ row }) => {
      const firstName = row.original.student_first_name;
      const lastName = row.original.student_last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : "—";
    },
  },
  {
    accessorKey: "service_title",
    header: ({ column }) => <SortableHeader column={column}>Service</SortableHeader>,
    cell: ({ row }) => {
      const service = row.original.service_title;
      const tier = row.original.service_tier_name;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{service || "—"}</span>
          {tier && <span className="text-sm text-gray-500">{tier}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => <SortableHeader column={column}>Payment</SortableHeader>,
    cell: ({ row }) => {
      const status = row.original.payment_status;
      return (
        <span className={getPaymentStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "assignment_status",
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => {
      const status = row.original.assignment_status;
      return (
        <span className={getAssignmentStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "units_remaining",
    header: ({ column }) => <SortableHeader column={column}>Units Left</SortableHeader>,
    cell: ({ row }) => {
      const remaining = row.original.units_remaining;
      const total = row.original.total_units;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{remaining} hrs</span>
          <span className="text-sm text-gray-500">of {total}</span>
        </div>
      );
    },
  },
];
