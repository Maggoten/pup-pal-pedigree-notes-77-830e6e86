
import { useState, useMemo } from 'react';
import { Litter } from '@/types/breeding';

export const useLitterFiltering = (
  litters: Litter[],
  searchQuery: string,
  filterYear: number | null,
  currentPage: number,
  itemsPerPage: number
) => {
  // Filter litters by year
  const filterLittersByYear = (litters: Litter[]) => {
    if (!filterYear) return litters;
    
    return litters.filter(litter => {
      const birthDate = new Date(litter.dateOfBirth);
      return birthDate.getFullYear() === filterYear;
    });
  };
  
  // Search litters by name, sire, or dam
  const searchLitters = (litters: Litter[]) => {
    if (!searchQuery.trim()) return litters;
    
    const searchTermLower = searchQuery.toLowerCase();
    return litters.filter(litter => (
      litter.name.toLowerCase().includes(searchTermLower) ||
      litter.sireName.toLowerCase().includes(searchTermLower) ||
      litter.damName.toLowerCase().includes(searchTermLower)
    ));
  };
  
  // Combine filtering and searching
  const filteredLitters = useMemo(() => {
    return searchLitters(filterLittersByYear(litters));
  }, [litters, searchQuery, filterYear]);
  
  // Calculate pagination
  const paginatedLitters = useMemo(() => {
    return filteredLitters.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    );
  }, [filteredLitters, currentPage, itemsPerPage]);
  
  const pageCount = Math.ceil(filteredLitters.length / itemsPerPage);
  
  return {
    filteredLitters,
    paginatedLitters,
    pageCount
  };
};

export default useLitterFiltering;
