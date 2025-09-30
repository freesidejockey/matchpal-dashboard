"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteStudentModal } from "./DeleteStudentModal";
import { EditStudentModal } from "./EditStudentModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";

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

type ColumnActions = {
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (id: string, updates: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
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
  student: Student;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (id: string, updates: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
}> = ({ student, onDelete, onUpdate }) => {
  const deleteModal = useModal();
  const editModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    editModal.openModal();
  };

  const handleSave = async (id: string, updates: Partial<Student>) => {
    setIsSaving(true);
    const result = await onUpdate(id, updates);
    setIsSaving(false);
    return result;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(student.id);
    setIsDeleting(false);

    if (!result.success) {
      alert(`Failed to delete student: ${result.error}`);
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

      <EditStudentModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSave}
        student={student}
        isSaving={isSaving}
      />

      <DeleteStudentModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        student={student}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const createColumns = (actions: ColumnActions): ColumnDef<Student>[] => [
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        student={row.original}
        onDelete={actions.onDelete}
        onUpdate={actions.onUpdate}
      />
    ),
  },
];
