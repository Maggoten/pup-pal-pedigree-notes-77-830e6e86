
import { useMemo, useCallback } from 'react';
import { Litter } from '@/types/breeding';
import { useLitterFilter } from '@/components/litters/LitterFilterProvider';

// Updated hook to work with unified litter filtering
const useLitterFilteredData = (allLitters: Litter[]) => {
  const { 
    searchQuery, 
    selectedYear: filterYear, 
    statusFilter,
    currentPage,
    itemsPerPage 
  } = useLitterFilter();
  
  // Check if any filter is active - memoized to prevent recomputation
  const isFilterActive = useMemo(() => {
    return !!searchQuery || filterYear !== null || statusFilter !== 'all';
  }, [searchQuery, filterYear, statusFilter]);
  
  // Create a memoized filter function to improve performance
  const filterLitter = useCallback((litter: Litter) => {
    // Status filter
    if (statusFilter === 'active' && litter.archived) return false;
    if (statusFilter === 'archived' && !litter.archived) return false;
    
    // Search filter
    if (searchQuery) {
      const matchesSearch = 
        litter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.sireName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.damName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    // Year filter
    if (filterYear !== null) {
      const matchesYear = new Date(litter.dateOfBirth).getFullYear() === filterYear;
      if (!matchesYear) return false;
    }
    
    return true;
  }, [searchQuery, filterYear, statusFilter]);
  
  // Filter litters - memoized to prevent recomputation
  const filteredLitters = useMemo(() => {
    return allLitters.filter(filterLitter);
  }, [allLitters, filterLitter]);
  
  // Calculate pagination - memoized
  const pageCount = useMemo(() => {
    return Math.ceil(filteredLitters.length / itemsPerPage);
  }, [filteredLitters.length, itemsPerPage]);
  
  // Get paginated litters - memoized
  const paginatedLitters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLitters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLitters, currentPage, itemsPerPage]);
  
  // Return all calculated values
  return {
    filteredLitters,
    paginatedLitters,
    pageCount,
    isFilterActive
  };
};

export default useLitterFilteredData;
