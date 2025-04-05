
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Litter, Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { differenceInWeeks, parseISO } from 'date-fns';
import { Baby, BarChart2, Milestone } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('puppies');
  
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
    <div className="animate-fade-in space-y-6">
      {/* Header with edit button */}
      <SelectedLitterHeader 
        litter={selectedLitter}
        onUpdateLitter={onUpdateLitter}
        onDeleteLitter={onDeleteLitter}
        onArchiveLitter={onArchiveLitter}
        ageInWeeks={ageInWeeks}
      />
      
      {/* Compact Development Checklist - Always visible */}
      <CompactDevelopmentSection 
        litter={selectedLitter}
        onToggleItem={handleToggleChecklistItem}
      />
      
      {/* Tab-based layout for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="puppies" className="flex items-center gap-2">
            <Baby className="h-4 w-4" /> Puppies
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> Growth Charts
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <Milestone className="h-4 w-4" /> Development
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="puppies" className="mt-0">
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
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          <GrowthChartsSection 
            selectedPuppy={selectedPuppy}
            puppies={selectedLitter.puppies}
          />
        </TabsContent>
        
        <TabsContent value="development" className="mt-0">
          <DevelopmentSection 
            litter={selectedLitter}
            onToggleItem={handleToggleChecklistItem}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelectedLitterSection;
