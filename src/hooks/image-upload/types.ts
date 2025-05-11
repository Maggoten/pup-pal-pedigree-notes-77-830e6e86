
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
