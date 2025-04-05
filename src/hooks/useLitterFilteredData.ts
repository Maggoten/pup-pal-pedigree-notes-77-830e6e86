
import { useState, useEffect } from 'react';
import { Litter } from '@/types/breeding';
import useLitterFiltering from './useLitterFiltering';
import { useLitterFilters } from '@/components/litters/LitterFilterProvider';

const ITEMS_PER_PAGE = 12;

export const useLitterFilteredData = (activeLitters: Litter[], archivedLitters: Litter[]) => {
  const { 
    searchQuery,
    filterYear,
    categoryTab,
    activePage,
    archivedPage,
    setActivePage,
    setArchivedPage
  } = useLitterFilters();

  // Filter and paginate active litters
  const {
    filteredLitters: filteredActiveLitters,
    paginatedLitters: paginatedActiveLitters,
    pageCount: activePageCount
  } = useLitterFiltering(activeLitters, searchQuery, filterYear, activePage, ITEMS_PER_PAGE);
  
  // Filter and paginate archived litters
  const {
    filteredLitters: filteredArchivedLitters,
    paginatedLitters: paginatedArchivedLitters,
    pageCount: archivedPageCount
  } = useLitterFiltering(archivedLitters, searchQuery, filterYear, archivedPage, ITEMS_PER_PAGE);

  // Reset pagination when filters change
  useEffect(() => {
    setActivePage(1);
    setArchivedPage(1);
  }, [searchQuery, filterYear, setActivePage, setArchivedPage]);

  const isFilterActive = !!searchQuery || !!filterYear;

  const handleClearFilter = () => {
    // This function will be passed to components that need to clear filters
    return {
      searchQuery: '',
      filterYear: null
    };
  };

  return {
    // Active litters data
    filteredActiveLitters,
    paginatedActiveLitters,
    activePageCount,
    
    // Archived litters data
    filteredArchivedLitters,
    paginatedArchivedLitters,
    archivedPageCount,
    
    // Filter state
    isFilterActive,
    handleClearFilter,
    
    // Current active tab
    categoryTab
  };
};

export default useLitterFilteredData;
