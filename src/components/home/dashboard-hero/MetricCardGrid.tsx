
import React from 'react';
import MetricCard from './MetricCard';

interface MetricCardData {
  title: string;
  count: number;
  icon: string;
  highlight: string | null;
  action: () => void;
  color: string;
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
          count={card.count}
          icon={card.icon}
          highlight={card.highlight}
          onClick={card.action}
          color={card.color}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default MetricCardGrid;
