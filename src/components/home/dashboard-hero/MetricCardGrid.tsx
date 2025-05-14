
import React from 'react';
import MetricCard from './MetricCard';

export interface MetricCardProps {
  icon: "calendar" | "heart" | "pawprint" | "dog" | "bell";
  label: string;
  value: string;
  highlightColor?: "green" | "blue" | "purple" | "rose" | "orange";
  trend?: string | React.ReactNode;
  loading?: boolean;
}

interface MetricCardGridProps {
  metricCards: MetricCardProps[];
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({ metricCards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {metricCards.map((card, index) => (
        <MetricCard
          key={index}
          icon={card.icon}
          label={card.label}
          value={card.value}
          highlightColor={card.highlightColor}
          trend={card.trend}
          loading={card.loading}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
