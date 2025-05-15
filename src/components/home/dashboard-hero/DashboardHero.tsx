
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import DecorativePawprints from './DecorativePawprints';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

export interface DashboardHeroProps {
  username?: string;
  reminders: number;
  plannedLitters: number;
  activePregnancies: ActivePregnancy[];
  recentLitters: number;
  isLoadingPregnancies?: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  username = "there",
  reminders = 0,
  plannedLitters = 0,
  activePregnancies = [],
  recentLitters = 0,
  isLoadingPregnancies = false
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-pink-50 p-6 shadow-sm dark:from-indigo-950/30 dark:to-pink-950/30">
      <DecorativePawprints />
      <div className="relative z-10">
        <WelcomeHeader username={username} />
        <MetricCardGrid 
          reminderCount={reminders}
          plannedLittersCount={plannedLitters}
          activePregnanciesCount={activePregnancies.length}
          recentLittersCount={recentLitters}
        />
      </div>
    </div>
  );
};

export default DashboardHero;
