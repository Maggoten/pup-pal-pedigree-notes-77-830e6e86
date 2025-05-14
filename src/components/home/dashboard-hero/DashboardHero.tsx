
import React, { useMemo } from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import MetricCardGrid from './MetricCardGrid';
import UserWelcomeBanner from './UserWelcomeBanner';
import DecorativePawprints from './DecorativePawprints';

interface DashboardHeroProps {
  username: string;
  user: User | null;
  reminders: { total: number; incomplete: number; upcoming: number };
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
  const formattedNextHeatDate = useMemo(() => {
    if (!plannedLitters.nextDate) return 'None scheduled';
    
    return new Date(plannedLitters.nextDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [plannedLitters.nextDate]);

  // Format the metrics for the cards
  const metrics = useMemo(() => [
    {
      icon: "bell",
      label: "Reminders",
      value: `${reminders.incomplete}`,
      highlightColor: "text-amber-600",
      trend: `${reminders.upcoming} upcoming`,
      loading: false,
    },
    {
      icon: "calendar",
      label: "Planned Litters",
      value: `${plannedLitters.count}`,
      highlightColor: "text-rose-600",
      trend: `Next heat: ${formattedNextHeatDate}`,
      loading: false,
    },
    {
      icon: "heart",
      label: "Active Pregnancies",
      value: `${isLoadingPregnancies ? '...' : activePregnancies.length}`,
      highlightColor: "text-emerald-600",
      trend: isLoadingPregnancies 
        ? 'Loading...' 
        : `${activePregnancies.length === 0 ? 'None active' : ''}`,
      loading: isLoadingPregnancies,
    },
    {
      icon: "pawprint",
      label: "Recent Litters",
      value: `${recentLitters.count}`,
      highlightColor: "text-blue-600",
      trend: `${recentLitters.recent} this year`,
      loading: false,
    }
  ], [
    reminders.incomplete, 
    reminders.upcoming,
    plannedLitters.count,
    formattedNextHeatDate,
    isLoadingPregnancies,
    activePregnancies.length,
    recentLitters.count,
    recentLitters.recent
  ]);

  return (
    <section className="relative overflow-hidden">
      <DecorativePawprints className="absolute right-0 top-0 w-48 h-48 text-warmbeige-200/50 -z-10" />
      <div className="pb-6">
        <UserWelcomeBanner username={username} user={user} />
        <MetricCardGrid metrics={metrics} />
      </div>
    </section>
  );
};

export default DashboardHero;
