
import React, { useState, useEffect } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

interface ImagePreviewDisplayProps {
  imageUrl?: string;
  className?: string;
  alt?: string;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ 
  imageUrl,
  className = '',
  alt = 'Image preview'
}) => {
  // Define this as a constant to ensure we're not accidentally modifying the file path
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const [loadError, setLoadError] = useState(false);
  const [imageAttempts, setImageAttempts] = useState(0);
  const [finalImageUrl, setFinalImageUrl] = useState<string | undefined>(imageUrl);
  const platform = getPlatformInfo();
  
  // Determine which image to show (provided image or placeholder)
  const isPlaceholder = !finalImageUrl || finalImageUrl === PLACEHOLDER_IMAGE_PATH;

  // Reset error state when URL changes
  useEffect(() => {
    setLoadError(false);
    setFinalImageUrl(imageUrl);
    setImageAttempts(0);
  }, [imageUrl]);

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.error('Image failed to load:', target.src, {
      attempts: imageAttempts + 1,
      platform: platform.device
    });
    
    // Don't retry more than twice
    if (imageAttempts < 2 && finalImageUrl && finalImageUrl !== PLACEHOLDER_IMAGE_PATH) {
      setImageAttempts(prev => prev + 1);
      
      // Add cache busting for retry
      const separator = finalImageUrl.includes('?') ? '&' : '?';
      const retryUrl = `${finalImageUrl}${separator}_retry=${Date.now()}`;
      console.log(`Retrying with URL: ${retryUrl}`);
      
      setFinalImageUrl(retryUrl);
      return;
    }
    
    setLoadError(true);
    
    if (target.src !== PLACEHOLDER_IMAGE_PATH) {
      console.log('Falling back to placeholder');
      target.src = PLACEHOLDER_IMAGE_PATH;
    }
  };

  // Get optimized image source with cache busting for mobile/Safari
  const getImageSrc = () => {
    if (isPlaceholder) return PLACEHOLDER_IMAGE_PATH;
    
    if (finalImageUrl) {
      // No need to add additional cache busting if we already have it from a retry
      if (finalImageUrl.includes('_retry=')) {
        return finalImageUrl;
      }
      
      // Add cache busting for mobile browsers to prevent stale cached images
      if (platform.mobile || platform.safari) {
        const separator = finalImageUrl.includes('?') ? '&' : '?';
        return `${finalImageUrl}${separator}_t=${Date.now()}`;
      }
    }
    
    return finalImageUrl;
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-border ${className}`}>
      <AspectRatio ratio={1/1}>
        <img 
          src={getImageSrc()} 
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
        {(isPlaceholder || loadError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            {loadError && !isPlaceholder && (
              <div className="mt-2 text-xs text-destructive flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Failed to load image</span>
              </div>
            )}
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ImagePreviewDisplay;
