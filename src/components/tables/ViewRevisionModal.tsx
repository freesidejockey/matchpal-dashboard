"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import { RevisionWithDetails } from "@/types";

interface ViewRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revision: RevisionWithDetails;
  payoutRate: number;
}

export const ViewRevisionModal: React.FC<ViewRevisionModalProps> = ({
  isOpen,
  onClose,
  revision,
  payoutRate,
}) => {
  const completedDate = new Date(revision.completed_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Revision Details
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        View revision information
      </p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Student Name */}
        <div className="col-span-1">
          <Label>Student Name</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {revision.student_first_name} {revision.student_last_name}
          </div>
        </div>

        {/* Tutor Name */}
        <div className="col-span-1">
          <Label>Tutor Name</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {revision.tutor_first_name} {revision.tutor_last_name}
          </div>
        </div>

        {/* Service */}
        <div className="col-span-1 sm:col-span-2">
          <Label>Service</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {revision.order_service_title || "—"}
          </div>
        </div>

        {/* Completed Date */}
        <div className="col-span-1 sm:col-span-2">
          <Label>Completed Date</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {completedDate}
          </div>
        </div>

        {/* Amount */}
        <div className="col-span-1">
          <Label>Amount</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            ${payoutRate.toFixed(2)}
          </div>
        </div>

        {/* Payment Method */}
        <div className="col-span-1">
          <Label>Payment Method</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            <div className="capitalize">{revision.tutor_payment_preference || "—"}</div>
            {revision.tutor_payment_system_username && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {revision.tutor_payment_system_username}
              </div>
            )}
          </div>
        </div>

        {/* Payout Status */}
        <div className="col-span-1 sm:col-span-2">
          <Label>Payout Status</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            <span className="capitalize">{revision.payout_status.replace("_", " ")}</span>
          </div>
        </div>

        {/* Document */}
        {revision.revised_document_url && (
          <div className="col-span-1 sm:col-span-2">
            <Label>Revised Document</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              Document uploaded
            </div>
          </div>
        )}

        {/* Comments */}
        {revision.comments && (
          <div className="col-span-1 sm:col-span-2">
            <Label>Comments</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400 whitespace-pre-wrap">
              {revision.comments}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          size="sm"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};
