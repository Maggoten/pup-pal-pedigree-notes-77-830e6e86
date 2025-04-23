
import React from 'react';
import { ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border">
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
    </div>
  );
};

export default ImagePreview;
