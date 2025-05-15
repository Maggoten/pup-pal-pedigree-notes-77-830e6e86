
import React from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Loader2, PawPrint } from 'lucide-react';
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
            />
          )}
        </div>
      </div>
      
      {/* Decorative elements similar to the pregnancy page */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <PawPrint className="w-24 h-24 text-warmgreen-700 transform rotate-12" />
      </div>
      
      <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none">
        <PawPrint className="w-16 h-16 text-warmgreen-700 transform -rotate-12" />
      </div>
      
      <DecorativePawprints className="absolute top-0 right-0 z-0 opacity-10" />
    </div>
  );
};

export default DashboardHero;
