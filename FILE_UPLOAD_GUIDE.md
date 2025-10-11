# Supabase File Upload Guide

## Overview
This guide explains how to use the file upload system for session attachments in your application.

## Setup Steps

### 1. Create the Storage Bucket in Supabase

#### Via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New Bucket**
5. Configure:
   - **Name**: `session_uploads`
   - **Public bucket**: Toggle **OFF** (private)
   - **File size limit**: 10MB (or your preference)
6. Click **Create bucket**

#### Via SQL (Alternative):
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('session_uploads', 'session_uploads', false);
```

### 2. Set Storage Policies

Go to **Storage → Policies** and create these policies:

#### Policy 1: Allow Upload
```sql
CREATE POLICY "Authenticated users can upload session files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'session_uploads');
```

#### Policy 2: Allow Read
```sql
CREATE POLICY "Users can read session files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'session_uploads');
```

#### Policy 3: Allow Delete
```sql
CREATE POLICY "Users can delete session files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'session_uploads');
```

## File Structure

Files are organized in this structure:
```
session_uploads/
  └── sessions/
      └── {user_id}/
          └── {filename}-{timestamp}-{random}.{ext}
```

## Usage

### Basic Example

```tsx
import { FileUpload, UploadedFile } from "@/components/form/input/FileUpload";

function MyComponent() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesChange = (uploadedFiles: UploadedFile[]) => {
    setFiles(uploadedFiles);
    // Save file paths to your database
  };

  return (
    <FileUpload
      onFilesChange={handleFilesChange}
      maxFiles={5}
      folder="sessions"
    />
  );
}
```

### Integration with Forms

```tsx
import { FileUpload, UploadedFile } from "@/components/form/input/FileUpload";

function SessionForm() {
  const [formData, setFormData] = useState({
    title: "",
    notes: "",
  });
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extract file paths
    const filePaths = attachments.map(file => file.path);

    // Save to database
    await createSession({
      ...formData,
      attachments: filePaths, // Store as array of paths
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />

      <FileUpload
        onFilesChange={setAttachments}
        maxFiles={5}
        folder="sessions"
      />

      <button type="submit">Save</button>
    </form>
  );
}
```

## Component Props

### FileUpload

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesChange` | `(files: UploadedFile[]) => void` | Required | Callback when files change |
| `maxFiles` | `number` | `5` | Maximum number of files allowed |
| `folder` | `string` | `"sessions"` | Folder path in storage bucket |
| `existingFiles` | `UploadedFile[]` | `[]` | Pre-populate with existing files |

### UploadedFile Type

```typescript
interface UploadedFile {
  name: string;      // Original filename
  path: string;      // Full path in storage
  publicUrl: string; // URL to access the file
  size: number;      // File size in bytes
}
```

## File Validation

### Allowed File Types
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- Text (`.txt`, `.csv`, `.md`)
- RTF (`.rtf`)

### Size Limit
- Maximum: 10MB per file

### Validation Rules
The component automatically validates:
- File type
- File size
- Maximum number of files

## Server Actions

### Upload File
```typescript
import { uploadFile } from "@/actions/storage";

const result = await uploadFile(file, "sessions");
if (result.success) {
  console.log("File path:", result.data.path);
  console.log("Public URL:", result.data.publicUrl);
}
```

### Delete File
```typescript
import { deleteFile } from "@/actions/storage";

await deleteFile("sessions/user-id/filename.pdf");
```

### Get Signed URL (for private files)
```typescript
import { getSignedUrl } from "@/actions/storage";

const result = await getSignedUrl("sessions/user-id/filename.pdf");
if (result.success) {
  console.log("Signed URL:", result.data.signedUrl);
}
```

## Database Schema

To store file paths with sessions, add a column to your `sessions` table:

```sql
ALTER TABLE sessions
ADD COLUMN attachments TEXT[];
```

Or use JSONB for more metadata:

```sql
ALTER TABLE sessions
ADD COLUMN attachments JSONB;
```

Example JSONB structure:
```json
[
  {
    "name": "homework.pdf",
    "path": "sessions/user-id/homework-123.pdf",
    "size": 1024000
  }
]
```

## Utility Functions

Available in `/utils/fileUpload.ts`:

### `validateFile(file: File)`
Validates file type and size.

### `formatFileSize(bytes: number)`
Formats bytes to human-readable string (e.g., "2.5 MB").

### `getFileTypeInfo(filename: string)`
Returns icon and color for file type.

## Troubleshooting

### "User not authenticated"
- Ensure user is logged in
- Check Supabase auth session

### "Upload failed"
- Check bucket exists and is named `session_uploads`
- Verify storage policies are set correctly
- Check file size is under 10MB

### "File type not allowed"
- Verify file has correct extension
- Check MIME type matches allowed types

### Files not visible
- Check if bucket is private (use signed URLs)
- Verify user has read permissions

## Security Notes

1. **Private Bucket**: Files are not publicly accessible without authentication
2. **User Isolation**: Files are organized by user ID
3. **Signed URLs**: Use `getSignedUrl()` for temporary access to private files
4. **File Validation**: Client and server-side validation prevents malicious uploads

## Next Steps

To integrate with your session modals:
1. Add `attachments` column to sessions table
2. Update session types to include attachments
3. Add FileUpload component to AddSessionModal and EditSessionModal
4. Save file paths when creating/updating sessions
