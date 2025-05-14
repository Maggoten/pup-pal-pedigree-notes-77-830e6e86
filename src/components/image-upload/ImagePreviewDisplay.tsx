
import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImagePreviewDisplayProps {
  imageUrl?: string;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ imageUrl }) => {
  const [displayUrl, setDisplayUrl] = useState<string | undefined>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !imageUrl || imageUrl === PLACEHOLDER_IMAGE_PATH;

  // Update display URL when prop changes
  useEffect(() => {
    if (imageUrl !== displayUrl) {
      setDisplayUrl(imageUrl);
      setError(false);
      
      if (imageUrl && imageUrl !== PLACEHOLDER_IMAGE_PATH) {
        setIsLoading(true);
        console.log('ImagePreviewDisplay: Loading new image URL:', 
                  imageUrl.substring(0, 50) + (imageUrl.length > 50 ? '...' : ''));
      }
    }
  }, [imageUrl, displayUrl]);

  const handleImageLoad = () => {
    console.log('ImagePreviewDisplay: Image loaded successfully');
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    console.error('ImagePreviewDisplay: Failed to load image:', 
                displayUrl?.substring(0, 50) + (displayUrl && displayUrl.length > 50 ? '...' : ''));
    setIsLoading(false);
    setError(true);
    
    // If the image fails to load and it's not a placeholder,
    // try adding a cache-busting parameter and retry
    if (displayUrl && displayUrl !== PLACEHOLDER_IMAGE_PATH && !displayUrl.includes('_cb=')) {
      console.log('ImagePreviewDisplay: Retrying with cache busting parameter');
      const cacheBustedUrl = displayUrl.includes('?') 
        ? `${displayUrl}&_cb=${Date.now()}` 
        : `${displayUrl}?_cb=${Date.now()}`;
      setDisplayUrl(cacheBustedUrl);
    }
  };

  return (
    <div className="relative aspect-square rounded-md border border-input overflow-hidden bg-background">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
        </div>
      )}
      
      {!isPlaceholder && displayUrl ? (
        <img 
          src={displayUrl}
          alt="Preview" 
          className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/50">
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
        </div>
      )}
      
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-center p-2">
            <ImageIcon className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreviewDisplay;
