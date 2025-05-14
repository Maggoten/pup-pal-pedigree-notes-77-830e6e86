
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Dog, CalendarDays, Heart, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export type IconType = 'dog' | 'calendar' | 'heart' | 'bell';

export interface MetricCardProps {
  icon: IconType;
  label: string;
  value: string;
  highlightColor: string;
  trend: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  highlightColor,
  trend,
  loading = false
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'dog':
        return <Dog className="h-5 w-5" />;
      case 'calendar':
        return <CalendarDays className="h-5 w-5" />;
      case 'heart':
        return <Heart className="h-5 w-5" />;
      case 'bell':
        return <Bell className="h-5 w-5" />;
      default:
        return <Dog className="h-5 w-5" />;
    }
  };

  const getColorClass = () => {
    switch (highlightColor) {
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      case 'rose':
        return 'text-rose-600 bg-rose-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-md", getColorClass())}>
          {getIcon()}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-1">{label}</div>
      
      {loading ? (
        <Skeleton className="h-8 w-16 mb-1" />
      ) : (
        <div className="text-2xl font-bold mb-1">{value}</div>
      )}
      
      <div className="text-xs text-gray-500">{trend}</div>
    </div>
  );
};

export default MetricCard;
