"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ServiceTierWithService, ServiceTierUpdate, Service } from "@/types";

interface EditServiceTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: ServiceTierUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  serviceTier: ServiceTierWithService;
  isSaving: boolean;
}

export const EditServiceTierModal: React.FC<EditServiceTierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  serviceTier,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    tier_name: serviceTier.tier_name,
    base_units: serviceTier.base_units.toString(),
    base_price: serviceTier.base_price.toString(),
    is_active: serviceTier.is_active,
  });

  useEffect(() => {
    setFormData({
      tier_name: serviceTier.tier_name,
      base_units: serviceTier.base_units.toString(),
      base_price: serviceTier.base_price.toString(),
      is_active: serviceTier.is_active,
    });
  }, [serviceTier]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onSave(serviceTier.id, {
      tier_name: formData.tier_name,
      base_units: parseFloat(formData.base_units),
      base_price: parseFloat(formData.base_price),
      is_active: formData.is_active,
    });

    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update service tier: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Service Tier
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update service tier information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Service</Label>
            <Input
              type="text"
              value={serviceTier.service?.title || ""}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
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
