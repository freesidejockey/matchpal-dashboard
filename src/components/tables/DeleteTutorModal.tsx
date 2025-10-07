"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Tutor } from "./TutorColumns";

interface DeleteTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tutor: Tutor | null;
  isDeleting: boolean;
}

export const DeleteTutorModal: React.FC<DeleteTutorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tutor,
  isDeleting,
}) => {
  if (!tutor) return null;

  const tutorName =
    tutor.first_name && tutor.last_name
      ? `${tutor.first_name} ${tutor.last_name}`
      : `Tutor ${tutor.id.slice(0, 8)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[500px]">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          Delete Tutor
        </h3>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{tutorName}</strong>?
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
