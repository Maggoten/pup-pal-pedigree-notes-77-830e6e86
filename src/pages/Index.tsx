
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import DashboardLayout from '@/components/home/DashboardLayout';

const Index = () => {
  const { user } = useAuth();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get active pregnancies from the service
    const fetchPregnancies = async () => {
      try {
        setIsLoading(true);
        const pregnancies = await getActivePregnancies();
        setActivePregnancies(pregnancies);
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPregnancies();
  }, []);
  
  const handleAddDogClick = () => {
    toast({
      title: "Coming Soon",
      description: "Add dog feature will be available in the next update.",
    });
  };

  return (
    <DashboardLayout 
      user={user}
      activePregnancies={activePregnancies}
      onAddDogClick={handleAddDogClick}
    />
  );
};

export default Index;
