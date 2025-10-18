"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface AddTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tutorData: {
    first_name: string;
    last_name: string;
    email: string;
    hourly_rate?: number | null;
  }) => Promise<{ success: boolean; error?: string }>;
  isAdding: boolean;
}

export const AddTutorModal: React.FC<AddTutorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    hourly_rate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onAdd({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
    });

    if (result.success) {
      // Reset form and close modal
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        hourly_rate: "",
      });
      onClose();
    } else {
      alert(`Failed to invite tutor: ${result.error}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Invite New Advisor
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Enter advisor information to send an invitation email
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>First Name<span className="text-red-500">*</span></Label>
            <Input
              name="first_name"
              type="text"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label>Last Name<span className="text-red-500">*</span></Label>
            <Input
              name="last_name"
              type="text"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Email<span className="text-red-500">*</span></Label>
            <Input
              name="email"
              type="email"
              placeholder="advisor@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Hourly Rate ($)</Label>
            <Input
              name="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.hourly_rate}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Set the advisor's hourly rate now or leave empty to set later
            </p>
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
            {isAdding ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
