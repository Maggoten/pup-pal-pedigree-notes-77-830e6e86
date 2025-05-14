
import React from 'react';
import { differenceInDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import UserWelcomeBanner from './UserWelcomeBanner';
import MetricCardGrid, { MetricCardProps } from './MetricCardGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';

const DashboardHero: React.FC = () => {
  const { 
    dogCount, 
    recentLittersCount,
    littersThisYear,
    upcomingRemindersCount,
    nearbyAppointmentsCount,
    littersLoading,
    appointmentsLoading,
    remindersLoading,
    dogsLoading
  } = useDashboardData();

  const metricCards: MetricCardProps[] = [
    {
      icon: "dog",
      label: "Active Dogs",
      value: dogCount.toString(),
      highlightColor: "blue",
      trend: "All time",
      loading: dogsLoading
    },
    {
      icon: "heart",
      label: "Active Litters",
      value: recentLittersCount.toString(),
      highlightColor: "green",
      trend: `${littersThisYear} this year`,
      loading: littersLoading
    },
    {
      icon: "bell",
      label: "Reminders",
      value: upcomingRemindersCount.toString(),
      highlightColor: "purple",
      trend: "Due soon",
      loading: remindersLoading
    },
    {
      icon: "calendar",
      label: "Appointments",
      value: nearbyAppointmentsCount.toString(),
      highlightColor: "rose",
      trend: "Next 7 days",
      loading: appointmentsLoading
    }
  ];

  return (
    <div className="space-y-4">
      <UserWelcomeBanner />
      
      <Card>
        <CardContent className="p-6">
          <MetricCardGrid metricCards={metricCards} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHero;
