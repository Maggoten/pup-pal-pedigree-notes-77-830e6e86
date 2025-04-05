
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Litter } from '@/types/breeding';
import PuppiesCard from './PuppiesCard';
import PuppyWeightLog from './PuppyWeightLog';

interface LitterTabsProps {
  litters: Litter[];
  selectedLitterId: string | null;
  setSelectedLitterId: (id: string | null) => void;
  onLogWeights: () => void;
}

const LitterTabs: React.FC<LitterTabsProps> = ({ 
  litters, 
  selectedLitterId, 
  setSelectedLitterId,
  onLogWeights 
}) => {
  return (
    <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
      <TabsList className="w-full justify-start overflow-auto">
        {litters.map(litter => (
          <TabsTrigger key={litter.id} value={litter.id}>{litter.name}</TabsTrigger>
        ))}
      </TabsList>
      
      {litters.map(litter => (
        <TabsContent key={litter.id} value={litter.id} className="space-y-4">
          <PuppiesCard 
            puppies={litter.puppies}
            onLogWeights={onLogWeights}
          />
          
          <PuppyWeightLog puppies={litter.puppies} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default LitterTabs;
