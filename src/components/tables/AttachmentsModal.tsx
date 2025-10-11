"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { SessionAttachment } from "@/types";
import { formatFileSize, getFileTypeInfo } from "@/utils/fileUpload";
import { Download, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/actions/storage";

interface AttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: SessionAttachment[];
  sessionDate: string;
}

export const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  isOpen,
  onClose,
  attachments,
  sessionDate,
}) => {
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const handleDownload = async (attachment: SessionAttachment, index: number) => {
    setDownloadingIndex(index);

    try {
      // Get a fresh signed URL
      const result = await getSignedUrl(attachment.path);

      if (result.success && result.data) {
        // Open the signed URL in a new tab
        window.open(result.data.signedUrl, "_blank");
      } else {
        alert(`Failed to download file: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to download file");
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
        Session Attachments
      </h3>
      <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
        Files from session on {new Date(sessionDate).toLocaleDateString()}
      </p>

      <div className="space-y-3">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No attachments for this session.
          </p>
        ) : (
          attachments.map((attachment, index) => {
            const { icon, color } = getFileTypeInfo(attachment.name);

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className={`text-2xl ${color}`}>{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload(attachment, index)}
                  size="sm"
                  variant="outline"
                  className="ml-3"
                  disabled={downloadingIndex === index}
                >
                  {downloadingIndex === index ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>
    </Modal>
  );
};
