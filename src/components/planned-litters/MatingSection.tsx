
import React from 'react';
import UpcomingHeatCard from './UpcomingHeatCard';
import RecentMatingsCard from './RecentMatingsCard';
import MatingTipsCard from './MatingTipsCard';
import { UpcomingHeat } from '@/types/reminders';

interface RecentMating {
  id: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

interface MatingSectionProps {
  upcomingHeats: UpcomingHeat[];
  recentMatings: RecentMating[];
}

const MatingSection: React.FC<MatingSectionProps> = ({ upcomingHeats, recentMatings }) => {
  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Mating</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingHeatCard upcomingHeats={upcomingHeats} />
        <RecentMatingsCard recentMatings={recentMatings} />
      </div>
      
      <MatingTipsCard />
    </div>
  );
};

export default MatingSection;
