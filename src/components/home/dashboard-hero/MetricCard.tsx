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
    <div className="bg-white/70 hover:bg-white/90 transition-colors rounded-lg p-3 flex flex-col items-center justify-center shadow-sm h-20 w-full">
      <div className="rounded-full bg-warmbeige-100 p-2 mb-1">
        {icon}
      </div>
      <span className="text-lg font-semibold text-warmgreen-700">{value}</span>
      <span className="text-xs text-warmgreen-600 text-center leading-tight">{title}</span>
    </div>
  );

  // If onClick is provided, wrap in a button
  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        className="w-full text-left cursor-pointer"
        aria-label={`View ${title}`}
      >
        {content}
      </button>
    );
  }
  
  // If linkTo is provided, wrap in a Link
  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  // Otherwise, just render the content
  return content;
};

export default MetricCard;
