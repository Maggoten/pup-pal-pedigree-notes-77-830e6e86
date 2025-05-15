
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import DecorativePawprints from './DecorativePawprints';
import { useAuth } from '@/context/AuthContext';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface DashboardHeroProps {
  username?: string;
  reminders?: number;
  plannedLitters?: number;
  activePregnancies?: ActivePregnancy[];
  recentLitters?: number;
  isLoadingPregnancies?: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  username,
  reminders = 0,
  plannedLitters = 0,
  activePregnancies = [],
  recentLitters = 0,
  isLoadingPregnancies = false
}) => {
  const { user } = useAuth();
  
  // Use provided username or get from user context
  const displayName = username || user?.firstName || "there";
  
  // Count of active pregnancies
  const activePregnanciesCount = activePregnancies?.length || 0;
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-pink-50 p-6 shadow-sm dark:from-indigo-950/30 dark:to-pink-950/30">
      <DecorativePawprints />
      <div className="relative z-10">
        <WelcomeHeader username={displayName} />
        <MetricCardGrid 
          reminderCount={reminders}
          plannedLittersCount={plannedLitters}
          activePregnanciesCount={activePregnanciesCount}
          recentLittersCount={recentLitters}
        />
      </div>
    </div>
  );
};

export default DashboardHero;
