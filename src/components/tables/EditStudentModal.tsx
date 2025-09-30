"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Student } from "./Columns";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
  student: Student | null;
  isSaving: boolean;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    medical_school: "",
    current_year_in_school: "",
    specialty: "",
  });

  // Populate form when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        email: student.email || "",
        phone_number: student.phone_number || "",
        medical_school: student.medical_school || "",
        current_year_in_school: student.current_year_in_school || "",
        specialty: student.specialty || "",
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const result = await onSave(student.id, formData);
    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update student: ${result.error}`);
    }
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[584px] p-5 lg:p-10">
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Student
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update student information
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

          <div className="col-span-1 sm:col-span-2">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
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

          <div className="col-span-1 sm:col-span-2">
            <Label>Specialty</Label>
            <Input
              name="specialty"
              type="text"
              placeholder="Specialty"
              value={formData.specialty}
              onChange={handleChange}
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
