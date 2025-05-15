
import React from 'react';
import MetricCard, { IconType } from './MetricCard';

export interface MetricCardGridProps {
  reminderCount: number;
  plannedLittersCount: number;
  activePregnanciesCount: number;
  recentLittersCount: number;
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  reminderCount,
  plannedLittersCount,
  activePregnanciesCount,
  recentLittersCount
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Reminders"
        value={reminderCount.toString()}
        description="Active tasks"
        icon="bell"
        trend="neutral"
      />
      <MetricCard
        title="Planned Litters"
        value={plannedLittersCount.toString()}
        description="Upcoming breedings"
        icon="calendar"
        trend="up"
      />
      <MetricCard
        title="Active Pregnancies"
        value={activePregnanciesCount.toString()}
        description="In progress"
        icon="heart"
        trend="neutral"
      />
      <MetricCard
        title="Recent Litters"
        value={recentLittersCount.toString()}
        description="Last 90 days"
        icon="pawprint"
        trend="up"
      />
    </div>
  );
};

export default MetricCardGrid;
