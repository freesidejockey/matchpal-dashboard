"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { SessionWithDetails, SessionUpdate } from "@/types";
import { useOrders } from "@/context/OrdersContext";
import { useProfile } from "@/context/ProfileContext";

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: SessionUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  session: SessionWithDetails;
  isSaving: boolean;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  session,
  isSaving,
}) => {
  const { orders } = useOrders();
  const { profile } = useProfile();

  // Filter orders assigned to current tutor
  const myOrders = orders.filter(
    (order) => order.tutor_id === profile.id && order.assignment_status !== "completed" && order.assignment_status !== "cancelled"
  );

  const [formData, setFormData] = useState({
    order_id: session.order_id,
    units_consumed: session.units_consumed.toString(),
    session_date: new Date(session.session_date).toISOString().split("T")[0],
    session_notes: session.session_notes || "",
    comments_to_student: session.comments_to_student || "",
  });

  useEffect(() => {
    setFormData({
      order_id: session.order_id,
      units_consumed: session.units_consumed.toString(),
      session_date: new Date(session.session_date).toISOString().split("T")[0],
      session_notes: session.session_notes || "",
      comments_to_student: session.comments_to_student || "",
    });
  }, [session]);

  // Get selected order details for display
  const selectedOrder = orders.find((o) => o.id === formData.order_id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates: SessionUpdate = {
      units_consumed: parseFloat(formData.units_consumed),
      session_date: new Date(formData.session_date).toISOString(),
      session_notes: formData.session_notes || null,
      comments_to_student: formData.comments_to_student || null,
    };

    // If order changed, also update order_id, student_id, and tutor_id
    if (formData.order_id !== session.order_id && selectedOrder) {
      updates.order_id = formData.order_id;
      updates.student_id = selectedOrder.student_id;
      updates.tutor_id = selectedOrder.tutor_id;
    }

    const result = await onSave(session.id, updates);

    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update session: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Session
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update session information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {/* Editable order selection */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Student Order</Label>
            <select
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {myOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.student_first_name} {order.student_last_name} - {order.service_title} ({order.units_remaining} hrs remaining)
                </option>
              ))}
            </select>
          </div>

          {/* Read-only tutor info */}
          <div className="col-span-1">
            <Label>Tutor Name</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder ? `${selectedOrder.tutor_first_name} ${selectedOrder.tutor_last_name}` : `${session.tutor_first_name} ${session.tutor_last_name}`}
            </div>
          </div>

          {/* Read-only student info */}
          <div className="col-span-1">
            <Label>Student Name</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder ? `${selectedOrder.student_first_name} ${selectedOrder.student_last_name}` : `${session.student_first_name} ${session.student_last_name}`}
            </div>
          </div>

          {/* Read-only service info */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Service</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder ? selectedOrder.service_title : (session.order_service_title || "No service title")}
            </div>
          </div>

          <div className="col-span-1">
            <Label>Session Date</Label>
            <Input
              name="session_date"
              type="date"
              value={formData.session_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label>Hours</Label>
            <Input
              name="units_consumed"
              type="number"
              step="0.25"
              min="0.25"
              placeholder="1.5"
              value={formData.units_consumed}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Session Notes</Label>
            <textarea
              name="session_notes"
              placeholder="What did you cover in this session?"
              value={formData.session_notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={4}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Comments to Student</Label>
            <textarea
              name="comments_to_student"
              placeholder="Comments or feedback for the student..."
              value={formData.comments_to_student}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={4}
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
