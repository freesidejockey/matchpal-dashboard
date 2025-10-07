"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { OrderInsert } from "@/types";
import { useStudents } from "@/context/StudentsContext";
import { useServices } from "@/context/ServicesContext";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (orderData: OrderInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  isAdding: boolean;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding,
}) => {
  const { students } = useStudents();
  const { serviceTiers } = useServices();

  const [formData, setFormData] = useState({
    student_id: "",
    service_tier_id: "",
    payment_status: "pending" as const,
    assignment_status: "unassigned" as const,
    total_units: "",
    status_notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tierId = e.target.value;
    const tier = serviceTiers.find((t) => t.id === tierId);

    setFormData((prev) => ({
      ...prev,
      service_tier_id: tierId,
      total_units: tier ? tier.base_units.toString() : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onAdd({
      student_id: formData.student_id,
      service_tier_id: formData.service_tier_id,
      tutor_id: null,
      payment_status: formData.payment_status,
      assignment_status: formData.assignment_status,
      total_units: parseFloat(formData.total_units),
      units_remaining: parseFloat(formData.total_units),
      hourly_rate_locked: null,
      status_notes: formData.status_notes || null,
    });

    if (result.success) {
      setFormData({
        student_id: "",
        service_tier_id: "",
        payment_status: "pending",
        assignment_status: "unassigned",
        total_units: "",
        status_notes: "",
      });
      onClose();
    } else {
      alert(`Failed to add order: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Add New Order
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Create a new order for a student
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Student</Label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Service Tier</Label>
            <select
              name="service_tier_id"
              value={formData.service_tier_id}
              onChange={handleServiceTierChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a service tier</option>
              {serviceTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.service?.title} - {tier.tier_name} (${tier.base_price})
                </option>
              ))}
            </select>
          </div>

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

          <div className="col-span-1">
            <Label>Total Units (Hours)</Label>
            <Input
              name="total_units"
              type="number"
              step="0.5"
              min="0"
              placeholder="10"
              value={formData.total_units}
              onChange={handleChange}
              required
            />
          </div>

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
            disabled={isAdding}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isAdding} size="sm">
            {isAdding ? "Adding..." : "Add Order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
