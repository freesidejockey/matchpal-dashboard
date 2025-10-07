"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteServiceTierModal } from "./DeleteServiceTierModal";
import { EditServiceTierModal } from "./EditServiceTierModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { ServiceTierWithService, ServiceTierUpdate } from "@/types";

type ColumnActions = {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: ServiceTierUpdate,
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
  serviceTier: ServiceTierWithService;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: ServiceTierUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
}> = ({ serviceTier, onDelete, onUpdate }) => {
  const deleteModal = useModal();
  const editModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    editModal.openModal();
  };

  const handleSave = async (id: string, updates: ServiceTierUpdate) => {
    setIsSaving(true);
    const result = await onUpdate(id, updates);
    setIsSaving(false);
    return result;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(serviceTier.id);
    setIsDeleting(false);

    if (!result.success) {
      alert(`Failed to delete service tier: ${result.error}`);
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

      <EditServiceTierModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSave}
        serviceTier={serviceTier}
        isSaving={isSaving}
      />

      <DeleteServiceTierModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        serviceTier={serviceTier}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const createServiceTierColumns = (
  actions: ColumnActions,
): ColumnDef<ServiceTierWithService>[] => [
  {
    accessorKey: "service.title",
    header: ({ column }) => <SortableHeader column={column}>Service</SortableHeader>,
    cell: ({ row }) => row.original.service?.title || "—",
  },
  {
    accessorKey: "tier_name",
    header: ({ column }) => <SortableHeader column={column}>Tier Name</SortableHeader>,
  },
  {
    accessorKey: "base_units",
    header: ({ column }) => <SortableHeader column={column}>Units</SortableHeader>,
    cell: ({ row }) => {
      const units = row.original.base_units;
      return `${units} hrs`;
    },
  },
  {
    accessorKey: "base_price",
    header: ({ column }) => <SortableHeader column={column}>Price</SortableHeader>,
    cell: ({ row }) => {
      const price = row.original.base_price;
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => {
      return row.original.is_active ? (
        <span className="text-green-600 font-medium">Active</span>
      ) : (
        <span className="text-gray-400">Inactive</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        serviceTier={row.original}
        onDelete={actions.onDelete}
        onUpdate={actions.onUpdate}
      />
    ),
  },
];
