
import { useMemo, useCallback } from 'react';
import { Litter } from '@/types/breeding';

// This hook encapsulates all the filtering and pagination logic
// to avoid recalculating these values on every render
const useLitterFilteredData = (activeLitters: Litter[], archivedLitters: Litter[]) => {
  const { 
    searchQuery, 
    filterYear, 
    activePage,
    archivedPage,
    itemsPerPage 
  } = useLitterFilters();
  
  // Check if any filter is active - memoized to prevent recomputation
  const isFilterActive = useMemo(() => {
    return !!searchQuery || filterYear !== null;
  }, [searchQuery, filterYear]);
  
  // Create a memoized filter function to improve performance
  const filterLitter = useCallback((litter: Litter) => {
    // If no filters are active, return true (include all litters)
    if (!searchQuery && filterYear === null) {
      return true;
    }
    
    const matchesSearch = !searchQuery || 
      litter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      litter.sireName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      litter.damName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = filterYear === null || 
      new Date(litter.dateOfBirth).getFullYear() === filterYear;
    
    return matchesSearch && matchesYear;
  }, [searchQuery, filterYear]);
  
  // Filter active litters - memoized to prevent recomputation
  const filteredActiveLitters = useMemo(() => {
    return activeLitters.filter(filterLitter);
  }, [activeLitters, filterLitter]);
  
  // Filter archived litters - memoized to prevent recomputation
  const filteredArchivedLitters = useMemo(() => {
    return archivedLitters.filter(filterLitter);
  }, [archivedLitters, filterLitter]);
  
  // Calculate pagination for active litters - memoized
  const activePageCount = useMemo(() => {
    return Math.ceil(filteredActiveLitters.length / itemsPerPage);
  }, [filteredActiveLitters.length, itemsPerPage]);
  
  // Calculate pagination for archived litters - memoized
  const archivedPageCount = useMemo(() => {
    return Math.ceil(filteredArchivedLitters.length / itemsPerPage);
  }, [filteredArchivedLitters.length, itemsPerPage]);
  
  // Get paginated active litters - memoized
  const paginatedActiveLitters = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredActiveLitters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActiveLitters, activePage, itemsPerPage]);
  
  // Get paginated archived litters - memoized
  const paginatedArchivedLitters = useMemo(() => {
    const startIndex = (archivedPage - 1) * itemsPerPage;
    return filteredArchivedLitters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredArchivedLitters, archivedPage, itemsPerPage]);
  
  // Return all calculated values
  return {
    filteredActiveLitters,
    paginatedActiveLitters,
    activePageCount,
    filteredArchivedLitters,
    paginatedArchivedLitters,
    archivedPageCount,
    isFilterActive
  };
};

// Fix missing import
import { useLitterFilters } from '@/components/litters/LitterFilterProvider';

export default useLitterFilteredData;
