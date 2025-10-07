"use client";

import { ColumnDef } from "@tantml:react-table";
import { Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteServiceModal } from "./DeleteServiceModal";
import { EditServiceModal } from "./EditServiceModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { Service, ServiceUpdate } from "@/types";

type ColumnActions = {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: ServiceUpdate,
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
  service: Service;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: ServiceUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
}> = ({ service, onDelete, onUpdate }) => {
  const deleteModal = useModal();
  const editModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    editModal.openModal();
  };

  const handleSave = async (id: string, updates: ServiceUpdate) => {
    setIsSaving(true);
    const result = await onUpdate(id, updates);
    setIsSaving(false);
    return result;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(service.id);
    setIsDeleting(false);

    if (!result.success) {
      alert(`Failed to delete service: ${result.error}`);
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

      <EditServiceModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSave}
        service={service}
        isSaving={isSaving}
      />

      <DeleteServiceModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        service={service}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const createServiceColumns = (
  actions: ColumnActions,
): ColumnDef<Service>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.description;
      return desc ? (
        <span className="line-clamp-2">{desc}</span>
      ) : (
        <span className="text-gray-400">—</span>
      );
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
        service={row.original}
        onDelete={actions.onDelete}
        onUpdate={actions.onUpdate}
      />
    ),
  },
];
