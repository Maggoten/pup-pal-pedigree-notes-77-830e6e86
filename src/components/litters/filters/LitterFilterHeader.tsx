
import React from 'react';
import { CategoryTabsList, CategoryTabsTrigger } from '@/components/ui/tabs';
import { PlannedLitter } from '@/types/breeding';
import LitterFilterControls from '../LitterFilterControls';

interface LitterFilterHeaderProps {
  activeLitters: any[];
  archivedLitters: any[];
  categoryTab: string;
  setCategoryTab: (value: string) => void;
  showAddLitterDialog: boolean;
  setShowAddLitterDialog: (show: boolean) => void;
  onAddLitter: (litter: any) => void;
  plannedLitters: PlannedLitter[];
  availableYears: number[];
}

const LitterFilterHeader: React.FC<LitterFilterHeaderProps> = ({
  activeLitters,
  archivedLitters,
  categoryTab,
  setCategoryTab,
  showAddLitterDialog,
  setShowAddLitterDialog,
  onAddLitter,
  plannedLitters,
  availableYears
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <CategoryTabsList>
        <CategoryTabsTrigger value="active" className="relative">
          Active Litters
          {activeLitters.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
              {activeLitters.length}
            </span>
          )}
        </CategoryTabsTrigger>
        <CategoryTabsTrigger value="archived" className="relative">
          Archived Litters
          {archivedLitters.length > 0 && (
            <span className="ml-2 bg-muted text-muted-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
              {archivedLitters.length}
            </span>
          )}
        </CategoryTabsTrigger>
      </CategoryTabsList>
      
      <LitterFilterControls
        showAddLitterDialog={showAddLitterDialog}
        setShowAddLitterDialog={setShowAddLitterDialog}
        onAddLitter={onAddLitter}
        plannedLitters={plannedLitters}
        availableYears={availableYears}
      />
    </div>
  );
};

export default LitterFilterHeader;
