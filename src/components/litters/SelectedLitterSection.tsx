import React, { useState, useEffect, memo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Litter, Puppy } from '@/types/breeding';
import { differenceInWeeks, parseISO } from 'date-fns';
import { useDogsQueries } from '@/hooks/dogs/useDogsQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// Static imports instead of lazy loading
import PuppiesTabContent from './tabs/PuppiesTabContent';
import DevelopmentTabContent from './tabs/DevelopmentTabContent';
import GrowthChartsTabContent from './tabs/GrowthChartsTabContent';

// Loading fallback component
const TabLoading = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
));

TabLoading.displayName = 'TabLoading';

interface SelectedLitterSectionProps {
  litter: Litter;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  isLoadingDetails?: boolean;
}

const SelectedLitterSection: React.FC<SelectedLitterSectionProps> = memo(({
  litter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  isLoadingDetails
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [activeTab, setActiveTab] = useState('puppies');
  const { data: dogs } = useDogsQueries().useDogs();
  const [damBreed, setDamBreed] = useState<string>('');

  // Calculate litter age in weeks - memoized by component memo
  const litterAge = differenceInWeeks(new Date(), parseISO(litter.dateOfBirth));

  // Handle checklist item toggle
  const handleToggleChecklistItem = useCallback((itemId: string, completed: boolean) => {
    console.log(`Checklist item ${itemId} toggled to ${completed ? 'completed' : 'uncompleted'} for litter ${litter.id}`);
    // The actual saving is handled by the useChecklistData hook
  }, [litter.id]);

  // Find the dam's breed when dogs data is loaded
  useEffect(() => {
    if (dogs && dogs.length > 0 && litter.damId) {
      const dam = dogs.find(dog => dog.id === litter.damId);
      if (dam) {
        console.log("Found dam:", dam.name, "with breed:", dam.breed);
        setDamBreed(dam.breed);
      }
    }
  }, [dogs, litter.damId]);

  // Clear selected puppy when litter changes
  useEffect(() => {
    console.log(`Litter changed to ${litter.name}, clearing selected puppy`);
    setSelectedPuppy(null);
  }, [litter.id, litter.name]);

  // If puppies array is undefined, initialize it as empty array
  const puppies = litter.puppies || [];
  
  // Enhanced logging for debugging puppy data
  useEffect(() => {
    console.log(`Rendering SelectedLitterSection for ${litter.name}:`, {
      litterId: litter.id,
      puppiesCount: puppies.length,
      isLoading: isLoadingDetails,
      puppies: puppies.map(p => ({ id: p.id, name: p.name }))
    });
    
    // Validate that all puppies should belong to this litter
    puppies.forEach(puppy => {
      console.log(`Puppy ${puppy.name} (${puppy.id}) is displayed under litter ${litter.name} (${litter.id})`);
    });
  }, [litter.id, litter.name, puppies, isLoadingDetails]);

  return (
    <div className="space-y-6 mt-6">
      {isLoadingDetails ? (
        <div className="flex items-center justify-center h-40 bg-background border rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading litter details...</p>
          </div>
        </div>
      ) : (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 w-full h-12 bg-muted p-1 gap-1">
            <TabsTrigger value="puppies" className="font-sourcesans font-bold text-primary data-[state=active]:text-primary">
              Puppies
            </TabsTrigger>
            <TabsTrigger value="development" className="font-sourcesans font-bold text-primary data-[state=active]:text-primary">
              <span className="hidden sm:inline">Checklist</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="font-sourcesans font-bold text-primary data-[state=active]:text-primary">
              <span className="hidden sm:inline">Growth Charts</span>
              <span className="sm:hidden">Charts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="puppies" className="mt-0">
            {activeTab === 'puppies' && (
              <PuppiesTabContent 
                puppies={puppies}
                onAddPuppy={onAddPuppy}
                onUpdatePuppy={onUpdatePuppy}
                onDeletePuppy={onDeletePuppy}
                litterDob={litter.dateOfBirth}
                damBreed={damBreed}  
                onSelectPuppy={setSelectedPuppy}
                selectedPuppy={selectedPuppy}
                litterAge={litterAge}
                litter={litter}
              />
            )}
          </TabsContent>

          <TabsContent value="development" className="mt-0">
            {activeTab === 'development' && (
              <DevelopmentTabContent 
                litter={litter}
                onToggleItem={handleToggleChecklistItem}
              />
            )}
          </TabsContent>

          <TabsContent value="charts" className="mt-0">
            {activeTab === 'charts' && (
              <GrowthChartsTabContent 
                selectedPuppy={selectedPuppy}
                puppies={puppies}
                onSelectPuppy={setSelectedPuppy}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
});

SelectedLitterSection.displayName = 'SelectedLitterSection';

export default SelectedLitterSection;
