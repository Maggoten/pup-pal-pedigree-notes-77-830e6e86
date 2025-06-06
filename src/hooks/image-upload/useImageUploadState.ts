
import { useState, useCallback } from 'react';

type UploadState = {
  isUploading: boolean;
  uploadRetryCount: number;
  lastError: string | null;
};

type UploadStateActions = {
  startUpload: () => void;
  completeUpload: () => void;
  setError: (error: string) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
};

export const useImageUploadState = (): [UploadState, UploadStateActions] => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadRetryCount, setUploadRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const startUpload = useCallback(() => {
    console.log('Starting upload process');
    setIsUploading(true);
    setLastError(null);
  }, []);

  const completeUpload = useCallback(() => {
    console.log('Upload process complete');
    setIsUploading(false);
  }, []);

  const setError = useCallback((error: string) => {
    console.error('Upload error:', error);
    setLastError(error);
  }, []);

  const incrementRetryCount = useCallback(() => {
    setUploadRetryCount(prev => {
      const newCount = prev + 1;
      console.log(`Incremented upload retry count: ${prev} -> ${newCount}`);
      return newCount;
    });
  }, []);

  const resetRetryCount = useCallback(() => {
    console.log('Reset upload retry count to 0');
    setUploadRetryCount(0);
  }, []);

  return [
    { isUploading, uploadRetryCount, lastError },
    { startUpload, completeUpload, setError, incrementRetryCount, resetRetryCount }
  ];
};
