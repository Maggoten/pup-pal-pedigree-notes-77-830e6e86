
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

// Import our new component files
import PregnancyHeader from '@/components/pregnancy/PregnancyHeader';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import LoadingPregnancy from '@/components/pregnancy/LoadingPregnancy';

const PregnancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pregnancy, loading } = usePregnancyDetails(id);
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  
  useEffect(() => {
    const pregnancies = getActivePregnancies();
    setActivePregnancies(pregnancies);
  }, []);
  
  const handlePregnancyChange = (pregnancyId: string) => {
    navigate(`/pregnancy/${pregnancyId}`);
  };
  
  if (loading || !pregnancy) {
    return <LoadingPregnancy />;
  }
  
  return (
    <PageLayout 
      title=""
      description=""
      icon={null}
    >
      <div className="mb-6 flex justify-end">
        {activePregnancies.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-greige-700">Select Pregnancy:</span>
            <Select 
              value={id} 
              onValueChange={handlePregnancyChange}
            >
              <SelectTrigger className="w-[200px] bg-greige-50 border-greige-300 text-greige-700 hover:bg-greige-100">
                <SelectValue placeholder="Select pregnancy" />
              </SelectTrigger>
              <SelectContent className="bg-greige-50">
                {activePregnancies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.femaleName} × {p.maleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
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
