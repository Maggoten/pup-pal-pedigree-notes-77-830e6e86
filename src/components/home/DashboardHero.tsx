
import React from 'react';
import WelcomeHeader from './dashboard-hero/WelcomeHeader';
import MetricCardGrid from './dashboard-hero/MetricCardGrid';
import DecorativePawprints from './dashboard-hero/DecorativePawprints';

const DashboardHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-pink-50 p-6 shadow-sm dark:from-indigo-950/30 dark:to-pink-950/30">
      <DecorativePawprints />
      <div className="relative z-10">
        <WelcomeHeader />
        <MetricCardGrid />
      </div>
    </div>
  );
};

export default DashboardHero;
