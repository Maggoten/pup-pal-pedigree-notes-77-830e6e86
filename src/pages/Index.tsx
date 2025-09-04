
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import DashboardLayout from '@/components/home/DashboardLayout';
import { migratePregnancyData } from '@/utils/pregnancyMigration';
import { showDevToast } from '@/utils/toastUtils';

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
          // Use the conditional toast for developer notifications
          showDevToast({
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

  return (
    <DashboardLayout 
      user={user}
      activePregnancies={activePregnancies}
      seoKey="home"
    />
  );
};

export default Index;
