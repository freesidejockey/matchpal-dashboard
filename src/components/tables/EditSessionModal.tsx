"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { SessionWithDetails, SessionUpdate } from "@/types";

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: SessionUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  session: SessionWithDetails;
  isSaving: boolean;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  session,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    units_consumed: session.units_consumed.toString(),
    session_date: new Date(session.session_date).toISOString().split("T")[0],
    session_notes: session.session_notes || "",
  });

  useEffect(() => {
    setFormData({
      units_consumed: session.units_consumed.toString(),
      session_date: new Date(session.session_date).toISOString().split("T")[0],
      session_notes: session.session_notes || "",
    });
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onSave(session.id, {
      units_consumed: parseFloat(formData.units_consumed),
      session_date: new Date(formData.session_date).toISOString(),
      session_notes: formData.session_notes || null,
    });

    if (result.success) {
      onClose();
    } else {
      alert(`Failed to update session: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Edit Session
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Update session information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {/* Read-only student info */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Student</Label>
            <Input
              type="text"
              value={`${session.student_first_name} ${session.student_last_name}`}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Read-only service info */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Service</Label>
            <Input
              type="text"
              value={session.order_service_title || "—"}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
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
