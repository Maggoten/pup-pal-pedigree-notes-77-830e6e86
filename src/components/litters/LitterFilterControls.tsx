
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import YearFilterDropdown from './YearFilterDropdown';

interface LitterFilterControlsProps {
  onAddLitterClick: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  availableYears: number[];
  hasLitters?: boolean;
}

const LitterFilterControls: React.FC<LitterFilterControlsProps> = ({
  hasLitters,
  onAddLitterClick,
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  availableYears
}) => {
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2 flex-grow">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by name, sire or dam..."
            className="pl-9 bg-white dark:bg-gray-800"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <YearFilterDropdown
          years={availableYears}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      </div>
      
      <Button 
        onClick={onAddLitterClick}
        className="whitespace-nowrap flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Litter
      </Button>
    </div>
  );
};

export default LitterFilterControls;
