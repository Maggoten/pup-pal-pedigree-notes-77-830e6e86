
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
      icon: <Dog className="h-5 w-5" />,
      description: 'Registered dogs',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Pregnancies',
      value: activePregnancies,
      icon: <Heart className="h-5 w-5" />,
      description: 'Active pregnancies',
      color: 'bg-pink-100 text-pink-700'
    },
    {
      title: 'Planned',
      value: plannedLitters,
      icon: <Users className="h-5 w-5" />,
      description: 'Planned litters',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Litters',
      value: activeLitters,
      icon: <PawPrint className="h-5 w-5" />,
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
          value={metric.value}
          icon={metric.icon}
          description={metric.description}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
