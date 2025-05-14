
import React from 'react';
import { User } from '@/types/auth';
import UserWelcomeBanner from './UserWelcomeBanner';
import MetricCardGrid from './MetricCardGrid';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface DashboardHeroProps {
  username: string;
  user: User | null;
  reminders: { count: number; highPriority: number };
  plannedLitters: { count: number; nextDate: Date | null };
  activePregnancies: ActivePregnancy[];
  recentLitters: { count: number; recent: number };
  isLoadingPregnancies?: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ 
  username,
  user,
  reminders,
  plannedLitters,
  activePregnancies,
  recentLitters,
  isLoadingPregnancies = false
}) => {
  // Debug logging
  console.log('[DashboardHero] Rendering with data:', { 
    username,
    reminders,
    plannedLitters,
    activePregnancies: activePregnancies?.length,
    recentLitters
  });
  
  // Format the metrics for display
  const metricCards = [
    {
      icon: "bell",
      label: "Reminders",
      value: reminders.count.toString(),
      highlightColor: reminders.highPriority > 0 ? "rose" : "green",
      trend: reminders.highPriority > 0 ? `${reminders.highPriority} high priority` : "No urgent tasks",
      loading: false
    },
    {
      icon: "calendar",
      label: "Planned Litters",
      value: plannedLitters.count.toString(),
      highlightColor: "green",
      trend: plannedLitters.nextDate ? `Next heat: ${plannedLitters.nextDate.toLocaleDateString()}` : "No upcoming heats",
      loading: false
    },
    {
      icon: "heart",
      label: "Active Pregnancies",
      value: activePregnancies?.length.toString() || "0",
      highlightColor: "blue",
      trend: activePregnancies?.length === 1 ? "1 due soon" : activePregnancies?.length > 1 ? `${activePregnancies.length} active` : "None active",
      loading: isLoadingPregnancies
    },
    {
      icon: "pawprint",
      label: "Recent Litters",
      value: recentLitters.count.toString(),
      highlightColor: "purple",
      trend: recentLitters.recent > 0 ? `${recentLitters.recent} this year` : "None this year",
      loading: false
    }
  ];

  return (
    <section className="space-y-6">
      <UserWelcomeBanner 
        username={username}
        user={user}
      />
      
      <MetricCardGrid metricCards={metricCards} />
    </section>
  );
};

export default DashboardHero;
