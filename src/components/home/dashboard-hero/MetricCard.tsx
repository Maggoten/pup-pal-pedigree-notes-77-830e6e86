
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
  // Update the icon styles to match the image design
  const getIconStyles = () => {
    // Use warmgreen for all icons as shown in the image
    return { textColor: 'text-warmgreen-600' };
  };

  const renderIcon = () => {
    const { textColor } = getIconStyles();
    
    switch (icon) {
      case 'calendar': return <Calendar className={`h-5 w-5 ${textColor}`} />;
      case 'heart': return <Heart className={`h-5 w-5 ${textColor}`} />;
      case 'pawprint': return <PawPrint className={`h-5 w-5 ${textColor}`} />;
      case 'dog': return <Dog className={`h-5 w-5 ${textColor}`} />;
      default: return null;
    }
  };

  return (
    <button 
      onClick={action}
      className="rounded-xl p-4 md:p-5 bg-white border border-greige-100 transition-transform hover:scale-[1.02] flex flex-col items-start gap-3 w-full text-left shadow-sm"
    >
      <div className={`mb-1 ${getIconStyles().textColor}`}>
        {renderIcon()}
      </div>
      
      <div className="space-y-0">
        <h3 className="text-2xl font-semibold text-darkgray-800 mb-0">
          {loading ? <Skeleton className="h-7 w-16" /> : count}
        </h3>
        <p className="text-sm text-darkgray-600 mt-0">{title}</p>
        {highlight && !loading && (
          <p className="text-xs text-darkgray-400 mt-1">{highlight}</p>
        )}
        {highlight && loading && (
          <Skeleton className="h-4 w-24 mt-1" />
        )}
      </div>
    </button>
  );
};

export default MetricCard;
