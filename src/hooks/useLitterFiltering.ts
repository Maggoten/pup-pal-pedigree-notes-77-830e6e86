
import { useState, useMemo } from 'react';
import { Litter } from '@/types/breeding';

export const useLitterFiltering = (
  litters: Litter[],
  getAvailableYears: () => number[]
) => {
  // Setup state for filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Apply filters to litters
  const filteredLitters = useMemo(() => {
    return filterLitters(litters, searchQuery, selectedYear);
  }, [litters, searchQuery, selectedYear]);
  
  // Helper function to filter litters
  const filterLitters = (litters: Litter[], query: string, year: number | null): Litter[] => {
    return litters.filter(litter => {
      // Filter by search query
      const matchesSearch = !query || 
        litter.name.toLowerCase().includes(query.toLowerCase()) || 
        litter.sireName.toLowerCase().includes(query.toLowerCase()) || 
        litter.damName.toLowerCase().includes(query.toLowerCase());
      
      // Filter by year
      const matchesYear = !year || 
        new Date(litter.dateOfBirth).getFullYear() === year;
      
      return matchesSearch && matchesYear;
    });
  };
  
  return { 
    filteredLitters,
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear 
  };
};

export default useLitterFiltering;
