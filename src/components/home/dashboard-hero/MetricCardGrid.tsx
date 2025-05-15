
import React from 'react';
import MetricCard from './MetricCard';

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
  recentLittersCount
}) => {
  // Create an array of metric cards
  const metricCards = [
    {
      title: "Reminders",
      count: reminderCount,
      icon: "calendar",
      highlight: reminderCount > 0 ? `${reminderCount} pending` : null,
      action: () => console.log('Navigate to reminders'),
      color: "bg-amber-100"
    },
    {
      title: "Planned Litters",
      count: plannedLittersCount,
      icon: "heart",
      highlight: plannedLittersCount > 0 ? `${plannedLittersCount} planned` : null,
      action: () => console.log('Navigate to planned litters')
    },
    {
      title: "Active Pregnancies",
      count: activePregnanciesCount,
      icon: "pawprint",
      highlight: activePregnanciesCount > 0 ? `${activePregnanciesCount} active` : null,
      action: () => console.log('Navigate to pregnancies')
    },
    {
      title: "Recent Litters",
      count: recentLittersCount,
      icon: "dog",
      highlight: recentLittersCount > 0 ? `${recentLittersCount} recent` : null,
      action: () => console.log('Navigate to litters')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metricCards.map((card, index) => (
        <MetricCard 
          key={index}
          title={card.title}
          count={card.count}
          icon={card.icon as any}
          highlight={card.highlight}
          action={card.action}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
