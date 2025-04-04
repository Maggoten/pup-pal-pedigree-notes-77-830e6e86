
import React, { useState } from 'react';
import { Litter } from '@/types/breeding';
import { Button } from '@/components/ui/button';
import LitterSearchForm from './LitterSearchForm';
import YearFilterDropdown from './YearFilterDropdown';
import ViewToggle from './ViewToggle';
import LitterGridView from './LitterGridView';
import LitterListView from './LitterListView';
import LitterPagination from './LitterPagination';
import EmptyLitterState from './EmptyLitterState';
import { useLitterFilters } from './LitterFilterProvider';

interface LitterTabContentProps {
  litters: Litter[];
  filteredLitters: Litter[];
  paginatedLitters: Litter[];
  selectedLitterId: string | null;
  onSelectLitter: (litter: Litter) => void;
  onSelectLitterId: (litterId: string | null) => void;
  onArchive?: (litter: Litter) => void;
  onAddLitter: () => void;
  pageCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isArchived: boolean;
  searchQuery: string;
  filterYear: number | null;
}

const LitterTabContent: React.FC<LitterTabContentProps> = ({
  litters,
  filteredLitters,
  paginatedLitters,
  selectedLitterId,
  onSelectLitter,
  onSelectLitterId,
  onArchive,
  onAddLitter,
  pageCount,
  currentPage,
  setCurrentPage,
  isArchived,
  searchQuery,
  filterYear
}) => {
  const { view, setView, setSearchQuery, setFilterYear } = useLitterFilters();
  
  // Handle creating a new litter
  const handleAddLitterClick = () => {
    onAddLitter();
  };

  // Get available years for filtering
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    
    litters.forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };

  // Handle empty state
  if (litters.length === 0) {
    return (
      <EmptyLitterState onAddLitter={handleAddLitterClick} />
    );
  }
  
  // Handle filtered empty state
  if (filteredLitters.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No litters found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
        <Button variant="outline" onClick={() => onSelectLitterId(null)}>Clear Filters</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <LitterSearchForm 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex gap-2 items-center">
          <YearFilterDropdown 
            years={getAvailableYears()}
            selectedYear={filterYear}
            onYearChange={setFilterYear}
          />
          <ViewToggle 
            view={view} 
            onViewChange={setView} 
          />
        </div>
      </div>
      
      {view === 'grid' ? (
        <LitterGridView 
          litters={paginatedLitters} 
          onSelectLitter={onSelectLitter} 
          onArchive={onArchive}
          selectedLitterId={selectedLitterId}
        />
      ) : (
        <LitterListView 
          litters={paginatedLitters} 
          onSelectLitter={onSelectLitter} 
          onArchive={onArchive}
          selectedLitterId={selectedLitterId}
        />
      )}
      
      <LitterPagination
        pageCount={pageCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default LitterTabContent;
