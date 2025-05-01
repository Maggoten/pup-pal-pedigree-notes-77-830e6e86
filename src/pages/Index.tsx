
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import DashboardLayout from '@/components/home/DashboardLayout';
import { migratePregnancyData } from '@/utils/pregnancyMigration';

const Index = () => {
  const { user } = useAuth();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Run data migration if needed
        const migrationResult = await migratePregnancyData();
        if (migrationResult.success) {
          toast({
            title: "Data Migration Complete",
            description: "Your pregnancy data has been successfully migrated to the cloud."
          });
        }
        
        const pregnancies = await getActivePregnancies();
        setActivePregnancies(pregnancies);
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
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
