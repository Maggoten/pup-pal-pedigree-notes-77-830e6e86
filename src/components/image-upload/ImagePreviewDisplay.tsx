
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImagePreviewDisplayProps {
  imageUrl: string | undefined;
  altText?: string;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ 
  imageUrl, 
  altText = "Image preview" 
}) => {
  // Use placeholder if no image URL provided
  const placeholderUrl = '/placeholder.svg';
  const displayUrl = imageUrl || placeholderUrl;
  const isPlaceholder = !imageUrl || imageUrl === placeholderUrl;
  
  return (
    <div className="rounded-md overflow-hidden border bg-background">
      <AspectRatio ratio={1/1} className="bg-muted">
        {isPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        ) : (
          <img 
            src={displayUrl} 
            alt={altText} 
            className="h-full w-full object-cover"
            onError={(e) => {
              console.error('Image failed to load:', displayUrl);
              (e.target as HTMLImageElement).src = placeholderUrl;
            }}
          />
        )}
      </AspectRatio>
    </div>
  );
};

export default ImagePreviewDisplay;
