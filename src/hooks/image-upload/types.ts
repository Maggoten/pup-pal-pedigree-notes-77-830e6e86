
export interface UseImageUploadProps {
  user_id: string | null | undefined;
  onImageChange: (url: string) => void;
  onImageSaved?: (url: string) => Promise<void>;
}

export interface UploadResult {
  data?: {
    path?: string;
  };
  error?: any;
}

export interface PuppyImageUploaderProps {
  puppyId: string;
  litterId: string;
  puppyName: string;
  currentImage?: string;
  onImageChange: (newImageUrl: string) => void;
  large?: boolean;
}
