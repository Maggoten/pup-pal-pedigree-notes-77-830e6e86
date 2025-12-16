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
    <div className="bg-white/70 hover:bg-white/90 transition-colors rounded-lg p-4 flex flex-col items-center justify-center shadow-sm min-h-[120px] h-full w-full">
      <div className="rounded-full bg-warmbeige-100 p-2 mb-2">
        {icon}
      </div>
      <span className="text-xl font-bold text-warmgreen-700 mb-1">{value}</span>
      <span className="text-xs text-warmgreen-600 text-center line-clamp-2">{title}</span>
    </div>
  );

  // If onClick is provided, wrap in a button
  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        className="w-full h-full text-left cursor-pointer"
        aria-label={`View ${title}`}
      >
        {content}
      </button>
    );
  }
  
  // If linkTo is provided, wrap in a Link
  if (linkTo) {
    return <Link to={linkTo} className="h-full">{content}</Link>;
  }

  // Otherwise, just render the content
  return content;
};

export default MetricCard;
