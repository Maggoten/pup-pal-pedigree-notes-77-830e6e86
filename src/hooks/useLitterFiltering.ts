
import { useState, useMemo } from 'react';
import { Litter } from '@/types/breeding';

export const useLitterFiltering = (
  activeLitters: Litter[],
  archivedLitters: Litter[],
  getAvailableYears: () => number[]
) => {
  // Setup state for filtering and tabs
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Apply filters to active litters
  const filteredActiveLitters = useMemo(() => {
    return filterLitters(activeLitters, searchQuery, selectedYear);
  }, [activeLitters, searchQuery, selectedYear]);
  
  // Apply filters to archived litters
  const filteredArchivedLitters = useMemo(() => {
    return filterLitters(archivedLitters, searchQuery, selectedYear);
  }, [archivedLitters, searchQuery, selectedYear]);
  
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
    filteredActiveLitters, 
    filteredArchivedLitters,
    activeTab, 
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear 
  };
};

export default useLitterFiltering;
