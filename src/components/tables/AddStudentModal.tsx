"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (studentData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    medical_school: string;
    current_year_in_school: string;
    specialty: string;
    services_interested: string[];
    referral_source: string;
    specific_advisor: string | null;
    promo_code: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  isAdding: boolean;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    medical_school: "",
    current_year_in_school: "",
    specialty: "",
    referral_source: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onAdd({
      ...formData,
      services_interested: [],
      specific_advisor: null,
      promo_code: null,
    });

    if (result.success) {
      // Reset form and close modal
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        medical_school: "",
        current_year_in_school: "",
        specialty: "",
        referral_source: "",
      });
      onClose();
    } else {
      alert(`Failed to add student: ${result.error}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Add New Student
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Enter student information
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
              required
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
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label>Phone Number</Label>
            <Input
              name="phone_number"
              type="tel"
              placeholder="(xxx) xxx-xxxx"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Year</Label>
            <Input
              name="current_year_in_school"
              type="text"
              placeholder="Year in School"
              value={formData.current_year_in_school}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Medical School</Label>
            <Input
              name="medical_school"
              type="text"
              placeholder="Medical School"
              value={formData.medical_school}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Specialty</Label>
            <Input
              name="specialty"
              type="text"
              placeholder="Specialty"
              value={formData.specialty}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Referral Source</Label>
            <Input
              name="referral_source"
              type="text"
              placeholder="Referral Source"
              value={formData.referral_source}
              onChange={handleChange}
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
            {isAdding ? "Adding..." : "Add Student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
