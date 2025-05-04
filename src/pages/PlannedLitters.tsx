
import React from 'react';
import PageLayout from '@/components/PageLayout';
import PlannedLittersContent from '@/components/planned-litters/components/PlannedLittersContent';
import { DogsProvider } from '@/context/DogsContext';

const PlannedLitters: React.FC = () => {
  return (
    <PageLayout 
      title="Planned Litters & Mating" 
      description="Plan your future litters, track heat cycles, and manage breeding activities"
      className="bg-warmbeige-50/50"
    >
      <DogsProvider>
        <PlannedLittersContent />
      </DogsProvider>
    </PageLayout>
  );
};

export default PlannedLitters;
