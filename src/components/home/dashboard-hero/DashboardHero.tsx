
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CalendarEvent } from '@/types/calendar';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

// Updated interface to include all the props being passed from DashboardLayout
interface DashboardHeroProps {
  username?: string;
  user?: User | null;
  reminders?: { count: number; highPriority: number; };
  plannedLitters?: { count: number; nextDate: Date | null; };
  activePregnancies?: ActivePregnancy[];
  recentLitters?: { count: number; latest: Date | null; };
  isLoadingPregnancies?: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  username,
  user,
  reminders: remindersProp,
  plannedLitters: plannedLittersProp,
  activePregnancies,
  recentLitters: recentLittersProp,
  isLoadingPregnancies
}) => {
  const {
    reminders,
    remindersLoading,
    remindersSummary,
    calendarEvents,
    calendarLoading,
    plannedLittersData,
    recentLittersData,
    upcomingHeats,
    isDataReady
  } = useDashboardData();
  
  // Use props if provided, otherwise use data from the hook
  const finalRemindersSummary = remindersProp || remindersSummary;
  const finalPlannedLittersData = plannedLittersProp || plannedLittersData;
  const finalRecentLittersData = recentLittersProp || recentLittersData;
  const finalIsLoading = isLoadingPregnancies !== undefined ? isLoadingPregnancies : !isDataReady;
  
  // Derive metrics for the hero section
  const metrics = React.useMemo(() => [
    {
      icon: 'bell',
      label: 'Active Reminders',
      value: finalRemindersSummary.count.toString(),
      highlightColor: finalRemindersSummary.highPriority > 0 ? 'orange' : undefined,
      trend: null,
      loading: remindersLoading
    },
    {
      icon: 'calendar',
      label: 'Calendar Events',
      value: calendarEvents.length.toString(),
      highlightColor: undefined,
      trend: null,
      loading: calendarLoading
    },
    {
      icon: 'pawprint',
      label: 'Planned Litters',
      value: finalPlannedLittersData.count.toString(),
      highlightColor: undefined,
      trend: null,
      loading: finalIsLoading
    },
    {
      icon: 'heart',
      label: 'Upcoming Heats',
      value: upcomingHeats.length.toString(),
      highlightColor: undefined, 
      trend: null,
      loading: finalIsLoading
    }
  ], [
    finalRemindersSummary, 
    calendarEvents, 
    finalPlannedLittersData, 
    upcomingHeats, 
    remindersLoading, 
    calendarLoading, 
    finalIsLoading
  ]);
  
  return (
    <section className="w-full bg-gradient-to-b from-greige-50 via-greige-100 to-white rounded-xl shadow-sm mb-12 px-6 py-8">
      <WelcomeHeader username={username} user={user} />
      <MetricCardGrid metricCards={metrics.map(m => ({
        title: m.label,
        count: parseInt(m.value) || 0,
        icon: m.icon as any,
        highlight: m.highlightColor || null,
        action: () => {},
        loading: m.loading
      }))} />
    </section>
  );
};

export default DashboardHero;
