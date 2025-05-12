import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import DashboardLayout from '@/components/home/DashboardLayout';
import { migratePregnancyData } from '@/utils/pregnancyMigration';

const Index = () => {
  const { user, isAuthReady } = useAuth();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!isAuthReady || !user) return;

      try {
        setIsLoading(true);

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
        console.error("Error initializing Index.tsx:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [isAuthReady, user]);

  return (
    <DashboardLayout
      user={user}
      activePregnancies={activePregnancies}
    />
  );
};

export default Index;
