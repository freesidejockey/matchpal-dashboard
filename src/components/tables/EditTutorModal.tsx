"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Tutor } from "./TutorColumns";

interface EditTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Tutor>) => Promise<{ success: boolean; error?: string }>;
  tutor: Tutor | null;
  isSaving: boolean;
}

export const EditTutorModal: React.FC<EditTutorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tutor,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    hourly_rate: "",
    payment_system_username: "",
    accepting_new_students: true,
  });

  // Populate form when tutor changes
  useEffect(() => {
    if (tutor) {
      setFormData({
        first_name: tutor.first_name || "",
        last_name: tutor.last_name || "",
        bio: tutor.bio || "",
        hourly_rate: tutor.hourly_rate?.toString() || "",
        payment_system_username: tutor.payment_system_username || "",
        accepting_new_students: tutor.accepting_new_students,
      });
    }
  }, [tutor]);

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
    if (!tutor) return;

    const updates: Partial<Tutor> = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      bio: formData.bio || null,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      payment_system_username: formData.payment_system_username || null,
      accepting_new_students: formData.accepting_new_students,
    };

    const result = await onSave(tutor.id, updates);
    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update tutor: ${result.error}`);
    }
  };

  if (!tutor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Tutor
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update tutor information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>First Name</Label>
            <Input
              name="first_name"
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Last Name</Label>
            <Input
              name="last_name"
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
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
