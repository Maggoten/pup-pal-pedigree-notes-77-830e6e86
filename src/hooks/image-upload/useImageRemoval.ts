
import { toast } from '@/hooks/use-toast';
import { removeFromStorage } from '@/utils/storage';
import { isValidPublicUrl } from '@/utils/storage';

export const useImageRemoval = (onImageChange: (url: string) => void) => {
  const removeImage = async (imageUrl: string, userId: string) => {
    if (!imageUrl || !userId || !isValidPublicUrl(imageUrl)) {
      console.error('[ImageRemoval] Invalid parameters for image removal', { imageUrl, userId });
      return false;
    }

    try {
      console.log('[ImageRemoval] Removing image:', imageUrl);
      
      // Extract path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const result = await removeFromStorage(`${userId}/${fileName}`);
      
      if (result && 'error' in result && result.error) {
        console.error('[ImageRemoval] Error removing image:', result.error);
        toast({
          title: 'Error removing image',
          description: 'The image could not be removed from storage.',
          variant: 'destructive'
        });
        return false;
      }
      
      // Clear the image URL in the form
      onImageChange('');
      return true;
      
    } catch (error) {
      console.error('[ImageRemoval] Error removing image:', error);
      toast({
        title: 'Error removing image',
        description: 'The image could not be removed from storage.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return { removeImage };
};
