"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Edit, ChevronUp, ChevronDown, Paperclip, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteSessionModal } from "./DeleteSessionModal";
import { EditSessionModal } from "./EditSessionModal";
import { AttachmentsModal } from "./AttachmentsModal";
import { ViewSessionModal } from "./ViewSessionModal";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { SessionWithDetails, SessionUpdate, SessionAttachment } from "@/types";
import { useSessions } from "@/context/SessionsContext";

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

const AttachmentsCell: React.FC<{
  attachments: SessionAttachment[];
  sessionDate: string;
}> = ({ attachments, sessionDate }) => {
  const attachmentsModal = useModal();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={attachmentsModal.openModal}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <Paperclip className="h-4 w-4" />
        {attachments.length} {attachments.length === 1 ? "file" : "files"}
      </Button>

      <AttachmentsModal
        isOpen={attachmentsModal.isOpen}
        onClose={attachmentsModal.closeModal}
        attachments={attachments}
        sessionDate={sessionDate}
      />
    </>
  );
};

const PayoutStatusCell: React.FC<{
  session: SessionWithDetails;
  isEditable?: boolean;
}> = ({ session, isEditable = true }) => {
  const { updatePayoutStatus } = useSessions();
  const [isUpdating, setIsUpdating] = useState(false);
  const isPaid = session.payout_status === "paid_out";

  const handleToggle = async () => {
    if (!isEditable) return;
    setIsUpdating(true);
    const newStatus = isPaid ? "pending" : "paid_out";
    const result = await updatePayoutStatus(session.id, newStatus);

    if (!result.success) {
      alert(`Failed to update payout status: ${result.error}`);
    }
    setIsUpdating(false);
  };

  return (
    <Button
      variant={isPaid ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isUpdating || !isEditable}
      className={`flex items-center gap-1 ${isPaid ? "bg-green-600 hover:bg-green-700" : ""} ${!isEditable ? "cursor-default" : ""}`}
    >
      {isPaid ? (
        <>
          <Check className="h-4 w-4" />
          Paid
        </>
      ) : (
        <>
          <X className="h-4 w-4" />
          {isUpdating ? "Updating..." : "Unpaid"}
        </>
      )}
    </Button>
  );
};

const ViewButton: React.FC<{ session: SessionWithDetails }> = ({ session }) => {
  const viewModal = useModal();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={viewModal.openModal}
        className="h-8 w-8"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <ViewSessionModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        session={session}
      />
    </>
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

// Simplified columns for finances page (no comments/notes, just essential info)
export const createFinancesSessionColumns = (isEditable: boolean = true): ColumnDef<SessionWithDetails>[] => [
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
    accessorKey: "tutor_first_name",
    header: ({ column }) => <SortableHeader column={column}>Tutor</SortableHeader>,
    cell: ({ row }) => {
      const firstName = row.original.tutor_first_name;
      const lastName = row.original.tutor_last_name;
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
    id: "amount",
    header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
    accessorFn: (row) => row.tutor_hourly_rate ? row.units_consumed * row.tutor_hourly_rate : 0,
    cell: ({ row }) => {
      const amount = row.original.tutor_hourly_rate
        ? row.original.units_consumed * row.original.tutor_hourly_rate
        : null;
      return amount !== null ? `$${amount.toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "tutor_payment_preference",
    header: "Payment Method",
    cell: ({ row }) => {
      const preference = row.original.tutor_payment_preference;
      const username = row.original.tutor_payment_system_username;
      return (
        <div className="flex flex-col">
          <span className="capitalize">{preference || "—"}</span>
          {username && (
            <span className="text-xs text-gray-500">{username}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "payout_status",
    header: "Payout Status",
    accessorKey: "payout_status",
    cell: ({ row }) => <PayoutStatusCell session={row.original} isEditable={isEditable} />,
  },
  {
    id: "view",
    header: "",
    cell: ({ row }) => <ViewButton session={row.original} />,
  },
];

export const createSessionColumns = (
  actions: ColumnActions,
  isEditable: boolean = true,
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
    accessorKey: "tutor_first_name",
    header: ({ column }) => <SortableHeader column={column}>Tutor</SortableHeader>,
    cell: ({ row }) => {
      const firstName = row.original.tutor_first_name;
      const lastName = row.original.tutor_last_name;
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
    accessorKey: "comments_to_student",
    header: "Comments to Student",
    cell: ({ row }) => {
      const comments = row.original.comments_to_student;
      return comments ? (
        <span className="line-clamp-2">{comments}</span>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    id: "attachments",
    header: "Files",
    cell: ({ row }) => {
      const attachments = row.original.attachments;

      if (!attachments || attachments.length === 0) {
        return <span className="text-gray-400">—</span>;
      }

      return <AttachmentsCell attachments={attachments} sessionDate={row.original.session_date} />;
    },
  },
  {
    id: "amount",
    header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
    accessorFn: (row) => row.tutor_hourly_rate ? row.units_consumed * row.tutor_hourly_rate : 0,
    cell: ({ row }) => {
      const amount = row.original.tutor_hourly_rate
        ? row.original.units_consumed * row.original.tutor_hourly_rate
        : null;
      return amount !== null ? `$${amount.toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "tutor_payment_preference",
    header: "Payment Method",
    cell: ({ row }) => {
      const preference = row.original.tutor_payment_preference;
      const username = row.original.tutor_payment_system_username;
      return (
        <div className="flex flex-col">
          <span className="capitalize">{preference || "—"}</span>
          {username && (
            <span className="text-xs text-gray-500">{username}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "payout_status",
    header: "Payout Status",
    accessorKey: "payout_status",
    cell: ({ row }) => <PayoutStatusCell session={row.original} isEditable={isEditable} />,
  },
  {
    id: "view",
    header: "",
    cell: ({ row }) => <ViewButton session={row.original} />,
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
