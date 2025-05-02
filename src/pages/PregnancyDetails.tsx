
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';

import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyTimeline from '@/components/pregnancy/PregnancyTimeline';

const PregnancyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pregnancy, loading } = usePregnancyDetails(id);

  const handleBackClick = () => {
    navigate('/pregnancy');
  };

  if (loading) {
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
          <Button 
            onClick={handleBackClick} 
            className="mt-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pregnancies
          </Button>
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
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackClick} 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pregnancies
        </Button>
      </div>

      <div className="space-y-8">
        {/* Hero Section with Pregnancy Summary Cards */}
        <PregnancySummaryCards
          matingDate={pregnancy.matingDate}
          expectedDueDate={pregnancy.expectedDueDate}
          daysLeft={pregnancy.daysLeft}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Timeline */}
          <div className="lg:col-span-1">
            <PregnancyTimeline 
              matingDate={pregnancy.matingDate}
              expectedDueDate={pregnancy.expectedDueDate}
            />
          </div>
          
          {/* Right Column: Pregnancy Journey Tabs */}
          <div className="lg:col-span-2">
            <PregnancyTabs 
              pregnancyId={pregnancy.id}
              femaleName={pregnancy.femaleName}
              matingDate={pregnancy.matingDate}
              expectedDueDate={pregnancy.expectedDueDate}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PregnancyDetails;
