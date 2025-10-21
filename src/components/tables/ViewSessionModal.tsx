"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import { SessionWithDetails } from "@/types";

interface ViewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionWithDetails;
}

export const ViewSessionModal: React.FC<ViewSessionModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const sessionDate = new Date(session.session_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const amount = session.tutor_hourly_rate
    ? (session.units_consumed * session.tutor_hourly_rate).toFixed(2)
    : "N/A";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Session Details
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        View session information
      </p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Student Name */}
        <div className="col-span-1">
          <Label>Student Name</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {session.student_first_name} {session.student_last_name}
          </div>
        </div>

        {/* Tutor Name */}
        <div className="col-span-1">
          <Label>Tutor Name</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {session.tutor_first_name} {session.tutor_last_name}
          </div>
        </div>

        {/* Service */}
        <div className="col-span-1 sm:col-span-2">
          <Label>Service</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {session.order_service_title || "—"}
          </div>
        </div>

        {/* Session Date */}
        <div className="col-span-1">
          <Label>Session Date</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {sessionDate}
          </div>
        </div>

        {/* Hours */}
        <div className="col-span-1">
          <Label>Hours</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {session.units_consumed}
          </div>
        </div>

        {/* Amount */}
        <div className="col-span-1">
          <Label>Amount</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            ${amount}
          </div>
        </div>

        {/* Payment Method */}
        <div className="col-span-1">
          <Label>Payment Method</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            <div className="capitalize">{session.tutor_payment_preference || "—"}</div>
            {session.tutor_payment_system_username && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {session.tutor_payment_system_username}
              </div>
            )}
          </div>
        </div>

        {/* Payout Status */}
        <div className="col-span-1">
          <Label>Payout Status</Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
            <span className="capitalize">{session.payout_status.replace("_", " ")}</span>
          </div>
        </div>

        {/* Session Notes */}
        {session.session_notes && (
          <div className="col-span-1 sm:col-span-2">
            <Label>Session Notes</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400 whitespace-pre-wrap">
              {session.session_notes}
            </div>
          </div>
        )}

        {/* Comments to Student */}
        {session.comments_to_student && (
          <div className="col-span-1 sm:col-span-2">
            <Label>Comments to Student</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400 whitespace-pre-wrap">
              {session.comments_to_student}
            </div>
          </div>
        )}

        {/* Attachments */}
        {session.attachments && session.attachments.length > 0 && (
          <div className="col-span-1 sm:col-span-2">
            <Label>Attachments</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {session.attachments.length} file(s) attached
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
