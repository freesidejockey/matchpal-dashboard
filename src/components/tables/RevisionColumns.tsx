"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Download, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevisionWithDetails } from "@/types";
import { getSignedUrl } from "@/actions/storage";
import { useState } from "react";
import { useRevisions } from "@/context/RevisionsContext";
import { useModal } from "@/hooks/useModal";
import { ViewRevisionModal } from "./ViewRevisionModal";

const SortableHeader: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const PayoutStatusCell: React.FC<{
  revision: RevisionWithDetails;
  isEditable?: boolean;
}> = ({ revision, isEditable = true }) => {
  const { updatePayoutStatus } = useRevisions();
  const [isUpdating, setIsUpdating] = useState(false);
  const isPaid = revision.payout_status === "paid_out";

  const handleToggle = async () => {
    if (!isEditable) return;
    setIsUpdating(true);
    const newStatus = isPaid ? "pending" : "paid_out";
    const result = await updatePayoutStatus(revision.id, newStatus);

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

const DownloadButton: React.FC<{ path: string }> = ({ path }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await getSignedUrl(path);
      if (result.success && result.data) {
        window.open(result.data.signedUrl, "_blank");
      } else {
        alert("Failed to download file");
      }
    } catch {
      alert("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
    >
      <Download className="h-4 w-4" />
      {downloading ? "Loading..." : "Download"}
    </Button>
  );
};

const ViewButton: React.FC<{ revision: RevisionWithDetails; payoutRate: number }> = ({ revision, payoutRate }) => {
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

      <ViewRevisionModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        revision={revision}
        payoutRate={payoutRate}
      />
    </>
  );
};

// Simplified columns for finances page (no comments, just essential info)
export const createFinancesRevisionColumns = (
  payoutRate?: number,
  isEditable: boolean = true,
): ColumnDef<RevisionWithDetails>[] => [
  {
    accessorKey: "completed_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Completed</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.completed_at);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "student_first_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Student</SortableHeader>
    ),
    cell: ({ row }) => {
      const firstName = row.original.student_first_name;
      const lastName = row.original.student_last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : "—";
    },
  },
  {
    accessorKey: "tutor_first_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Tutor</SortableHeader>
    ),
    cell: ({ row }) => {
      const firstName = row.original.tutor_first_name;
      const lastName = row.original.tutor_last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : "—";
    },
  },
  {
    accessorKey: "order_service_title",
    header: ({ column }) => (
      <SortableHeader column={column}>Service</SortableHeader>
    ),
    cell: ({ row }) => row.original.order_service_title || "—",
  },
  ...(payoutRate !== undefined
    ? [
        {
          id: "payout",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          header: ({ column }: any) => (
            <SortableHeader column={column}>Amount</SortableHeader>
          ),
          accessorFn: () => payoutRate,
          cell: () => `$${payoutRate.toFixed(2)}`,
        } as ColumnDef<RevisionWithDetails>,
      ]
    : []),
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
    cell: ({ row }) => <PayoutStatusCell revision={row.original} isEditable={isEditable} />,
  },
  {
    id: "view",
    header: "",
    cell: ({ row }) => <ViewButton revision={row.original} payoutRate={payoutRate || 0} />,
  },
];

export const createRevisionColumns = (
  payoutRate?: number,
  isEditable: boolean = true,
): ColumnDef<RevisionWithDetails>[] => [
  {
    accessorKey: "completed_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Completed</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.completed_at);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "student_first_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Student</SortableHeader>
    ),
    cell: ({ row }) => {
      const firstName = row.original.student_first_name;
      const lastName = row.original.student_last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : "—";
    },
  },
  {
    accessorKey: "tutor_first_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Tutor</SortableHeader>
    ),
    cell: ({ row }) => {
      const firstName = row.original.tutor_first_name;
      const lastName = row.original.tutor_last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : "—";
    },
  },
  {
    accessorKey: "order_service_title",
    header: ({ column }) => (
      <SortableHeader column={column}>Service</SortableHeader>
    ),
    cell: ({ row }) => row.original.order_service_title || "—",
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => {
      const comments = row.original.comments;
      return comments ? (
        <span className="line-clamp-2">{comments}</span>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    id: "document",
    header: "Document",
    cell: ({ row }) => {
      const documentUrl = row.original.revised_document_url;
      return documentUrl ? (
        <DownloadButton path={documentUrl} />
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  ...(payoutRate !== undefined
    ? [
        {
          id: "payout",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          header: ({ column }: any) => (
            <SortableHeader column={column}>Amount</SortableHeader>
          ),
          accessorFn: () => payoutRate,
          cell: () => `$${payoutRate.toFixed(2)}`,
        } as ColumnDef<RevisionWithDetails>,
      ]
    : []),
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
    cell: ({ row }) => <PayoutStatusCell revision={row.original} isEditable={isEditable} />,
  },
  {
    id: "view",
    header: "",
    cell: ({ row }) => <ViewButton revision={row.original} payoutRate={payoutRate || 0} />,
  },
];
