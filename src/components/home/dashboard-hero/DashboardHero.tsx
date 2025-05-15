
import React from 'react';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import DecorativePawprints from './DecorativePawprints';
import { useAuth } from '@/context/AuthContext';

const DashboardHero: React.FC = () => {
  const { user } = useAuth();
  
  // Default values for metrics
  const defaultMetrics = {
    reminderCount: 0,
    plannedLittersCount: 0,
    activePregnanciesCount: 0,
    recentLittersCount: 0
  };
  
  // Get user's first name or default to "there"
  const username = user?.firstName || "there";
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-pink-50 p-6 shadow-sm dark:from-indigo-950/30 dark:to-pink-950/30">
      <DecorativePawprints />
      <div className="relative z-10">
        <WelcomeHeader username={username} />
        <MetricCardGrid 
          reminderCount={defaultMetrics.reminderCount}
          plannedLittersCount={defaultMetrics.plannedLittersCount}
          activePregnanciesCount={defaultMetrics.activePregnanciesCount}
          recentLittersCount={defaultMetrics.recentLittersCount}
        />
      </div>
    </div>
  );
};

export default DashboardHero;
