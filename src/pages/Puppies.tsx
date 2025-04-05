
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { usePuppyData } from '@/hooks/usePuppyData';
import PuppiesHeader from '@/components/puppies/PuppiesHeader';
import LitterTabs from '@/components/puppies/LitterTabs';
import EmptyPuppiesState from '@/components/puppies/EmptyPuppiesState';

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
    >
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
    </PageLayout>
  );
};

export default Puppies;
