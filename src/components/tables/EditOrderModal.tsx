"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { OrderWithDetails, OrderUpdate } from "@/types";
import { useTutors } from "@/context/TutorsContext";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: OrderUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  order: OrderWithDetails;
  isSaving: boolean;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  order,
  isSaving,
}) => {
  const { tutors } = useTutors();

  const [formData, setFormData] = useState({
    tutor_id: order.tutor_id || "",
    payment_status: order.payment_status,
    assignment_status: order.assignment_status,
    status_notes: order.status_notes || "",
    hourly_rate_locked: order.hourly_rate_locked?.toString() || "",
  });

  useEffect(() => {
    setFormData({
      tutor_id: order.tutor_id || "",
      payment_status: order.payment_status,
      assignment_status: order.assignment_status,
      status_notes: order.status_notes || "",
      hourly_rate_locked: order.hourly_rate_locked?.toString() || "",
    });
  }, [order]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTutorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tutorId = e.target.value;
    const tutor = tutors.find((t) => t.id === tutorId);

    setFormData((prev) => ({
      ...prev,
      tutor_id: tutorId,
      hourly_rate_locked: tutor?.hourly_rate?.toString() || prev.hourly_rate_locked,
      assignment_status: tutorId ? "assigned" : "unassigned",
      assigned_at: tutorId ? new Date().toISOString() : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates: OrderUpdate = {
      tutor_id: formData.tutor_id || null,
      payment_status: formData.payment_status,
      assignment_status: formData.assignment_status,
      status_notes: formData.status_notes || null,
      hourly_rate_locked: formData.hourly_rate_locked
        ? parseFloat(formData.hourly_rate_locked)
        : null,
    };

    // Add assigned_at timestamp if tutor is being assigned
    if (formData.tutor_id && !order.tutor_id) {
      updates.assigned_at = new Date().toISOString();
    }

    const result = await onSave(order.id, updates);

    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update order: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Order
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update order information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {/* Read-only student info */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Student</Label>
            <Input
              type="text"
              value={`${order.student_first_name} ${order.student_last_name}`}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Read-only service info */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Service</Label>
            <Input
              type="text"
              value={`${order.service_title} - ${order.service_tier_name}`}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Tutor assignment */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Assign Tutor</Label>
            <select
              name="tutor_id"
              value={formData.tutor_id}
              onChange={handleTutorChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Unassigned</option>
              {tutors
                .filter((tutor) => tutor.accepting_new_students)
                .map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.first_name} {tutor.last_name} (${tutor.hourly_rate}/hr)
                  </option>
                ))}
            </select>
          </div>

          {/* Hourly rate locked */}
          {formData.tutor_id && (
            <div className="col-span-1">
              <Label>Locked Hourly Rate ($)</Label>
              <Input
                name="hourly_rate_locked"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                value={formData.hourly_rate_locked}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Payment status */}
          <div className="col-span-1">
            <Label>Payment Status</Label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Assignment status */}
          <div className="col-span-1">
            <Label>Assignment Status</Label>
            <select
              name="assignment_status"
              value={formData.assignment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Units info (read-only) */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Units Remaining</Label>
            <Input
              type="text"
              value={`${order.units_remaining} of ${order.total_units} hours`}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Notes */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Notes</Label>
            <textarea
              name="status_notes"
              placeholder="Optional notes..."
              value={formData.status_notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} size="sm">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
