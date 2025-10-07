"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Service, ServiceUpdate } from "@/types";

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: ServiceUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  service: Service;
  isSaving: boolean;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  service,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    title: service.title,
    description: service.description || "",
    is_active: service.is_active,
  });

  useEffect(() => {
    setFormData({
      title: service.title,
      description: service.description || "",
      is_active: service.is_active,
    });
  }, [service]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

    const result = await onSave(service.id, {
      title: formData.title,
      description: formData.description || null,
      is_active: formData.is_active,
    });

    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update service: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Service
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update service information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
          <div className="col-span-1">
            <Label>Service Title</Label>
            <Input
              name="title"
              type="text"
              placeholder="e.g., MCAT Prep"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label>Description</Label>
            <textarea
              name="description"
              placeholder="Brief description of the service..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={3}
            />
          </div>

          <div className="col-span-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Service is active
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
