
import React from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Loader2 } from 'lucide-react';
import MetricCardGrid from './MetricCardGrid';
import WelcomeHeader from './WelcomeHeader';
import DecorativePawprints from './DecorativePawprints';

interface DashboardHeroProps {
  username: string;
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
  isLoadingPregnancies = false,
}) => {
  return (
    <div className="relative rounded-lg bg-warmbeige-100/50 overflow-hidden">
      <div className="px-6 py-12 sm:px-10">
        <WelcomeHeader username={username} />
        
        <div className="mt-8 relative z-10">
          {isLoadingPregnancies ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading statistics...</span>
            </div>
          ) : (
            <MetricCardGrid 
              reminderCount={reminders} 
              plannedLittersCount={plannedLitters} 
              activePregnanciesCount={activePregnancies.length} 
              recentLittersCount={recentLitters} 
            />
          )}
        </div>
      </div>
      
      <DecorativePawprints className="absolute top-0 right-0 z-0 opacity-10" />
    </div>
  );
};

export default DashboardHero;
