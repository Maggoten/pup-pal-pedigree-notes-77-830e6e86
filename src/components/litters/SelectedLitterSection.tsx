
import React, { useState } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { differenceInWeeks, parseISO } from 'date-fns';
import SelectedLitterHeader from './SelectedLitterHeader';
import CompactDevelopmentSection from './CompactDevelopmentSection';
import PuppiesSection from './PuppiesSection';
import DevelopmentSection from './DevelopmentSection';
import GrowthChartsSection from './GrowthChartsSection';

interface SelectedLitterSectionProps {
  selectedLitter: Litter | null;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const SelectedLitterSection: React.FC<SelectedLitterSectionProps> = ({
  selectedLitter,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  
  // If no litter is selected, don't show this section
  if (!selectedLitter) {
    return null;
  }
  
  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? "Item marked as completed" 
        : "Item marked as not completed"
    });
  };

  // Calculate litter age
  const birthDate = parseISO(selectedLitter.dateOfBirth);
  const ageInWeeks = differenceInWeeks(new Date(), birthDate);
  
  return (
    <div className="mt-6 animate-fade-in space-y-6">
      {/* Header with edit button */}
      <SelectedLitterHeader 
        litter={selectedLitter}
        onUpdateLitter={onUpdateLitter}
        onDeleteLitter={onDeleteLitter}
        onArchiveLitter={onArchiveLitter}
        ageInWeeks={ageInWeeks}
      />
      
      {/* 1. Puppy Development Checklist - Compact Version */}
      <CompactDevelopmentSection 
        litter={selectedLitter}
        onToggleItem={handleToggleChecklistItem}
      />
      
      {/* 2. Puppies Section */}
      <PuppiesSection 
        puppies={selectedLitter.puppies}
        onAddPuppy={onAddPuppy}
        onUpdatePuppy={onUpdatePuppy}
        onDeletePuppy={onDeletePuppy}
        litterDob={selectedLitter.dateOfBirth}
        damBreed={selectedLitter.damName}
        onSelectPuppy={setSelectedPuppy}
        selectedPuppy={selectedPuppy}
      />
      
      {/* 3. Growth Charts Section */}
      <GrowthChartsSection 
        selectedPuppy={selectedPuppy}
        puppies={selectedLitter.puppies}
      />
      
      {/* 4. Development Section */}
      <DevelopmentSection 
        litter={selectedLitter}
        onToggleItem={handleToggleChecklistItem}
      />
    </div>
  );
};

export default SelectedLitterSection;
