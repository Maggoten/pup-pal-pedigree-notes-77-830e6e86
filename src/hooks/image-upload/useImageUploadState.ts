
import { useState } from 'react';
import { useUploadTimeout } from '@/hooks/useUploadTimeout';
import { ImageUploadState } from './types';

export const useImageUploadState = (): [
  ImageUploadState, 
  {
    startUpload: () => void,
    completeUpload: () => void,
    setError: (error: string | null) => void,
    resetRetryCount: () => void,
    incrementRetryCount: () => number
  }
] => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadRetryCount, setUploadRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const { startTimeout, clearTimeout } = useUploadTimeout(() => setIsUploading(false));

  const startUpload = () => {
    setIsUploading(true);
    setLastError(null);
    startTimeout();
  };

  const completeUpload = () => {
    setIsUploading(false);
    clearTimeout();
  };

  const setError = (error: string | null) => {
    setLastError(error);
  };

  const resetRetryCount = () => {
    setUploadRetryCount(0);
  };

  const incrementRetryCount = () => {
    const newCount = uploadRetryCount + 1;
    setUploadRetryCount(newCount);
    return newCount;
  };

  return [
    { isUploading, uploadRetryCount, lastError },
    { startUpload, completeUpload, setError, resetRetryCount, incrementRetryCount }
  ];
};
