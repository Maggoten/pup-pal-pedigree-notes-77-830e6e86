
import React from 'react';
import MetricCard from './MetricCard';
import { Dog, Heart, Users, PawPrint } from 'lucide-react';

export interface MetricCardGridProps {
  dogsCount: number;
  activePregnancies: number;
  plannedLitters: number;
  activeLitters: number;
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  dogsCount,
  activePregnancies,
  plannedLitters,
  activeLitters
}) => {
  // Define the metrics to display
  const metrics = [
    {
      title: 'Dogs',
      value: dogsCount,
      icon: 'dog' as const,
      description: 'Registered dogs',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Pregnancies',
      value: activePregnancies,
      icon: 'heart' as const,
      description: 'Active pregnancies',
      color: 'bg-pink-100 text-pink-700'
    },
    {
      title: 'Planned',
      value: plannedLitters,
      icon: 'calendar' as const,
      description: 'Planned litters',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Litters',
      value: activeLitters,
      icon: 'pawprint' as const,
      description: 'Active litters',
      color: 'bg-amber-100 text-amber-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          count={metric.value}
          icon={metric.icon}
          highlight={metric.description}
          action={() => {}}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
