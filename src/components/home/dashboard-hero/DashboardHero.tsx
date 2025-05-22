
import React from 'react';
import { User } from '@/types/auth';
import WelcomeHeader from './WelcomeHeader';
import MetricCardGrid from './MetricCardGrid';
import DecorativePawprints from './DecorativePawprints';

interface DashboardHeroProps {
  user: User | null;
  reminderCount: number;
  plannedLittersCount: number;
  activePregnanciesCount: number;
  recentLittersCount: number;
  onRemindersClick?: () => void;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  user,
  reminderCount,
  plannedLittersCount,
  activePregnanciesCount,
  recentLittersCount,
  onRemindersClick,
}) => {
  return (
    <div className="relative pb-6 mb-12 overflow-hidden bg-gradient-to-r from-warmbeige-200 to-warmbeige-100 rounded-xl px-4 sm:px-6 py-8">
      <DecorativePawprints />
      
      <div className="relative z-10">
        <WelcomeHeader 
          user={user} 
          activePregnanciesCount={activePregnanciesCount} 
        />
        
        <div className="mt-8">
          <MetricCardGrid 
            reminderCount={reminderCount}
            plannedLittersCount={plannedLittersCount}
            activePregnanciesCount={activePregnanciesCount}
            recentLittersCount={recentLittersCount}
            onRemindersClick={onRemindersClick}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
