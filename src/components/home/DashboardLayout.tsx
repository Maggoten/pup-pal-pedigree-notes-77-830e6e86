// src/components/home/DashboardLayout.tsx

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

  // Hook som samlar all dashboard-data
  const {
    remindersSummary,
    plannedLittersData,
    recentLittersData,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    reminders,
    markReminderComplete,
    deleteReminder,
    isDataReady
  } = useDashboardData();

  // Hämtar användarens namn
  const username = getDisplayUsername(user);

  // Laddar aktiva dräktigheter om användaren är inloggad
  useEffect(() => {
    if (!user || initialActivePregnancies.length > 0) return;

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

  // Props till kalendern
  const calendarProps = {
    getEventsForDate,
    getEventColor,
    addEvent: handleAddEvent
  };

  // Props till reminders-listan
  const remindersProps = {
    reminders,
    markComplete: markReminderComplete,
    deleteReminder
  };

  return (
    <PageLayout>
      <DashboardHero
        username={username}
        reminders={remindersSummary}           // <-- Här
        plannedLitters={plannedLittersData}   // <-- Här
        activePregnancies={activePregnancies}
        recentLitters={recentLittersData}     // <-- Här
        isLoadingPregnancies={isLoadingPregnancies}
      />

      <div className="mt-8 space-y-6">
        <DashboardContent
          isDataReady={isDataReady}
          calendarProps={calendarProps}
          remindersProps={remindersProps}
        />
      </div>
    </PageLayout>
  );
};

export default DashboardLayout;
