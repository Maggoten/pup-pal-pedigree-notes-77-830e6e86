
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useLitterFilters } from './LitterFilterProvider';
import LitterSearchForm from './LitterSearchForm';
import YearFilterDropdown from './YearFilterDropdown';
import ViewToggle from './ViewToggle';
import AddLitterDialog from './AddLitterDialog';
import { PlannedLitter, Litter } from '@/types/breeding';

interface LitterFilterControlsProps {
  showAddLitterDialog: boolean;
  setShowAddLitterDialog: (show: boolean) => void;
  onAddLitter: (litter: Litter) => void;
  plannedLitters: PlannedLitter[];
  availableYears: number[];
}

const LitterFilterControls: React.FC<LitterFilterControlsProps> = ({
  showAddLitterDialog,
  setShowAddLitterDialog,
  onAddLitter,
  plannedLitters,
  availableYears
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    filterYear, 
    setFilterYear,
    view,
    setView
  } = useLitterFilters();

  return (
    <div className="flex items-center gap-2 self-end">
      <LitterSearchForm 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <YearFilterDropdown
        years={availableYears}
        selectedYear={filterYear}
        onYearChange={setFilterYear}
      />
      
      <ViewToggle 
        view={view}
        onViewChange={setView}
      />
      
      <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 ml-2">
            <PlusCircle className="h-4 w-4" />
            Add New Litter
          </Button>
        </DialogTrigger>
        <AddLitterDialog 
          onClose={() => setShowAddLitterDialog(false)} 
          onSubmit={onAddLitter}
          plannedLitters={plannedLitters}
        />
      </Dialog>
    </div>
  );
};

export default LitterFilterControls;
