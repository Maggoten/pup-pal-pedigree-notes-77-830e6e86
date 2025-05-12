import React, { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import PageLayout from '@/components/PageLayout';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getDisplayUsername } from '@/utils/userDisplayUtils';
import { getActivePregnancies } from '@/services/PregnancyService';
import { toast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies?: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activePregnancies: initialActivePregnancies = []
}) => {
  // State för aktiva dräktigheter
  const [activePregnancies, setActivePregnancies] =
    useState<ActivePregnancy[]>(initialActivePregnancies);
  const [isLoadingPregnancies, setIsLoadingPregnancies] = 
    useState(initialActivePregnancies.length === 0);

  // Hämtar all övrig dashboard-data (reminders, events etc)
  const dashboardData = useDashboardData();

  // 📌 Här lägger vi in auth-skydd
  useEffect(() => {
    // Om ingen användare är inloggad eller vi redan har data, gör inget
    if (!user || initialActivePregnancies.length > 0) {
      return;
    }

    const fetchActivePregnancies = async () => {
      try {
        setIsLoadingPregnancies(true);
        const pregnancies = await getActivePregnancies();
        setActivePregnancies(pregnancies);
      } catch (error) {
        console.error("Error fetching active pregnancies:", error);
        toast({
          title: "Error",
          description: "Could not load active pregnancies",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPregnancies(false);
      }
    };

    fetchActivePregnancies();
  }, [user, initialActivePregnancies.length]);

  // Användarnamn för hälsning
  const username = getDisplayUsername(user);

  // Förbered props till komponenter
  const calendarProps = {
    getEventsForDate: dashboardData.getEventsForDate,
    getEventColor: dashboardData.getEventColor,
    addEvent: dashboardData.handleAddEvent
  };
  const remindersProps = {
    reminders: dashboardData.reminders,
    markComplete: dashboardData.markReminderComplete,
    deleteReminder: dashboardData.deleteReminder
  };

  return (
    <PageLayout>
      <DashboardHero
        username={username}
        activePregnancies={activePregnancies}
        isLoadingPregnancies={isLoadingPregnancies}
      />

      <div className="mt-8 space-y-6">
        <DashboardContent
          isDataReady={dashboardData.isDataReady}
          calendarProps={calendarProps}
          remindersProps={remindersProps}
        />
      </div>
    </PageLayout>
  );
};

export default DashboardLayout;
