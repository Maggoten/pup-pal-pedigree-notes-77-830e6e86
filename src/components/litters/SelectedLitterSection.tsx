
import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Litter, Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { differenceInWeeks, parseISO } from 'date-fns';
import { Heart, BarChart2, ClipboardCheck } from 'lucide-react';
import SelectedLitterHeader from './SelectedLitterHeader';
import CompactDevelopmentSection from './CompactDevelopmentSection';
import PuppiesTabContent from './tabs/PuppiesTabContent';
import DevelopmentTabContent from './tabs/DevelopmentTabContent';
import GrowthChartsTabContent from './tabs/GrowthChartsTabContent';

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
  const [checklistVersion, setChecklistVersion] = useState(0);
  
  // If no litter is selected, don't show this section
  if (!selectedLitter) {
    return null;
  }
  
  const handleToggleChecklistItem = useCallback((itemId: string, completed: boolean) => {
    // Force a re-render when a checklist item is toggled
    setChecklistVersion(prev => prev + 1);
    
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? "Item marked as completed" 
        : "Item marked as not completed"
    });
  }, []);

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
      
      {/* Tab-based layout for different sections - Now positioned first */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="puppies" className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> Puppies
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> Growth Charts
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" /> Checklist
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="puppies" className="mt-0">
          <PuppiesTabContent 
            puppies={selectedLitter.puppies}
            onAddPuppy={onAddPuppy}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
            litterDob={selectedLitter.dateOfBirth}
            damBreed={selectedLitter.damName}
            onSelectPuppy={setSelectedPuppy}
            selectedPuppy={selectedPuppy}
            litterAge={ageInWeeks}
          />
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          <GrowthChartsTabContent 
            selectedPuppy={selectedPuppy}
            puppies={selectedLitter.puppies}
            onSelectPuppy={setSelectedPuppy}
          />
        </TabsContent>
        
        <TabsContent value="development" className="mt-0">
          <DevelopmentTabContent 
            litter={selectedLitter}
            onToggleItem={handleToggleChecklistItem}
            key={`development-${checklistVersion}`}
          />
        </TabsContent>
      </Tabs>
      
      {/* Compact Development Checklist - Now positioned below the tabs */}
      <CompactDevelopmentSection 
        litter={selectedLitter}
        onToggleItem={handleToggleChecklistItem}
        key={`compact-${checklistVersion}`}
      />
    </div>
  );
};

export default SelectedLitterSection;
