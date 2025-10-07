"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteSessionModal } from "./DeleteSessionModal";
import { EditSessionModal } from "./EditSessionModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { SessionWithDetails, SessionUpdate } from "@/types";

type ColumnActions = {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: SessionUpdate,
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
  session: SessionWithDetails;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    updates: SessionUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
}> = ({ session, onDelete, onUpdate }) => {
  const deleteModal = useModal();
  const editModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    editModal.openModal();
  };

  const handleSave = async (id: string, updates: SessionUpdate) => {
    setIsSaving(true);
    const result = await onUpdate(id, updates);
    setIsSaving(false);
    return result;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(session.id);
    setIsDeleting(false);

    if (!result.success) {
      alert(`Failed to delete session: ${result.error}`);
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

      <EditSessionModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSave}
        session={session}
        isSaving={isSaving}
      />

      <DeleteSessionModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        session={session}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const createSessionColumns = (
  actions: ColumnActions,
): ColumnDef<SessionWithDetails>[] => [
  {
    accessorKey: "session_date",
    header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
    cell: ({ row }) => {
      const date = new Date(row.original.session_date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
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
    accessorKey: "order_service_title",
    header: ({ column }) => <SortableHeader column={column}>Service</SortableHeader>,
    cell: ({ row }) => row.original.order_service_title || "—",
  },
  {
    accessorKey: "units_consumed",
    header: ({ column }) => (
      <SortableHeader column={column}>Hours</SortableHeader>
    ),
    cell: ({ row }) => {
      const units = row.original.units_consumed;
      return `${units} hrs`;
    },
  },
  {
    accessorKey: "session_notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.session_notes;
      return notes ? (
        <span className="line-clamp-2">{notes}</span>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        session={row.original}
        onDelete={actions.onDelete}
        onUpdate={actions.onUpdate}
      />
    ),
  },
];
