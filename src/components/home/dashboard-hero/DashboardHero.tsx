
import React from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Loader2 } from 'lucide-react';
import MetricCardGrid from './MetricCardGrid';
import WelcomeHeader from './WelcomeHeader';

interface DashboardHeroProps {
  username: string;
  reminders?: number;
  plannedLitters?: number;
  activePregnancies?: ActivePregnancy[];
  recentLitters?: number;
  isLoadingPregnancies?: boolean;
  onRemindersClick?: () => void;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  username,
  reminders = 0,
  plannedLitters = 0,
  activePregnancies = [],
  recentLitters = 0,
  isLoadingPregnancies = false,
  onRemindersClick,
}) => {
  return (
    <div className="relative rounded-lg bg-gradient-to-br from-warmbeige-50 to-warmbeige-100 shadow-md overflow-hidden border border-warmbeige-200">
      <div className="px-5 py-6 sm:px-8">
        <WelcomeHeader username={username} />
        
        <div className="mt-4 relative z-10">
          {isLoadingPregnancies ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading statistics...</span>
            </div>
          ) : (
            <MetricCardGrid 
              reminderCount={reminders} 
              plannedLittersCount={plannedLitters} 
              activePregnanciesCount={activePregnancies.length} 
              recentLittersCount={recentLitters} 
              onRemindersClick={onRemindersClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
