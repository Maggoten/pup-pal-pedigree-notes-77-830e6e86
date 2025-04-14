
import { toast } from '@/components/ui/use-toast';
import { uploadDogImage } from '@/services/dogs';

export const uploadImage = async (file: File, dogId: string) => {
  try {
    const imageUrl = await uploadDogImage(file, dogId);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast({
      title: "Error",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};
