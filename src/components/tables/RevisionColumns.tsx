"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevisionWithDetails } from "@/types";
import { getSignedUrl } from "@/actions/storage";
import { useState } from "react";

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

export const createRevisionColumns = (
  payoutRate?: number,
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
            <SortableHeader column={column}>Payout</SortableHeader>
          ),
          accessorFn: () => payoutRate,
          cell: () => `$${payoutRate.toFixed(2)}`,
        } as ColumnDef<RevisionWithDetails>,
      ]
    : []),
];
