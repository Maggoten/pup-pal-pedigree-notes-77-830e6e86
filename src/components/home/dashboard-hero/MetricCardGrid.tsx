
import React from 'react';
import MetricCard from './MetricCard';

export interface MetricCardProps {
  icon: "calendar" | "heart" | "pawprint" | "dog" | "bell";
  label: string;
  value: string | number | React.ReactNode;
  highlightColor?: "green" | "blue" | "purple" | "rose" | "orange" | string;
  trend?: string | React.ReactNode;
  loading?: boolean;
}

interface MetricCardGridProps {
  metricCards: MetricCardProps[];
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({ metricCards }) => {
  if (!metricCards) {
    return <div>No metrics available</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {metricCards.map((card, index) => (
        <MetricCard
          key={index}
          icon={card.icon as "calendar" | "heart" | "pawprint" | "dog" | "bell"}
          label={card.label}
          value={String(card.value)}
          highlightColor={card.highlightColor as "green" | "blue" | "purple" | "rose" | "orange"}
          trend={card.trend}
          loading={card.loading}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
