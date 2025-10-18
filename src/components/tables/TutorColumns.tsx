"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Edit, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteTutorModal } from "./DeleteTutorModal";
import { EditTutorModal } from "./EditTutorModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";

export type Tutor = {
  id: string;
  payment_preference: string;
  payment_system_username: string | null;
  bio: string | null;
  hourly_rate: number | null;
  accepting_new_students: boolean;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  status: string | null;
  onboarding_email_sent_at: string | null;
};

type ColumnActions = {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (id: string, updates: Partial<Tutor>) => Promise<{ success: boolean; error?: string }>;
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
  tutor: Tutor;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (id: string, updates: Partial<Tutor>) => Promise<{ success: boolean; error?: string }>;
}> = ({ tutor, onDelete, onUpdate }) => {
  const deleteModal = useModal();
  const editModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    editModal.openModal();
  };

  const handleSave = async (id: string, updates: Partial<Tutor>) => {
    setIsSaving(true);
    const result = await onUpdate(id, updates);
    setIsSaving(false);
    return result;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(tutor.id);
    setIsDeleting(false);

    if (!result.success) {
      alert(`Failed to delete tutor: ${result.error}`);
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

      <EditTutorModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSave}
        tutor={tutor}
        isSaving={isSaving}
      />

      <DeleteTutorModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        tutor={tutor}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const createTutorColumns = (actions: ColumnActions): ColumnDef<Tutor>[] => [
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
    cell: ({ row }) => {
      const email = row.original.email;
      return email || "—";
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
        draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        invited: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
      const color = statusColors[status as keyof typeof statusColors] || statusColors.draft;
      return (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
        </span>
      );
    },
  },
  {
    accessorKey: "hourly_rate",
    header: ({ column }) => <SortableHeader column={column}>Hourly Rate</SortableHeader>,
    cell: ({ row }) => {
      const rate = row.original.hourly_rate;
      return rate ? `$${rate.toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "accepting_new_students",
    header: ({ column }) => <SortableHeader column={column}>Accepting Students</SortableHeader>,
    cell: ({ row }) => {
      return row.original.accepting_new_students ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-red-600" />
      );
    },
  },
  {
    accessorKey: "payment_preference",
    header: ({ column }) => <SortableHeader column={column}>Payment Method</SortableHeader>,
    cell: ({ row }) => {
      const preference = row.original.payment_preference;
      return preference ? preference.charAt(0).toUpperCase() + preference.slice(1) : "—";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        tutor={row.original}
        onDelete={actions.onDelete}
        onUpdate={actions.onUpdate}
      />
    ),
  },
];
