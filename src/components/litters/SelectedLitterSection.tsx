
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Litter, Puppy } from '@/types/breeding';
import { differenceInWeeks, parseISO } from 'date-fns';
import LitterDetails from './LitterDetails';
import PuppiesTabContent from './tabs/PuppiesTabContent';
import DevelopmentTabContent from './tabs/DevelopmentTabContent';
import GrowthChartsTabContent from './tabs/GrowthChartsTabContent';
import { useDogsQueries } from '@/hooks/dogs/useDogsQueries';
import { Dog } from '@/types/dogs';

interface SelectedLitterSectionProps {
  litter: Litter;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
}

const SelectedLitterSection: React.FC<SelectedLitterSectionProps> = ({
  litter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [activeTab, setActiveTab] = useState('puppies');
  const { data: dogs } = useDogsQueries().useDogs();
  const [damBreed, setDamBreed] = useState<string>('');

  // Calculate litter age in weeks
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

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="puppies">Puppies</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="charts">Growth Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="puppies" className="mt-0">
          <PuppiesTabContent 
            puppies={litter.puppies || []}
            onAddPuppy={onAddPuppy}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
            litterDob={litter.dateOfBirth}
            damBreed={damBreed}  
            onSelectPuppy={setSelectedPuppy}
            selectedPuppy={selectedPuppy}
            litterAge={litterAge}
          />
        </TabsContent>

        <TabsContent value="development" className="mt-0">
          <DevelopmentTabContent 
            litter={litter}
            onToggleItem={() => {}}
          />
        </TabsContent>

        <TabsContent value="charts" className="mt-0">
          <GrowthChartsTabContent 
            selectedPuppy={selectedPuppy}
            puppies={litter.puppies || []}
            onSelectPuppy={setSelectedPuppy}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelectedLitterSection;
