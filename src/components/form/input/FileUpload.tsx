"use client";

import React, { useState, useRef } from "react";
import { uploadFile, deleteFile } from "@/actions/storage";
import {
  validateFile,
  formatFileSize,
  getFileTypeInfo,
} from "@/utils/fileUpload";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";

export interface UploadedFile {
  name: string;
  path: string;
  publicUrl: string;
  size: number;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  folder?: string;
  existingFiles?: UploadedFile[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  folder = "sessions",
  existingFiles = [],
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    setError(null);

    // Check max files limit
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    for (const file of selectedFiles) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
    }

    // Upload files
    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    for (const file of selectedFiles) {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Simulate progress (since we can't track real progress with server actions)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90),
          }));
        }, 200);

        const result = await uploadFile(file, folder);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

        if (result.success && result.data) {
          uploadedFiles.push({
            name: file.name,
            path: result.data.path,
            publicUrl: result.data.publicUrl,
            size: file.size,
          });
        } else {
          setError(result.error || "Upload failed");
          clearInterval(progressInterval);
          break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        break;
      }
    }

    setUploading(false);
    setUploadProgress({});

    // Update files list
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];

    // Optionally delete from storage
    // await deleteFile(fileToRemove.path);

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.md,.rtf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || files.length >= maxFiles}
      />

      {/* Upload button */}
      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading || files.length >= maxFiles}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files ({files.length}/{maxFiles})
          </>
        )}
      </Button>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Accepted: PDF, Word, Excel, Text files (Max 10MB each)
      </p>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const { icon, color } = getFileTypeInfo(file.name);
            const progress = uploadProgress[file.name];

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className={`text-2xl ${color}`}>{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>

                    {/* Progress bar */}
                    {progress !== undefined && progress < 100 && (
                      <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
