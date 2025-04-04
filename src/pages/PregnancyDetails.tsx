
import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';

// Import our new component files
import PregnancyHeader from '@/components/pregnancy/PregnancyHeader';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import LoadingPregnancy from '@/components/pregnancy/LoadingPregnancy';

const PregnancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pregnancy, loading } = usePregnancyDetails(id);
  
  if (loading || !pregnancy) {
    return <LoadingPregnancy />;
  }
  
  return (
    <PageLayout 
      title=""
      description=""
      icon={null}
    >
      <PregnancyHeader 
        femaleName={pregnancy.femaleName}
        maleName={pregnancy.maleName}
        matingDate={pregnancy.matingDate}
      />
      
      <PregnancySummaryCards 
        matingDate={pregnancy.matingDate}
        expectedDueDate={pregnancy.expectedDueDate}
        daysLeft={pregnancy.daysLeft}
      />
      
      <PregnancyTabs 
        pregnancyId={pregnancy.id}
        femaleName={pregnancy.femaleName}
        matingDate={pregnancy.matingDate}
        expectedDueDate={pregnancy.expectedDueDate}
      />
    </PageLayout>
  );
};

export default PregnancyDetails;
