
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
    try {
      // Get active pregnancies from the service
      const pregnancies = getActivePregnancies();
      setActivePregnancies(pregnancies);
    } catch (error) {
      console.error('Error loading pregnancies:', error);
      toast({
        title: "Error",
        description: "Failed to load pregnancies data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleAddDogClick = () => {
    toast({
      title: "Coming Soon",
      description: "Add dog feature will be available in the next update.",
    });
  };

  // If still loading, show simple loading state instead of full dashboard
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      user={user}
      activePregnancies={activePregnancies}
      onAddDogClick={handleAddDogClick}
    />
  );
};

export default Index;
