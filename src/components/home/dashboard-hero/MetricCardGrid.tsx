
import React from 'react';
import MetricCard from './MetricCard';
import { Calendar, Check, Dog, Stethoscope } from 'lucide-react';

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard 
        title="Reminders" 
        value={reminderCount} 
        icon={<Check className="h-4 w-4" />} 
        linkTo="/reminders"
      />
      
      <MetricCard 
        title="Planned Litters" 
        value={plannedLittersCount} 
        icon={<Calendar className="h-4 w-4" />} 
        linkTo="/planned-litters"
      />
      
      <MetricCard 
        title="Active Pregnancies" 
        value={activePregnanciesCount} 
        icon={<Stethoscope className="h-4 w-4" />} 
        linkTo="/pregnancy"
      />
      
      <MetricCard 
        title="Recent Litters" 
        value={recentLittersCount} 
        icon={<Dog className="h-4 w-4" />} 
        linkTo="/my-litters"
      />
    </div>
  );
};

export default MetricCardGrid;
