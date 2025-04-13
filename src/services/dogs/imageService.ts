import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Upload dog image from a base64 string
export const uploadDogImageFromBase64 = async (base64Image: string, dogId: string): Promise<string | null> => {
  try {
    // Skip if no image provided
    if (!base64Image || base64Image === '') {
      return null;
    }

    // Extract the file data from the base64 string
    const [meta, data] = base64Image.split(',');
    const contentType = meta.split(':')[1].split(';')[0];
    const fileExt = contentType.split('/')[1];
    const fileName = `${dogId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert base64 to Blob
    const byteCharacters = atob(data);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: contentType });

    // Upload the blob
    const { data: uploadData, error } = await supabase.storage
      .from('dog_images')
      .upload(filePath, blob, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('dog_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
};

// Upload dog image from a File object (keep for backward compatibility)
export const uploadDogImage = async (file: File, dogId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${dogId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('dog_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('dog_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
};
