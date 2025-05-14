
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CalendarEvent } from '@/types/calendar';

const DashboardHero: React.FC = () => {
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
  
  // Derive metrics for the hero section
  const metrics = React.useMemo(() => [
    {
      icon: 'bell',
      label: 'Active Reminders',
      value: remindersSummary.count.toString(),
      highlightColor: remindersSummary.highPriority > 0 ? 'orange' : undefined,
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
      value: plannedLittersData.count.toString(),
      highlightColor: undefined,
      trend: null,
      loading: !isDataReady
    },
    {
      icon: 'heart',
      label: 'Upcoming Heats',
      value: upcomingHeats.length.toString(),
      highlightColor: undefined, 
      trend: null,
      loading: !isDataReady
    }
  ], [
    remindersSummary, 
    calendarEvents, 
    plannedLittersData, 
    upcomingHeats, 
    remindersLoading, 
    calendarLoading, 
    isDataReady
  ]);
  
  return (
    <section className="w-full bg-gradient-to-b from-greige-50 via-greige-100 to-white rounded-xl shadow-sm mb-12 px-6 py-8">
      <WelcomeHeader />
      <MetricCardGrid metrics={metrics} />
    </section>
  );
};

export default DashboardHero;
