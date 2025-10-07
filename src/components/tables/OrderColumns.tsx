"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { EditOrderModal } from "./EditOrderModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { OrderWithDetails, OrderUpdate } from "@/types";

type ColumnActions = {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: OrderUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
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

const ActionsCell: React.FC<{
  order: OrderWithDetails;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: OrderUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
}> = ({ order, onDelete, onUpdate }) => {
  const deleteModal = useModal();
  const editModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    editModal.openModal();
  };

  const handleSave = async (id: string, updates: OrderUpdate) => {
    setIsSaving(true);
    const result = await onUpdate(id, updates);
    setIsSaving(false);
    return result;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(order.id);
    setIsDeleting(false);

    if (!result.success) {
      alert(`Failed to delete order: ${result.error}`);
    } else {
      deleteModal.closeModal();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={deleteModal.openModal}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditOrderModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSave}
        order={order}
        isSaving={isSaving}
      />

      <DeleteOrderModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        order={order}
        isDeleting={isDeleting}
      />
    </>
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

export const createOrderColumns = (
  actions: ColumnActions,
): ColumnDef<OrderWithDetails>[] => [
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
    accessorKey: "tutor_first_name",
    header: ({ column }) => <SortableHeader column={column}>Tutor</SortableHeader>,
    cell: ({ row }) => {
      const firstName = row.original.tutor_first_name;
      const lastName = row.original.tutor_last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : <span className="text-gray-400">Unassigned</span>;
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        order={row.original}
        onDelete={actions.onDelete}
        onUpdate={actions.onUpdate}
      />
    ),
  },
];
