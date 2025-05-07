
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { UpcomingHeat, RecentMating } from '@/types/reminders';
import UpcomingHeatCard from './UpcomingHeatCard';
import RecentMatingCard from './RecentMatingCard';

interface MatingSectionProps {
  upcomingHeats: UpcomingHeat[];
  recentMatings: RecentMating[];
  onHeatDeleted?: () => void;
}

const MatingSection: React.FC<MatingSectionProps> = ({ 
  upcomingHeats, 
  recentMatings,
  onHeatDeleted
}) => {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-2">Heat Cycles & Recent Matings</h2>
      <p className="text-muted-foreground mb-6">
        Track upcoming heat cycles and manage recent matings
      </p>
      <Separator className="mb-6" />
      
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingHeatCard upcomingHeats={upcomingHeats} onHeatDeleted={onHeatDeleted} />
        <RecentMatingCard recentMatings={recentMatings} />
      </div>
    </section>
  );
};

export default MatingSection;
