
import React from 'react';
import { UploadIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ImageUploadButtonsProps {
  hasImage: boolean;
  isPlaceholder: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
  onRemoveClick: () => void;
}

const ImageUploadButtons: React.FC<ImageUploadButtonsProps> = ({
  hasImage,
  isPlaceholder,
  isUploading,
  onUploadClick,
  onRemoveClick
}) => {
  const { t } = useTranslation('dogs');
  
  return (
    <div className="mt-2 flex gap-2">
      <Button 
        type="button" 
        onClick={onUploadClick} 
        className="flex-1"
        variant="outline"
        disabled={isUploading}
      >
        <UploadIcon className="mr-2 h-4 w-4" />
        {isUploading ? t('form.imageUpload.uploading') : (hasImage && !isPlaceholder ? t('form.imageUpload.change') : t('form.imageUpload.upload'))}
      </Button>
      
      {hasImage && !isPlaceholder && (
        <Button 
          type="button"
          variant="outline"
          onClick={onRemoveClick}
          size="icon"
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ImageUploadButtons;
