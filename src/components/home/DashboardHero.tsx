
import React from 'react';
import StatsCards from './StatsCards';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Dog } from 'lucide-react';

interface DashboardHeroProps {
  username: string;
  activePregnancies: ActivePregnancy[];
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ username, activePregnancies }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-primary/20">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Dog className="h-6 w-6 text-primary" />
              Good day, {username}!
            </h2>
            <p className="text-muted-foreground max-w-md">
              Here's what's happening with your breeding program today. Track pregnancies, 
              manage upcoming events, and monitor your dogs' health.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-medium text-primary/80">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 bg-gradient-to-br from-cream-50 to-cream-100">
        <StatsCards activePregnancies={activePregnancies} />
      </div>
    </div>
  );
};

export default DashboardHero;
