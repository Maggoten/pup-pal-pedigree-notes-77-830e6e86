
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
  
  // Determine which image to show (provided image or placeholder)
  const imageSrc = imageUrl || PLACEHOLDER_IMAGE_PATH;
  const isPlaceholder = !imageUrl || imageUrl === PLACEHOLDER_IMAGE_PATH;

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== PLACEHOLDER_IMAGE_PATH) {
      console.error('Image failed to load, falling back to placeholder:', target.src);
      target.src = PLACEHOLDER_IMAGE_PATH;
    }
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-border ${className}`}>
      <AspectRatio ratio={1/1}>
        <img 
          src={imageSrc} 
          alt="Image preview" 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
        {isPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ImagePreviewDisplay;
