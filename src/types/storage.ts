export const STORAGE_BUCKET = "session_uploads";

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    publicUrl: string;
  };
  error?: string;
}
