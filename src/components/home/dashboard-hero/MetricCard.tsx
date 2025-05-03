
import React from 'react';
import { Calendar, Heart, Dog, PawPrint } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  count: number;
  icon: 'calendar' | 'heart' | 'pawprint' | 'dog';
  highlight?: string | null;
  action: () => void;
  color?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  icon,
  highlight = null,
  action,
  color = 'bg-white',
  loading = false
}) => {
  const getIconStyles = () => {
    switch (icon) {
      case 'calendar': return { bgColor: 'bg-warmgreen-100', textColor: 'text-warmgreen-600' };
      case 'heart': return { bgColor: 'bg-rustbrown-100', textColor: 'text-rustbrown-600' };
      case 'pawprint': return { bgColor: 'bg-warmgreen-100', textColor: 'text-warmgreen-600' };
      case 'dog': return { bgColor: 'bg-warmbeige-100', textColor: 'text-warmbeige-600' };
      default: return { bgColor: 'bg-white', textColor: 'text-primary' };
    }
  };

  const renderIcon = () => {
    const { textColor } = getIconStyles();
    
    switch (icon) {
      case 'calendar': return <Calendar className={`h-6 w-6 ${textColor}`} />;
      case 'heart': return <Heart className={`h-6 w-6 ${textColor}`} />;
      case 'pawprint': return <PawPrint className={`h-6 w-6 ${textColor}`} />;
      case 'dog': return <Dog className={`h-6 w-6 ${textColor}`} />;
      default: return null;
    }
  };

  const { bgColor } = getIconStyles();

  return (
    <button 
      onClick={action}
      className={`rounded-xl p-4 md:p-5 border ${color} transition-transform hover:scale-[1.02] flex items-center gap-4 w-full text-left shadow-sm`}
    >
      <div className={`shrink-0 p-2.5 rounded-lg ${bgColor} border border-greige-100`}>
        {renderIcon()}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-darkgray-600">{title}</p>
        
        {loading ? (
          <>
            <Skeleton className="h-7 w-16 mb-1" />
            {highlight && <Skeleton className="h-4 w-24" />}
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-darkgray-800">{count}</h3>
            {highlight && <p className="text-xs text-darkgray-400">{highlight}</p>}
          </>
        )}
      </div>
    </button>
  );
};

export default MetricCard;
