
import React from 'react';
import { CategoryTabsList, CategoryTabsTrigger } from '@/components/ui/tabs';
import { PlannedLitter } from '@/types/breeding';
import LitterFilterControls from '../LitterFilterControls';

interface LitterFilterHeaderProps {
  activeLitters: any[];
  archivedLitters: any[];
  categoryTab: string;
  setCategoryTab: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  onAddLitterClick: () => void;
  availableYears: number[];
}

const LitterFilterHeader: React.FC<LitterFilterHeaderProps> = ({
  activeLitters,
  archivedLitters,
  categoryTab,
  setCategoryTab,
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  onAddLitterClick,
  availableYears
}) => {
  return (
    <div className="space-y-6">
      <CategoryTabsList className="w-full border-b mb-6">
        <CategoryTabsTrigger value="active" onClick={() => setCategoryTab('active')} className="relative">
          Active Litters
          {activeLitters.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
              {activeLitters.length}
            </span>
          )}
        </CategoryTabsTrigger>
        <CategoryTabsTrigger value="archived" onClick={() => setCategoryTab('archived')} className="relative">
          Archived Litters
          {archivedLitters.length > 0 && (
            <span className="ml-2 bg-muted text-muted-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
              {archivedLitters.length}
            </span>
          )}
        </CategoryTabsTrigger>
      </CategoryTabsList>
      
      <LitterFilterControls
        hasLitters={activeLitters.length > 0 || archivedLitters.length > 0}
        onAddLitterClick={onAddLitterClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        availableYears={availableYears}
      />
    </div>
  );
};

export default LitterFilterHeader;
