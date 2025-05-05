
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Litter } from '@/types/breeding';
import PuppiesCard from './PuppiesCard';
import PuppyWeightLog from './PuppyWeightLog';
import { Skeleton } from '@/components/ui/skeleton';

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
  // State to track if each tab's content is loaded
  const [loadedTabs, setLoadedTabs] = useState<Record<string, boolean>>({});
  
  // Load the selected tab's content
  useEffect(() => {
    if (selectedLitterId) {
      setLoadedTabs(prev => ({...prev, [selectedLitterId]: true}));
    }
  }, [selectedLitterId]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedLitterId(value);
    // Mark this tab as loaded
    setLoadedTabs(prev => ({...prev, [value]: true}));
  };
  
  return (
    <Tabs value={selectedLitterId || ''} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="w-full justify-start overflow-auto">
        {litters.map(litter => (
          <TabsTrigger key={litter.id} value={litter.id}>{litter.name}</TabsTrigger>
        ))}
      </TabsList>
      
      {litters.map(litter => (
        <TabsContent key={litter.id} value={litter.id} className="space-y-4">
          {loadedTabs[litter.id] ? (
            <>
              <PuppiesCard 
                puppies={litter.puppies}
                onLogWeights={onLogWeights}
              />
              
              <PuppyWeightLog puppies={litter.puppies} />
            </>
          ) : (
            <>
              <Skeleton className="w-full h-64" />
              <Skeleton className="w-full h-48" />
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default LitterTabs;
