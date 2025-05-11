
import { useState } from 'react';

type ImageUploadState = {
  isUploading: boolean;
  uploadRetryCount: number;
  lastError: string | null;
  isUploadActive: boolean;
};

type ImageUploadActions = {
  startUpload: () => void;
  completeUpload: () => void;
  setError: (message: string) => void;
  resetRetryCount: () => void;
  setUploadActive: (active: boolean) => void;
};

/**
 * Hook to manage the state of image uploads
 */
export const useImageUploadState = (): [
  ImageUploadState,
  ImageUploadActions
] => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadRetryCount, setUploadRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isUploadActive, setIsUploadActive] = useState(false);

  const startUpload = () => {
    setIsUploading(true);
    setIsUploadActive(true);
    setLastError(null);
  };

  const completeUpload = () => {
    setIsUploading(false);
  };

  const setError = (message: string) => {
    setLastError(message);
    setUploadRetryCount(prev => prev + 1);
  };

  const resetRetryCount = () => {
    setUploadRetryCount(0);
  };

  return [
    { isUploading, uploadRetryCount, lastError, isUploadActive },
    { startUpload, completeUpload, setError, resetRetryCount, setUploadActive: setIsUploadActive }
  ];
};
