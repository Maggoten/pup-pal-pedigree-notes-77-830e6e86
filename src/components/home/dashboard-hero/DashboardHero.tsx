
import React from 'react';
import { User } from '@/types/auth';
import { format } from 'date-fns';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import DecorativePawprints from './DecorativePawprints';

interface DashboardHeroProps {
  username?: string;
  user?: User | null;
  reminders?: {
    count: number;
    highPriority: number;
  };
  plannedLitters?: {
    count: number;
    nextDate: Date | null;
  };
  activePregnancies?: ActivePregnancy[];
  recentLitters?: {
    count: number;
    latest: Date | null;
  };
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
  // Use nullish coalescing to provide default values for objects that might be undefined
  const safeReminders = reminders ?? { count: 0, highPriority: 0 };
  const safePlannedLitters = plannedLitters ?? { count: 0, nextDate: null };
  const safeRecentLitters = recentLitters ?? { count: 0, latest: null };
  
  return (
    <section className="relative bg-gradient-to-br from-warmbeige-50 to-warmbeige-100 py-8 md:py-10 px-6 rounded-xl border border-warmbeige-200 overflow-hidden shadow-sm">
      {/* Decorative elements */}
      <DecorativePawprints />
      
      {/* Welcome header */}
      <WelcomeHeader 
        username={username || 'Breeder'} 
        user={user}
      />
      
      {/* Stats grid */}
      <div className="relative z-10 mt-6">
        <MetricCardGrid 
          remindersCount={safeReminders.count}
          highPriorityCount={safeReminders.highPriority}
          plannedLittersCount={safePlannedLitters.count}
          nextHeatDate={safePlannedLitters.nextDate}
          activePregnanciesCount={activePregnancies?.length || 0}
          isLoadingPregnancies={isLoadingPregnancies}
          recentLittersCount={safeRecentLitters.count}
          recentLitterDate={safeRecentLitters.latest}
        />
      </div>
    </section>
  );
};

export default DashboardHero;
