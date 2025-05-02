
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Loader2, Heart } from 'lucide-react';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';
import { getActivePregnancies } from '@/services/PregnancyService';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyDropdownSelector from '@/components/pregnancy/PregnancyDropdownSelector';
import { useState, useEffect } from 'react';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

const PregnancyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { pregnancy, loading } = usePregnancyDetails(id);
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [loadingPregnancies, setLoadingPregnancies] = useState(true);

  useEffect(() => {
    const fetchPregnancies = async () => {
      try {
        const pregnancies = await getActivePregnancies();
        console.log("Fetched pregnancies for dropdown:", pregnancies.length);
        setActivePregnancies(pregnancies);
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
      } finally {
        setLoadingPregnancies(false);
      }
    };
    
    fetchPregnancies();
  }, []);

  if (loading || loadingPregnancies) {
    return (
      <PageLayout 
        title="Pregnancy Details" 
        description="Loading pregnancy details..."
        icon={<Heart className="h-6 w-6" />}
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading pregnancy details...</span>
        </div>
      </PageLayout>
    );
  }

  if (!pregnancy) {
    return (
      <PageLayout 
        title="Pregnancy Not Found" 
        description="The requested pregnancy could not be found"
        icon={<Heart className="h-6 w-6" />}
      >
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-greige-700">Pregnancy Not Found</h3>
          <p className="text-greige-500 mt-2">The pregnancy you are looking for doesn't exist or has been archived.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={`${pregnancy.femaleName}'s Pregnancy`} 
      description="Track pregnancy progress and development"
      icon={<Heart className="h-6 w-6" />}
    >
      <div className="flex justify-end items-center mb-6">
        <PregnancyDropdownSelector 
          pregnancies={activePregnancies} 
          currentPregnancyId={pregnancy.id}
        />
      </div>

      <div className="space-y-8">
        {/* Hero Section with Pregnancy Summary Cards */}
        <PregnancySummaryCards
          matingDate={pregnancy.matingDate}
          expectedDueDate={pregnancy.expectedDueDate}
          daysLeft={pregnancy.daysLeft}
        />
        
        {/* Full Width Pregnancy Journey Tabs */}
        <div className="w-full">
          <PregnancyTabs 
            pregnancyId={pregnancy.id}
            femaleName={pregnancy.femaleName}
            matingDate={pregnancy.matingDate}
            expectedDueDate={pregnancy.expectedDueDate}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default PregnancyDetails;
