
import React from 'react';
import { ImageIcon } from 'lucide-react';

interface ImagePreviewDisplayProps {
  imageUrl: string | undefined;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ imageUrl }) => {
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !imageUrl || imageUrl === PLACEHOLDER_IMAGE_PATH;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== PLACEHOLDER_IMAGE_PATH) {
      target.src = PLACEHOLDER_IMAGE_PATH;
    }
  };

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
};

export default ImagePreviewDisplay;
