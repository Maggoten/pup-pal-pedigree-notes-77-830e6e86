
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Upload dog image from a base64 string
export const uploadDogImageFromBase64 = async (base64Image: string, dogId: string): Promise<string> => {
  try {
    // Skip if no image provided
    if (!base64Image || base64Image === '') {
      throw new Error("No image provided");
    }

    // Extract the file data from the base64 string
    const [meta, data] = base64Image.split(',');
    if (!meta || !data) {
      throw new Error("Invalid base64 image format");
    }
    
    const contentType = meta.split(':')[1]?.split(';')[0];
    if (!contentType) {
      throw new Error("Could not determine content type");
    }
    
    const fileExt = contentType.split('/')[1];
    const fileName = `${dogId}-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert base64 to Blob
    const byteCharacters = atob(data);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: contentType });

    // Make sure the bucket exists
    try {
      const { data: bucketData } = await supabase.storage.getBucket('dog_images');
      if (!bucketData) {
        // Create the bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('dog_images', {
          public: true
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          throw new Error(`Failed to create storage bucket: ${createBucketError.message}`);
        }
      }
    } catch (bucketError) {
      console.error('Error checking bucket:', bucketError);
      // Proceed anyway, the bucket might exist
    }

    // Upload the blob
    const { data: uploadData, error } = await supabase.storage
      .from('dog_images')
      .upload(filePath, blob, {
        contentType,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('dog_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    throw error;
  }
};

// Upload dog image from a File object
export const uploadDogImage = async (file: File, dogId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${dogId}-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('dog_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('dog_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    throw error;
  }
};
