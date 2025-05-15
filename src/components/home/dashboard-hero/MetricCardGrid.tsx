
import React from 'react';
import MetricCard from './MetricCard';
import { Bell, Calendar, Heart, PawPrint, Dog } from 'lucide-react';

interface MetricCardGridProps {
  reminderCount: number;
  plannedLittersCount: number;
  activePregnanciesCount: number;
  recentLittersCount: number;
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  reminderCount,
  plannedLittersCount,
  activePregnanciesCount,
  recentLittersCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        icon={<Bell className="h-7 w-7 text-warmgreen-700" />}
        title="Reminders" 
        count={reminderCount}
        description="Active tasks & reminders" 
        className="bg-white border border-warmbeige-200 hover:shadow-md transition-all"
      />
      
      <MetricCard 
        icon={<Calendar className="h-7 w-7 text-warmgreen-700" />}
        title="Planned Litters" 
        count={plannedLittersCount}
        description="Upcoming breedings" 
        className="bg-white border border-warmbeige-200 hover:shadow-md transition-all"
      />
      
      <MetricCard 
        icon={<Heart className="h-7 w-7 text-warmgreen-700" />}
        title="Active Pregnancies" 
        count={activePregnanciesCount}
        description="Currently pregnant dogs" 
        className="bg-white border border-warmbeige-200 hover:shadow-md transition-all"
      />
      
      <MetricCard 
        icon={<PawPrint className="h-7 w-7 text-warmgreen-700" />}
        title="Recent Litters" 
        count={recentLittersCount}
        description="Litters in the last 3 months" 
        className="bg-white border border-warmbeige-200 hover:shadow-md transition-all"
      />
    </div>
  );
};

export default MetricCardGrid;
