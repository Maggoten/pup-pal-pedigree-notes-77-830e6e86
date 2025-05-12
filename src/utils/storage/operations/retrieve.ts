import { supabase } from '@/integrations/supabase/client';

export async function getPublicUrl(bucket: string, filePath: string): Promise<string | null> {
  try {
    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return data?.publicUrl || null;
  } catch (error) {
    console.error("[Storage] Error getting public URL:", error);
    return null;
  }
}

export async function getSignedUrl(bucket: string, filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60); // Add second parameter for expiry (1 hour)
    
    if (error) {
      console.error("[Storage] Error creating signed URL:", error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error("[Storage] Error getting signed URL:", error);
    return null;
  }
}
