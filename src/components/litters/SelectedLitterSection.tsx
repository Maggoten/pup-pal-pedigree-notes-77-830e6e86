
import React, { useState, useEffect, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Litter, Puppy } from '@/types/breeding';
import { differenceInWeeks, parseISO } from 'date-fns';
import LitterDetails from './LitterDetails';
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

  // If puppies array is undefined, initialize it as empty array
  const puppies = litter.puppies || [];
  console.log(`Rendering SelectedLitterSection for ${litter.name} with ${puppies.length} puppies, isLoading=${isLoadingDetails}`);

  return (
    <div className="space-y-6 mt-6">
      <LitterDetails 
        litter={litter}
        onAddPuppy={onAddPuppy}
        onUpdatePuppy={onUpdatePuppy}
        onDeletePuppy={onDeletePuppy}
        onUpdateLitter={onUpdateLitter}
        onDeleteLitter={onDeleteLitter}
        onArchiveLitter={onArchiveLitter}
      />

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
          <TabsList className="flex md:grid md:grid-cols-3 mb-6 overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="puppies">Puppies</TabsTrigger>
            <TabsTrigger value="development">Checklist</TabsTrigger>
            <TabsTrigger value="charts">Growth Charts</TabsTrigger>
          </TabsList>

          {/* No Suspense wrapper needed anymore since we're using static imports */}
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
              />
            )}
          </TabsContent>

          <TabsContent value="development" className="mt-0">
            {activeTab === 'development' && (
              <DevelopmentTabContent 
                litter={litter}
                onToggleItem={() => {}}
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
