
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import UserWelcomeBanner from './UserWelcomeBanner';
import MetricCardGrid from './MetricCardGrid';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface DashboardHeroProps {
  username?: string;
  user: User | null;
  reminders: { total: number; incomplete: number; upcoming: number };
  plannedLitters: { count: number; nextDate: Date | null };
  activePregnancies: ActivePregnancy[];
  recentLitters: { count: number; recent: number };
  isLoadingPregnancies: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ 
  username,
  user,
  reminders,
  plannedLitters,
  activePregnancies,
  recentLitters,
  isLoadingPregnancies
}) => {
  // Compute metrics based on the provided data
  const dogCount = 0; // This would come from a dogs context or hook
  const recentLittersCount = recentLitters?.count || 0;
  const littersThisYear = recentLitters?.recent || 0;
  const upcomingRemindersCount = reminders?.upcoming || 0;
  const nearbyAppointmentsCount = 0; // This would come from appointments data
  
  // Loading states
  const littersLoading = false;
  const appointmentsLoading = false;
  const remindersLoading = false;
  const dogsLoading = false;

  const metricCards = [
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
