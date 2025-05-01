
import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Heart, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';
import PregnancyHeader from '@/components/pregnancy/PregnancyHeader';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';

const PregnancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pregnancy, loading } = usePregnancyDetails(id);

  return (
    <PageLayout 
      title="Pregnancy Details" 
      description="Track the development of your dog's pregnancy"
      icon={<Heart className="h-6 w-6" />}
    >
      {loading || !pregnancy ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <PregnancyHeader 
            femaleName={pregnancy.femaleName} 
            maleName={pregnancy.maleName} 
          />
          
          <PregnancySummaryCards 
            matingDate={pregnancy.matingDate}
            expectedDueDate={pregnancy.expectedDueDate}
            daysLeft={pregnancy.daysLeft}
          />
          
          <div className="mt-6">
            <PregnancyTabs 
              pregnancyId={pregnancy.id}
              femaleName={pregnancy.femaleName}
              matingDate={pregnancy.matingDate}
              expectedDueDate={pregnancy.expectedDueDate}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default PregnancyDetails;
