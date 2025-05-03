
import { useState, useEffect, useCallback } from 'react';
import { Litter } from '@/types/breeding';

interface UseVirtualizationOptions {
  itemsPerPage?: number;
  initialVisibleCount?: number;
}

export const useVirtualization = (
  litters: Litter[],
  { itemsPerPage = 12, initialVisibleCount = 12 }: UseVirtualizationOptions = {}
) => {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Calculate how many items should be visible
  const visibleLitters = litters.slice(0, visibleCount);
  const hasMore = litters.length > visibleCount;
  
  // Function to load more items
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // Use setTimeout to simulate asynchronous loading and prevent UI blocking
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + itemsPerPage, litters.length));
      setLoadingMore(false);
    }, 100);
  }, [loadingMore, hasMore, litters.length, itemsPerPage]);
  
  // Setup scroll listener for infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore]);
  
  return {
    visibleLitters,
    hasMore,
    loadingMore,
    loadMore
  };
};
