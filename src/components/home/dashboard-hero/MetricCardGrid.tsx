
import React from 'react';
import MetricCard from './MetricCard';

interface MetricCardData {
  title: string;
  count: number;
  icon: 'calendar' | 'heart' | 'pawprint' | 'dog';
  highlight: string | null;
  action: () => void;
  color?: string;
  loading?: boolean;
}

interface MetricCardGridProps {
  metricCards: MetricCardData[];
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({ metricCards }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metricCards.map((card, index) => (
        <MetricCard 
          key={index}
          title={card.title}
          count={card.count ?? 0}
          icon={card.icon}
          highlight={card.highlight}
          action={card.action}
          loading={card.loading}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
