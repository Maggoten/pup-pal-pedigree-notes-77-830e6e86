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
  // ── 1) Auth‐guard: visa loader tills vi har användaren
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

  // ── 2) State för “Active Pregnancies”
  const [activePregnancies, setActivePregnancies] =
    useState<ActivePregnancy[]>(initialActivePregnancies);
  const [isLoadingPregnancies, setIsLoadingPregnancies] =
    useState(initialActivePregnancies.length === 0);

  // ── 3) Hämta all övrig dashboard‐data
  const dashboardData = useDashboardData();

  // ── 4) Destrukturera med fallback─värden för att aldrig få undefined
  const {
    remindersSummary = { count: 0, highPriority: 0 },
    plannedLittersData = { count: 0, nextDate: null },
    recentLittersData = { count: 0, latest: null },
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    deleteEvent,
    handleEditEvent,
    reminders = [],
    remindersLoading = false,
    remindersError = null,
    isDataReady,
    calendarLoading = false,
    calendarError = null
  } = dashboardData;

  // ── 5) Ladda Active Pregnancies – precis som tidigare
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

  // ── 6) Användarnamn för hälsning
  const username = getDisplayUsername(user);

  // ── 7) Props till kalendrar och reminders‐lista
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
    handleMarkComplete: dashboardData.handleMarkComplete
  };

  // ── 8) Rendera
  return (
    <PageLayout>
      <DashboardHero
        username={username}
        reminders={remindersSummary}
        plannedLitters={plannedLittersData}
        activePregnancies={activePregnancies}
        recentLitters={recentLittersData}
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
