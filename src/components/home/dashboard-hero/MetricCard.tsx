
import React from 'react';
import { 
  Bell,
  Calendar,
  PawPrint, 
  Heart as HeartIcon
} from 'lucide-react';

export type IconType = "bell" | "calendar" | "heart" | "pawprint" | "dog";

export interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: IconType;
  trend: "up" | "down" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "bell":
        return <Bell className="h-6 w-6 text-indigo-500" />;
      case "calendar":
        return <Calendar className="h-6 w-6 text-blue-500" />;
      case "heart":
        return <HeartIcon className="h-6 w-6 text-rose-500" />;
      case "pawprint":
        return <PawPrint className="h-6 w-6 text-amber-500" />;
      case "dog":
        return <PawPrint className="h-6 w-6 text-green-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className="rounded-full p-2 bg-indigo-50 dark:bg-indigo-900/30">
          {renderIcon()}
        </div>
      </div>
      
      <div className="mt-3 flex items-center text-xs">
        {trend === "up" && (
          <span className="text-green-500 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Increasing
          </span>
        )}
        {trend === "down" && (
          <span className="text-red-500 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Decreasing
          </span>
        )}
        {trend === "neutral" && (
          <span className="text-gray-500 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
            Stable
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
