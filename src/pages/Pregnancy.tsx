
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import ActivePregnanciesList from '@/components/pregnancy/ActivePregnanciesList';
import TemperatureLogOverview from '@/components/pregnancy/TemperatureLogOverview';
import WeeklyDevelopmentGuide from '@/components/pregnancy/WeeklyDevelopmentGuide';

const Pregnancy: React.FC = () => {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchPregnancies = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        console.log("Fetching active pregnancies...");
        const pregnancies = await getActivePregnancies();
        console.log("Fetched pregnancies on Pregnancy page:", pregnancies);
        
        setActivePregnancies(pregnancies);
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
        setHasError(true);
        toast({
          title: "Error loading pregnancies",
          description: "There was a problem loading active pregnancies."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPregnancies();
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

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
      icon={<Heart className="h-6 w-6" />}
    >
      <div className="flex justify-end">
        <Button onClick={handleAddPregnancyClick} className="mb-6 bg-greige-600 hover:bg-greige-700">Add Pregnancy</Button>
      </div>
      
      {hasError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading your pregnancies. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-greige-50 border border-greige-200 rounded-lg shadow-sm">
          <ActivePregnanciesList 
            pregnancies={activePregnancies} 
            onAddPregnancy={handleAddPregnancyClick}
            isLoading={isLoading}
          />
        </div>
        <div className="bg-greige-50 border border-greige-200 rounded-lg shadow-sm">
          <TemperatureLogOverview 
            onLogTemperature={handleLogTemperature} 
          />
        </div>
      </div>

      <div className="mt-6 bg-greige-50 rounded-lg border border-greige-200 p-4">
        <WeeklyDevelopmentGuide />
      </div>
    </PageLayout>
  );
};

export default Pregnancy;
