
import React from 'react';
import { Link } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  linkTo?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  linkTo,
  onClick,
}) => {
  const content = (
    <div 
      className="bg-white/70 hover:bg-white/90 transition-colors rounded-lg p-3 flex flex-col items-center shadow-sm"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="rounded-full bg-warmbeige-100 p-2 mb-1">
        {icon}
      </div>
      <span className="text-lg font-semibold text-warmgreen-700">{value}</span>
      <span className="text-xs text-warmgreen-600">{title}</span>
    </div>
  );

  if (linkTo && !onClick) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
};

export default MetricCard;
