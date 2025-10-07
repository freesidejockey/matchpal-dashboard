"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { OrderWithDetails } from "@/types";

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: OrderWithDetails | null;
  isDeleting: boolean;
}

export const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isDeleting,
}) => {
  if (!order) return null;

  const studentName = `${order.student_first_name} ${order.student_last_name}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[500px]">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          Delete Order
        </h3>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete the order for <strong>{studentName}</strong>?
          <br />
          <br />
          Service: <strong>{order.service_title}</strong>
          <br />
          This action cannot be undone and will also delete all associated sessions.
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
