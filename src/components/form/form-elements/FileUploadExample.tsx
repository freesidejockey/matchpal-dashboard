"use client";

import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { FileUpload, UploadedFile } from "../input/FileUpload";

export default function FileUploadExample() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesChange = (files: UploadedFile[]) => {
    console.log("Files updated:", files);
    setUploadedFiles(files);
  };

  return (
    <ComponentCard title="File Upload to Supabase">
      <div className="space-y-4">
        <FileUpload
          onFilesChange={handleFilesChange}
          maxFiles={5}
          folder="sessions"
        />

        {/* Display file URLs (for demo) */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="text-xs">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500 break-all">{file.path}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
