
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import DecorativePawprints from './DecorativePawprints';

const DashboardHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-pink-50 p-6 shadow-sm dark:from-indigo-950/30 dark:to-pink-950/30">
      <DecorativePawprints />
      <div className="relative z-10">
        <WelcomeHeader username="there" />
        <MetricCardGrid 
          reminderCount={0}
          plannedLittersCount={0}
          activePregnanciesCount={0}
          recentLittersCount={0}
        />
      </div>
    </div>
  );
};

export default DashboardHero;
