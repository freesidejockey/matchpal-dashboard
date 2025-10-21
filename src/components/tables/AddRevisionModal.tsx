"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Label from "@/components/form/Label";
import { RevisionInsert } from "@/types";
import { useOrders } from "@/context/OrdersContext";
import { useProfile } from "@/context/ProfileContext";
import { FileUpload, UploadedFile } from "@/components/form/input/FileUpload";

interface AddRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (revisionData: RevisionInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  isAdding: boolean;
}

export const AddRevisionModal: React.FC<AddRevisionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding,
}) => {
  const { orders } = useOrders();
  const { profile } = useProfile();

  // Filter revision orders assigned to current tutor (those with revisions_total set)
  const myRevisionOrders = orders.filter(
    (order) =>
      order.tutor_id === profile.id &&
      order.assignment_status !== "completed" &&
      order.assignment_status !== "cancelled" &&
      order.revisions_total !== null &&
      (order.revisions_used || 0) < order.revisions_total
  );

  const [formData, setFormData] = useState({
    order_id: "",
    comments: "",
  });

  const [revisedDocument, setRevisedDocument] = useState<UploadedFile[]>([]);

  // Get selected order details
  const selectedOrder = orders.find((o) => o.id === formData.order_id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOrder = orders.find((o) => o.id === formData.order_id);
    if (!selectedOrder) {
      alert("Please select an order");
      return;
    }

    if (revisedDocument.length === 0) {
      alert("Please upload the revised document");
      return;
    }

    const result = await onAdd({
      order_id: formData.order_id,
      tutor_id: profile.id,
      completed_at: new Date().toISOString(),
      revised_document_url: revisedDocument[0].path,
      comments: formData.comments || null,
    });

    if (result.success) {
      setFormData({
        order_id: "",
        comments: "",
      });
      setRevisedDocument([]);
      onClose();
    } else {
      alert(`Failed to submit revision: ${result.error}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Submit Revision
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Upload a revised document for a student order
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Student Order</Label>
            <select
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a student order</option>
              {myRevisionOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.student_first_name} {order.student_last_name} -{" "}
                  {order.service_title} ({(order.revisions_total || 0) - (order.revisions_used || 0)}{" "}
                  revisions remaining)
                </option>
              ))}
            </select>
            {myRevisionOrders.length === 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No revision orders available. All revision orders are either completed or have no revisions remaining.
              </p>
            )}
          </div>

          <div className="col-span-1">
            <Label>Tutor Name</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder
                ? `${selectedOrder.tutor_first_name} ${selectedOrder.tutor_last_name}`
                : "—"}
            </div>
          </div>

          <div className="col-span-1">
            <Label>Student Name</Label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {selectedOrder
                ? `${selectedOrder.student_first_name} ${selectedOrder.student_last_name}`
                : "—"}
            </div>
          </div>

          {selectedOrder && selectedOrder.initial_document_url && (
            <div className="col-span-1 sm:col-span-2">
              <Label>Original Document</Label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <a
                  href={selectedOrder.initial_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View Original Document
                </a>
              </div>
            </div>
          )}

          <div className="col-span-1 sm:col-span-2">
            <Label>Revised Document *</Label>
            <FileUpload
              onFilesChange={setRevisedDocument}
              maxFiles={1}
              folder="revisions"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload the revised document (required)
            </p>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Comments to Student</Label>
            <textarea
              name="comments"
              placeholder="Summary of changes, feedback, or notes for the student..."
              value={formData.comments}
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
            disabled={isAdding}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isAdding || revisedDocument.length === 0}
            size="sm"
          >
            {isAdding ? "Submitting..." : "Submit Revision"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
