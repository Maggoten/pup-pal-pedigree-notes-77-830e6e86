
import { useMemo } from 'react';
import { Litter } from '@/types/breeding';

export const useLitterFiltering = (
  litters: Litter[],
  searchQuery: string,
  filterYear: number | null,
  currentPage: number,
  itemsPerPage: number
) => {
  // Filter litters by year, memoized to prevent recomputation
  const filteredByYear = useMemo(() => {
    if (!filterYear) return litters;
    
    return litters.filter(litter => {
      const birthDate = new Date(litter.dateOfBirth);
      return birthDate.getFullYear() === filterYear;
    });
  }, [litters, filterYear]);
  
  // Search litters by name, sire, or dam, memoized to prevent recomputation
  const filteredLitters = useMemo(() => {
    if (!searchQuery.trim()) return filteredByYear;
    
    const searchTermLower = searchQuery.toLowerCase();
    return filteredByYear.filter(litter => (
      litter.name.toLowerCase().includes(searchTermLower) ||
      litter.sireName.toLowerCase().includes(searchTermLower) ||
      litter.damName.toLowerCase().includes(searchTermLower)
    ));
  }, [filteredByYear, searchQuery]);
  
  // Calculate pagination, memoized to prevent recomputation
  const paginatedLitters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLitters.slice(startIndex, endIndex);
  }, [filteredLitters, currentPage, itemsPerPage]);
  
  // Calculate total number of pages, memoized to prevent recomputation
  const pageCount = useMemo(() => 
    Math.ceil(filteredLitters.length / itemsPerPage),
  [filteredLitters.length, itemsPerPage]);
  
  return {
    filteredLitters,
    paginatedLitters,
    pageCount
  };
};

export default useLitterFiltering;
