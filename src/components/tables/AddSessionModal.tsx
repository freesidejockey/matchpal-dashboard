"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { SessionInsert } from "@/types";
import { useOrders } from "@/context/OrdersContext";
import { useProfile } from "@/context/ProfileContext";

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sessionData: SessionInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  isAdding: boolean;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding,
}) => {
  const { orders } = useOrders();
  const { profile } = useProfile();

  // Filter orders assigned to current tutor
  const myOrders = orders.filter(
    (order) => order.tutor_id === profile.id && order.assignment_status !== "completed" && order.assignment_status !== "cancelled"
  );

  const [formData, setFormData] = useState({
    order_id: "",
    units_consumed: "",
    session_date: new Date().toISOString().split("T")[0], // Today's date
    session_notes: "",
    comments_to_student: "",
  });

  // Get selected order details
  const selectedOrder = orders.find((o) => o.id === formData.order_id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOrder = orders.find((o) => o.id === formData.order_id);
    if (!selectedOrder) {
      alert("Please select an order");
      return;
    }

    const result = await onAdd({
      order_id: formData.order_id,
      tutor_id: profile.id,
      student_id: selectedOrder.student_id,
      units_consumed: parseFloat(formData.units_consumed),
      session_date: new Date(formData.session_date).toISOString(),
      session_notes: formData.session_notes || null,
      comments_to_student: formData.comments_to_student || null,
    });

    if (result.success) {
      setFormData({
        order_id: "",
        units_consumed: "",
        session_date: new Date().toISOString().split("T")[0],
        session_notes: "",
        comments_to_student: "",
      });
      onClose();
    } else {
      alert(`Failed to add session: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Log New Session
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Record a completed tutoring session
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Student Order</Label>
            <select
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a student order</option>
              {myOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.student_first_name} {order.student_last_name} - {order.service_title} ({order.units_remaining} hrs remaining)
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <Label>Tutor Name</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder ? `${selectedOrder.tutor_first_name} ${selectedOrder.tutor_last_name}` : '—'}
            </div>
          </div>

          <div className="col-span-1">
            <Label>Student Name</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder ? `${selectedOrder.student_first_name} ${selectedOrder.student_last_name}` : '—'}
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
            disabled={isAdding}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isAdding} size="sm">
            {isAdding ? "Adding..." : "Log Session"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
