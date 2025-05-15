
import React, { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  count: number;
  description: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  count,
  description,
  className = "",
}) => {
  return (
    <div className={`p-4 rounded-lg flex flex-col items-center transform transition-transform hover:scale-105 ${className}`}>
      <div className="bg-warmbeige-100 p-3 rounded-full mb-3">
        {icon}
      </div>
      <h3 className="font-medium text-lg">{title}</h3>
      <span className="text-2xl font-bold text-warmgreen-600 mt-1">{count}</span>
      <p className="text-xs text-muted-foreground mt-1 text-center">{description}</p>
    </div>
  );
};

export default MetricCard;
