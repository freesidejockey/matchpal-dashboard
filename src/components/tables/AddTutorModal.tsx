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
    id: string;
    payment_preference?: string;
    payment_system_username?: string | null;
    bio?: string | null;
    hourly_rate?: number | null;
    accepting_new_students?: boolean;
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
    id: "",
    bio: "",
    hourly_rate: "",
    payment_system_username: "",
    accepting_new_students: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onAdd({
      id: formData.id,
      payment_preference: "paypal",
      bio: formData.bio || null,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      payment_system_username: formData.payment_system_username || null,
      accepting_new_students: formData.accepting_new_students,
    });

    if (result.success) {
      // Reset form and close modal
      setFormData({
        id: "",
        bio: "",
        hourly_rate: "",
        payment_system_username: "",
        accepting_new_students: true,
      });
      onClose();
    } else {
      alert(`Failed to add tutor: ${result.error}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Add New Tutor
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Enter tutor information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Profile ID (UUID)</Label>
            <Input
              name="id"
              type="text"
              placeholder="Profile UUID"
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
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
          </div>

          <div className="col-span-1">
            <Label>Payment Username</Label>
            <Input
              name="payment_system_username"
              type="text"
              placeholder="PayPal username"
              value={formData.payment_system_username}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Bio</Label>
            <textarea
              name="bio"
              placeholder="Brief bio..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={3}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="accepting_new_students"
                checked={formData.accepting_new_students}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Accepting new students
              </span>
            </label>
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
            {isAdding ? "Adding..." : "Add Tutor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
