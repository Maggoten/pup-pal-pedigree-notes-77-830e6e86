
import { useMemo } from 'react';
import { useLitterFilters } from '@/components/litters/LitterFilterProvider';
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
  
  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return !!searchQuery || filterYear !== null;
  }, [searchQuery, filterYear]);
  
  // First filter active litters based on search and year
  const filteredActiveLitters = useMemo(() => {
    if (!searchQuery && filterYear === null) {
      return activeLitters;
    }
    
    return activeLitters.filter(litter => {
      const matchesSearch = !searchQuery || 
        litter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.sireName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.damName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesYear = filterYear === null || 
        new Date(litter.dateOfBirth).getFullYear() === filterYear;
      
      return matchesSearch && matchesYear;
    });
  }, [activeLitters, searchQuery, filterYear]);
  
  // Then filter archived litters in the same way
  const filteredArchivedLitters = useMemo(() => {
    if (!searchQuery && filterYear === null) {
      return archivedLitters;
    }
    
    return archivedLitters.filter(litter => {
      const matchesSearch = !searchQuery || 
        litter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.sireName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.damName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesYear = filterYear === null || 
        new Date(litter.dateOfBirth).getFullYear() === filterYear;
      
      return matchesSearch && matchesYear;
    });
  }, [archivedLitters, searchQuery, filterYear]);
  
  // Calculate pagination for active litters
  const activePageCount = useMemo(() => {
    return Math.ceil(filteredActiveLitters.length / itemsPerPage);
  }, [filteredActiveLitters.length, itemsPerPage]);
  
  // Calculate pagination for archived litters
  const archivedPageCount = useMemo(() => {
    return Math.ceil(filteredArchivedLitters.length / itemsPerPage);
  }, [filteredArchivedLitters.length, itemsPerPage]);
  
  // Get paginated active litters
  const paginatedActiveLitters = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredActiveLitters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActiveLitters, activePage, itemsPerPage]);
  
  // Get paginated archived litters
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

export default useLitterFilteredData;
