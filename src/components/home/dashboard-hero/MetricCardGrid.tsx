
import React from 'react';
import MetricCard, { MetricCardProps } from './MetricCard';

export interface MetricCardGridProps {
  metricCards: MetricCardProps[];
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({ metricCards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
