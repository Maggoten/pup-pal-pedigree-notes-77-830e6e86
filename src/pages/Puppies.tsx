
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { usePuppyData } from '@/hooks/usePuppyData';
import PuppiesHeader from '@/components/puppies/PuppiesHeader';
import LitterTabs from '@/components/puppies/LitterTabs';
import EmptyPuppiesState from '@/components/puppies/EmptyPuppiesState';
import { PawPrint } from 'lucide-react';

const Puppies: React.FC = () => {
  const {
    litters,
    selectedLitterId,
    setSelectedLitterId,
    handleAddLitterClick,
    handleAddWeightLog
  } = usePuppyData();

  return (
    <PageLayout 
      title="Puppies" 
      description="Track your litters and individual puppies"
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="bg-background min-h-[calc(100vh-6rem)]">
        <div className="beige-gradient rounded-lg border border-greige-300 p-4">
          <PuppiesHeader onAddLitterClick={handleAddLitterClick} />
          
          {litters.length > 0 ? (
            <LitterTabs 
              litters={litters}
              selectedLitterId={selectedLitterId}
              setSelectedLitterId={setSelectedLitterId}
              onLogWeights={handleAddWeightLog}
            />
          ) : (
            <EmptyPuppiesState onAddLitter={handleAddLitterClick} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Puppies;
