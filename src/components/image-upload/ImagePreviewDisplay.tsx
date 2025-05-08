
import React, { useState } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { isSafari } from '@/utils/storage/config';

interface ImagePreviewDisplayProps {
  imageUrl?: string;
  className?: string;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ 
  imageUrl,
  className = ''
}) => {
  // Define this as a constant to ensure we're not accidentally modifying the file path
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const [loadError, setLoadError] = useState(false);
  
  // Determine which image to show (provided image or placeholder)
  const imageSrc = imageUrl || PLACEHOLDER_IMAGE_PATH;
  const isPlaceholder = !imageUrl || imageUrl === PLACEHOLDER_IMAGE_PATH;

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.error('Image failed to load:', target.src);
    setLoadError(true);
    
    if (target.src !== PLACEHOLDER_IMAGE_PATH) {
      console.log('Falling back to placeholder');
      target.src = PLACEHOLDER_IMAGE_PATH;
    }
  };

  // For Safari, add cache busting parameter
  const getImageSrc = () => {
    if (isPlaceholder) return PLACEHOLDER_IMAGE_PATH;
    
    // Add cache busting for Safari to prevent stale cached images
    if (isSafari() && imageUrl) {
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}_t=${Date.now()}`;
    }
    
    return imageUrl;
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-border ${className}`}>
      <AspectRatio ratio={1/1}>
        <img 
          src={getImageSrc()} 
          alt="Image preview" 
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
