/**
 * File upload utilities for Supabase Storage
 */

// Allowed file types for session uploads
export const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  // Text files
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/markdown': ['.md'],
  // Other
  'application/rtf': ['.rtf'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file before upload
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  const allowedTypes = Object.keys(ALLOWED_FILE_TYPES);
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload PDF, Word, Excel, or text files.',
    };
  }

  return { valid: true };
}

/**
 * Generate a unique file name to avoid conflicts
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

  // Sanitize the filename
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${sanitized}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension icon/color
 */
export function getFileTypeInfo(filename: string): { icon: string; color: string } {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return { icon: '📄', color: 'text-red-600' };
    case 'doc':
    case 'docx':
      return { icon: '📝', color: 'text-blue-600' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { icon: '📊', color: 'text-green-600' };
    case 'txt':
    case 'md':
      return { icon: '📃', color: 'text-gray-600' };
    default:
      return { icon: '📎', color: 'text-gray-600' };
  }
}
