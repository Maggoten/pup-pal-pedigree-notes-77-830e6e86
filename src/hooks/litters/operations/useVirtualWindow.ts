
import { useState, useCallback } from 'react';
import { Litter } from '@/types/breeding';

export interface UseVirtualWindowOptions {
  itemsPerPage?: number;
  onLoadMore?: () => void;
}

export const useVirtualWindow = (
  litters: Litter[],
  { itemsPerPage = 20, onLoadMore }: UseVirtualWindowOptions = {}
) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  
  // Function to load more items
  const loadMore = useCallback(() => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    
    // If an external onLoadMore function is provided, use that
    if (onLoadMore) {
      onLoadMore();
      setLoadingMore(false);
    } else {
      // This timeout simulates the time it takes to load more items
      // In a real implementation with a windowing library, this would be handled differently
      setTimeout(() => {
        setLoadingMore(false);
      }, 100);
    }
  }, [loadingMore, onLoadMore]);
  
  return {
    visibleLitters: litters, // In a real implementation with react-window, this would be the virtualized subset
    loadingMore,
    hasMore,
    loadMore
  };
};

export default useVirtualWindow;
