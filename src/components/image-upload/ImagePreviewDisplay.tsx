
import React, { useState } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImagePreviewDisplayProps {
  imageUrl: string | undefined | null;
  onError?: () => void;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ 
  imageUrl,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(!!imageUrl);
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    console.error('Image loading error:', imageUrl);
    setIsLoading(false);
    if (onError) onError();
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border">
      <AspectRatio ratio={1/1}>
        {imageUrl && imageUrl !== PLACEHOLDER_IMAGE_PATH ? (
          <>
            <img 
              src={imageUrl} 
              alt="Preview" 
              className={`h-full w-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/60" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ImagePreviewDisplay;
