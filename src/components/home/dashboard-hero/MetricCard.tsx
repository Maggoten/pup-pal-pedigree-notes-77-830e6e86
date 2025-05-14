
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Heart, PawPrint, Dog, Bell } from 'lucide-react';

export type MetricIconType = 'calendar' | 'heart' | 'pawprint' | 'dog' | 'bell';

export interface MetricCardProps {
  icon: MetricIconType;
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
  const getIcon = (iconName: MetricIconType) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'heart':
        return <Heart className="h-5 w-5" />;
      case 'pawprint':
        return <PawPrint className="h-5 w-5" />;
      case 'dog':
        return <Dog className="h-5 w-5" />;
      case 'bell':
        return <Bell className="h-5 w-5" />;
      default:
        return <PawPrint className="h-5 w-5" />;
    }
  };

  const getHighlightColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-500';
      case 'green':
        return 'bg-green-100 text-green-500';
      case 'purple':
        return 'bg-purple-100 text-purple-500';
      case 'amber':
        return 'bg-amber-100 text-amber-500';
      case 'rose':
        return 'bg-rose-100 text-rose-500';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${getHighlightColor(highlightColor)}`}>
            {getIcon(icon)}
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
