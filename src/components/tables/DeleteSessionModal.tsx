"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { SessionWithDetails } from "@/types";

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: SessionWithDetails | null;
  isDeleting: boolean;
}

export const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  session,
  isDeleting,
}) => {
  if (!session) return null;

  const studentName = `${session.student_first_name} ${session.student_last_name}`;
  const sessionDate = new Date(session.session_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[500px]">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          Delete Session
        </h3>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete the session with <strong>{studentName}</strong> on{" "}
          <strong>{sessionDate}</strong>?
          <br />
          <br />
          This will restore <strong>{session.units_consumed} hours</strong> to the order.
          This action cannot be undone.
        </p>

        <div className="relative z-10 flex gap-3">
          <Button
            onClick={onClose}
            disabled={isDeleting}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            className="flex-1"
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
