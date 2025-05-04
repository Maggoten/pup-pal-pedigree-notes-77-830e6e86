
import React from 'react';
import { Heart, Baby, Dog, PieChart, HomeIcon } from 'lucide-react';

interface StatisticCardProps {
  title: string;
  value: number | string;
  icon: string;
  highlight?: boolean;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, icon, highlight = false }) => {
  // Map icon string to component
  const renderIcon = () => {
    switch (icon) {
      case 'pawprint':
        return <Baby className="h-5 w-5" />;
      case 'home':
        return <HomeIcon className="h-5 w-5" />;
      case 'dogs':
        return <Dog className="h-5 w-5" />;
      case 'heart':
        return <Heart className="h-5 w-5" />;
      default:
        return <PieChart className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-3">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
        highlight ? "text-blue-500 bg-blue-50" : "text-amber-500 bg-amber-50"
      }`}>
        {renderIcon()}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
    </div>
  );
};

export default StatisticCard;
