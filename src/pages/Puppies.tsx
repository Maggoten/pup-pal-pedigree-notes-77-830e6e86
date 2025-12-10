
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { usePuppyData } from '@/hooks/usePuppyData';
import PuppiesHeader from '@/components/puppies/PuppiesHeader';
import LitterTabs from '@/components/puppies/LitterTabs';
import EmptyPuppiesState from '@/components/puppies/EmptyPuppiesState';
import { PawPrint, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Puppies: React.FC = () => {
  const { t, ready } = useTranslation('litters');
  const {
    litters,
    selectedLitterId,
    setSelectedLitterId,
    handleAddLitterClick,
    handleAddWeightLog
  } = usePuppyData();

  if (!ready) {
    return (
      <PageLayout 
        title="Loading..." 
        description="Loading..."
        icon={<PawPrint className="h-6 w-6" />}
        showWelcomeHeader={false}
      >
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={t('pages.puppies.title')} 
      description={t('pages.puppies.description')}
      icon={<PawPrint className="h-6 w-6" />}
      showWelcomeHeader={false}
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
