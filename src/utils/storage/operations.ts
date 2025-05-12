
import { supabase } from "@/integrations/supabase/client";
import { fetchWithRetry } from "../fetchUtils";

interface StorageObject {
  name: string;
  bucket_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    cacheControl: string;
    contentLength: number;
    contentType: string;
    etag: string;
    httpStatusCode: number;
    size: number;
  };
  id: string;
}

/**
 * Fetches a storage object from Supabase storage with retry logic.
 * @param bucketName The name of the bucket.
 * @param path The path to the object in the bucket.
 * @returns The storage object or null if an error occurs.
 */
export async function fetchStorageObject(
  bucketName: string, 
  path: string
): Promise<StorageObject | null> {
  try {
    const result = await fetchWithRetry(
      () => supabase.storage.from(bucketName).download(path),
      {
        maxRetries: 2,
        initialDelay: 1000,
        onRetry: (attempt) => {
          console.log(`[Storage] Retry ${attempt} for ${path}`);
        }
      }
    );

    if (result.error) {
      console.error("[Storage] Error fetching storage object:", result.error);
      return null;
    }

    if (!result.data) {
      console.warn("[Storage] No data returned for storage object:", path);
      return null;
    }

    return {
      name: path,
      bucket_id: bucketName,
      owner: 'unknown', // The owner is not directly returned by the download method
      created_at: new Date().toISOString(), // Creation date is not directly returned
      updated_at: new Date().toISOString(), // Update date is not directly returned
      last_accessed_at: new Date().toISOString(), // Last accessed is not directly returned
      metadata: {
        cacheControl: '',
        contentLength: result.data.size,
        contentType: result.data.type,
        etag: '',
        httpStatusCode: 200,
        size: result.data.size,
      },
      id: 'unknown', // The ID is not directly returned by the download method
    };
  } catch (error) {
    console.error("[Storage] Error fetching storage object:", error);
    return null;
  }
}
