
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Skeleton } from "@/components/ui/skeleton";

// Import the refactored components
import ActivePregnanciesList from '@/components/pregnancy/ActivePregnanciesList';
import TemperatureLogOverview from '@/components/pregnancy/TemperatureLogOverview';
import WeeklyDevelopmentGuide from '@/components/pregnancy/WeeklyDevelopmentGuide';

const Pregnancy: React.FC = () => {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPregnancies = () => {
      setIsLoading(true);
      try {
        const pregnancies = getActivePregnancies();
        setActivePregnancies(pregnancies);
      } catch (error) {
        console.error("Error loading pregnancies:", error);
        toast({
          title: "Error loading pregnancies",
          description: "There was a problem loading your active pregnancies.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPregnancies();
  }, [dogs]);

  const handleAddPregnancyClick = () => {
    navigate('/planned-litters');
  };

  const handleLogTemperature = () => {
    if (activePregnancies.length > 0) {
      navigate(`/pregnancy/${activePregnancies[0].id}`);
    } else {
      toast({
        title: "No active pregnancies",
        description: "Add a pregnancy before recording temperature."
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout 
        title="Pregnancy" 
        description="Track your pregnant bitches and fetal development"
        icon={<PawPrint className="h-6 w-6" />}
      >
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 mb-6" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>

        <Skeleton className="h-64 w-full mt-6" />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="flex justify-end">
        <Button onClick={handleAddPregnancyClick} className="mb-6">Add Pregnancy</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ActivePregnanciesList 
          pregnancies={activePregnancies} 
          onAddPregnancy={handleAddPregnancyClick} 
        />
        <TemperatureLogOverview onLogTemperature={handleLogTemperature} />
      </div>

      <WeeklyDevelopmentGuide />
    </PageLayout>
  );
};

export default Pregnancy;
