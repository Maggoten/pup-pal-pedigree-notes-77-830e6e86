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
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies?: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activePregnancies: initialActivePregnancies = []
}) => {
  // 1) Visa loader tills vi vet att användaren är inloggad
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Laddar användarsession...
        </p>
      </div>
    );
  }

  // 2) Local state för aktiva dräktigheter
  const [activePregnancies, setActivePregnancies] =
    useState<ActivePregnancy[]>(initialActivePregnancies);
  const [isLoadingPregnancies, setIsLoadingPregnancies] =
    useState(initialActivePregnancies.length === 0);

  // 3) Hämta all dashboard‐data
  const dashboardData = useDashboardData();

  // 4) Plocka ut värden, men utan default här
  const {
    remindersSummary,
    plannedLittersData,
    recentLittersData,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    deleteEvent,
    handleEditEvent,
    calendarLoading,
    calendarError,
    reminders,
    remindersLoading,
    remindersError,
    handleMarkComplete,
    isDataReady
  } = dashboardData;

  // 5) Skapa säkra fallback‐objekt
  const safeReminders     = remindersSummary     ?? { count: 0, highPriority: 0 };
  const safePlannedLitters= plannedLittersData   ?? { count: 0, nextDate: null };
  const safeRecentLitters = recentLittersData    ?? { count: 0, latest: null };

  // 6) Hälsningsnamn
  const username = getDisplayUsername(user);

  // 7) Ladda aktiva dräktigheter om vi inte redan har dem
  useEffect(() => {
    if (initialActivePregnancies.length > 0) return;

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
  }, [initialActivePregnancies.length]);

  // 8) Props till kalendern och reminders‐listan
  const calendarProps = {
    getEventsForDate,
    getEventColor,
    addEvent: handleAddEvent,
    deleteEvent,
    editEvent: handleEditEvent,
    isLoading: calendarLoading,
    hasError: calendarError
  };

  const remindersProps = {
    reminders,
    isLoading: remindersLoading,
    hasError: remindersError,
    markComplete: handleMarkComplete
  };

  // 9) Rendera layout + hero
  return (
    <PageLayout>
      <DashboardHero
        username={username}
        reminders={safeReminders}               // inga fler undefined.count
        plannedLitters={safePlannedLitters}     // alltid ett objekt
        activePregnancies={activePregnancies}
        recentLitters={safeRecentLitters}       // alltid ett objekt
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
