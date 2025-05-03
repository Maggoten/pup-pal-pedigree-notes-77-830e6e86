
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
    return litters.filter(litter => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        litter.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        litter.sireName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        litter.damName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by year
      const matchesYear = !selectedYear || 
        new Date(litter.dateOfBirth).getFullYear() === selectedYear;
      
      return matchesSearch && matchesYear;
    });
  }, [litters, searchQuery, selectedYear]);
  
  return { 
    filteredLitters,
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear 
  };
};

export default useLitterFiltering;
