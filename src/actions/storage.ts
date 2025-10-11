"use server";

import { createClient } from "@/utils/supabase/server";
import { STORAGE_BUCKET, UploadResult } from "@/types/storage";

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  folder: string = "sessions"
): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    const uniqueFileName = `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
    const filePath = `${folder}/${user.id}/${uniqueFileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // For private buckets, we'll just store the path
    // Public URLs won't work for private buckets
    // We'll generate signed URLs when needed
    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: "", // Not used for private buckets
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a signed URL for a private file (valid for 1 hour)
 */
export async function getSignedUrl(filePath: string): Promise<{
  success: boolean;
  data?: { signedUrl: string };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 3600); // 1 hour

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: { signedUrl: data.signedUrl },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string): Promise<{
  success: boolean;
  data?: Array<{ name: string; id: string; created_at: string }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
