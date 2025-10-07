"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ServiceTierInsert, Service } from "@/types";

interface AddServiceTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tierData: ServiceTierInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  isAdding: boolean;
  services: Service[];
}

export const AddServiceTierModal: React.FC<AddServiceTierModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding,
  services,
}) => {
  const [formData, setFormData] = useState({
    service_id: "",
    tier_name: "",
    base_units: "",
    base_price: "",
    is_active: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    const result = await onAdd({
      service_id: formData.service_id,
      tier_name: formData.tier_name,
      base_units: parseFloat(formData.base_units),
      base_price: parseFloat(formData.base_price),
      is_active: formData.is_active,
    });

    if (result.success) {
      setFormData({
        service_id: "",
        tier_name: "",
        base_units: "",
        base_price: "",
        is_active: true,
      });
      onClose();
    } else {
      alert(`Failed to add service tier: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Add New Service Tier
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Enter service tier information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Service</Label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Tier Name</Label>
            <Input
              name="tier_name"
              type="text"
              placeholder="e.g., Basic (10 hours)"
              value={formData.tier_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label>Units (Hours)</Label>
            <Input
              name="base_units"
              type="number"
              step="0.5"
              min="0"
              placeholder="10"
              value={formData.base_units}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label>Price ($)</Label>
            <Input
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="500.00"
              value={formData.base_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Tier is active
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
            {isAdding ? "Adding..." : "Add Tier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
