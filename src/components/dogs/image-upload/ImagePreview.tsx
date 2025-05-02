
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImagePreviewProps {
  imageUrl: string | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border">
      <AspectRatio ratio={1/1}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Dog preview" 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ImagePreview;
